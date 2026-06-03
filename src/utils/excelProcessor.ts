import * as XLSX from 'xlsx';
import { StudentRecord, ProcessedData, Filters, CalculatedKPIData, DynamicInsight } from '@/types';
import { normalizeData } from './dataNormalizer';
import { MultiDayTemporalComparisonItem } from './dbProcessor';

// Função auxiliar para converter a data do Excel (que pode ser um número de série) para um formato legível
const convertExcelDate = (excelDate: any): string => {
  if (typeof excelDate === 'number') {
    // Converte o número de série do Excel para uma data JavaScript
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    // Formata para dd/MM/yyyy, garantindo o fuso horário correto (UTC para evitar deslocamentos)
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }
  // Se já for uma string, retorna como está
  return String(excelDate);
};

export const processExcelFile = async (file: File): Promise<ProcessedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        // Usa 'array' (ArrayBuffer) em vez de 'binary' para suportar arquivos grandes corretamente
        const workbook = XLSX.read(data, { type: 'array' });

        // Lê TODAS as abas e mescla os registros em um único conjunto de dados
        let allRawData: any[] = [];
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet);
          if (sheetData.length > 0) {
            allRawData = allRawData.concat(sheetData);
          }
        }

        if (allRawData.length === 0) {
          reject(new Error("O arquivo Excel parece estar vazio."));
          return;
        }

        // Etapa de Normalização
        const jsonData = normalizeData(allRawData).map(record => ({
          ...record,
          DTMATRICULA: record.DTMATRICULA ? convertExcelDate(record.DTMATRICULA) : record.DTMATRICULA
        }));

        // Validação de colunas obrigatórias (mínimo necessário para o dashboard)
        const sampleRecord = jsonData[0];
        const requiredColumns: (keyof StudentRecord)[] = ['SEMESTRE', 'STATUS', 'CURSO'];
        const missingColumns = requiredColumns.filter(col => {
          const val = sampleRecord[col];
          return val === undefined || val === null || val === '';
        });

        if (missingColumns.length > 0) {
          reject(new Error(`Colunas obrigatórias faltando ou mal formatadas: ${missingColumns.join(', ')}. Verifique se os cabeçalhos estão corretos.`));
          return;
        }

        const courses = [...new Set(jsonData.map(r => r.CURSO).filter(Boolean))].sort();
        const statuses = [...new Set(jsonData.map(r => r.STATUS).filter(Boolean))].sort();
        const shifts = [...new Set(jsonData.map(r => r.TURNO).filter(Boolean))].sort();
        const semesters = [...new Set(jsonData.map(r => r.SEMESTRE?.toString()).filter(Boolean))].sort();
        const modalidades = [...new Set(jsonData.map(r => r.MODALIDADE).filter(Boolean))].sort();

        const currentSemester = semesters[semesters.length - 1];

        const firstRecordWithFilial = jsonData.find(r => r.FILIAL && r.FILIAL.trim() !== '');
        const filialName = firstRecordWithFilial ? firstRecordWithFilial.FILIAL : 'UNINASSAU';

        resolve({
          records: jsonData,
          courses,
          statuses,
          shifts,
          semesters,
          modalidades,
          currentSemester,
          filialName
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    // Usa readAsArrayBuffer em vez de readAsBinaryString — mais robusto para arquivos grandes
    reader.readAsArrayBuffer(file);
  });
};

export const filterRecords = (records: StudentRecord[], filters: Filters): StudentRecord[] => {
  return records.filter(record => {
    if (filters.curso && filters.curso !== 'all' && record.CURSO !== filters.curso) return false;
    if (filters.status && filters.status !== 'all') {
      const selectedStatuses = filters.status.split(',').map(s => s.trim().toUpperCase());
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(String(record.STATUS || '').toUpperCase().trim())) return false;
    }
    if (filters.turno && filters.turno !== 'all' && record.TURNO !== filters.turno) return false;
    if (filters.semestre && filters.semestre !== 'all' && record.SEMESTRE?.toString() !== filters.semestre) return false;
    if (filters.modalidade && filters.modalidade !== 'all' && record.MODALIDADE !== filters.modalidade) return false;

    if (filters.semesterType && filters.semesterType !== 'all') {
      const semestre = record.SEMESTRE?.toString();
      if (!semestre) return false;
      const lastDigit = semestre.slice(-1);
      if (lastDigit !== filters.semesterType) return false;
    }

    if (filters.tipoCaptacao && filters.tipoCaptacao !== 'all') {
      if (filters.tipoCaptacao === 'captacao') {
        if (record.QTDCAPTACAO !== 'CAPTAÇÃO') return false;
      } else if (filters.tipoCaptacao === 'rematricula') {
        if (record.QTDCAPTACAO === 'CAPTAÇÃO') return false;
      }
    }

    return true;
  });
};

export const calculateKPIs = (records: StudentRecord[], defaultSemester: string, filters: Filters): CalculatedKPIData => {
  // Prioridade: referenceSemester > semestre filtrado > semestre padrão (mais recente)
  const semesterForAnalysis =
    (filters.referenceSemester && filters.referenceSemester !== 'all')
      ? filters.referenceSemester
      : (filters.semestre && filters.semestre !== 'all')
        ? filters.semestre
        : defaultSemester;
  const currentRecords = filterRecords(records, { ...filters, semestre: semesterForAnalysis });
  const totalStudents = currentRecords.length;

  const currentYear = parseInt(semesterForAnalysis.substring(0, 4));
  const semesterType = semesterForAnalysis.slice(-1);
  const previousSemester = `${currentYear - 1}${semesterType}`;

  const previousRecords = filterRecords(records, { ...filters, semestre: previousSemester });

  const growthRate = previousRecords.length > 0
    ? ((totalStudents - previousRecords.length) / previousRecords.length) * 100
    : (totalStudents > 0 ? 100 : 0);

  const captacaoCount = currentRecords.filter(r => r.QTDCAPTACAO === 'CAPTAÇÃO').length;
  const captacaoRate = totalStudents > 0 ? (captacaoCount / totalStudents) * 100 : 0;

  const activeCount = currentRecords.filter(r => r.STATUS === 'ATIVO').length;
  const retentionRate = totalStudents > 0 ? (activeCount / totalStudents) * 100 : 0;

  const evasaoStatuses = [
    'TRANCADO',
    'CANCELADO',
    'ABANDONO',
    'TRANSFERENCIA PARA EAD',
    'TRANSFERENCIA EXTERNA',
    'TRANSFERENCIA INTERNA',
    'TRANSFERENCIA ENTRE UNIDADES',
    'EVADIDO',
    'DESISTENTE'
  ];
  const evasaoCount = currentRecords.filter(r => {
    const s = String(r.STATUS || '').toUpperCase().trim();
    return evasaoStatuses.some(status => s.includes(status) || status.includes(s));
  }).length;
  const evasaoRate = totalStudents > 0 ? (evasaoCount / totalStudents) * 100 : 0;

  return {
    totalStudents,
    growthRate,
    captacaoRate,
    retentionRate,
    captacaoCount,
    activeCount,
    evasaoCount,
    evasaoRate
  };
};

export const getEvolutionData = (records: StudentRecord[], filters: Filters) => {
  let baseRecords = filterRecords(records, { ...filters, tipoCaptacao: 'all' });

  if (filters.referenceSemester && filters.referenceSemester !== 'all') {
    const refSemType = filters.referenceSemester.slice(-1);
    baseRecords = baseRecords.filter(r => r.SEMESTRE?.toString().slice(-1) === refSemType);
  }

  const semesterGroups = baseRecords.reduce((acc, record) => {
    const sem = record.SEMESTRE?.toString();
    if (!sem) return acc;

    if (!acc[sem]) {
      acc[sem] = { total: 0, captacao: 0 };
    }

    acc[sem].total++;
    if (record.QTDCAPTACAO === 'CAPTAÇÃO') {
      acc[sem].captacao++;
    }

    return acc;
  }, {} as Record<string, { total: number; captacao: number }>);

  return Object.entries(semesterGroups)
    .map(([semestre, data]) => {
      const rematricula = data.total - data.captacao;
      const formattedSemester = formatSemester(semestre);

      switch (filters.tipoCaptacao) {
        case 'captacao':
          return { semestre: formattedSemester, captacao: data.captacao };
        case 'rematricula':
          return { semestre: formattedSemester, rematricula: rematricula };
        default:
          return { semestre: formattedSemester, alunos: data.total, captacao: data.captacao };
      }
    })
    .sort((a, b) => a.semestre.localeCompare(b.semestre));
};

export const getComparativeData = (records: StudentRecord[], currentSemester: string, filters: Filters) => {
  const semesterForComparison = (filters.referenceSemester && filters.referenceSemester !== 'all')
    ? filters.referenceSemester
    : currentSemester;

  const semesterType = semesterForComparison.slice(-1);

  const equivalentSemesters = [...new Set(records.map(r => r.SEMESTRE?.toString()).filter(Boolean))]
    .filter(sem => sem.slice(-1) === semesterType)
    .sort();

  return equivalentSemesters.map(sem => {
    const semesterRecords = filterRecords(
      records.filter(r => r.SEMESTRE?.toString() === sem),
      { ...filters, semestre: undefined, referenceSemester: undefined } // Limpa filtros de semestre para não interferir
    );

    return {
      ano: formatSemester(sem),
      alunos: semesterRecords.length
    };
  });
};

export const getDistributionData = (records: StudentRecord[], filters: Filters, currentSemester: string) => {
  const semesterToFilter = (filters.semestre && filters.semestre !== 'all') ? filters.semestre : currentSemester;
  const filteredRecords = filterRecords(records, { ...filters, semestre: semesterToFilter });

  const distribution = filteredRecords.reduce((acc, record) => {
    const turno = record.TURNO || 'Não informado';
    acc[turno] = (acc[turno] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }));
};

export const getCourseDistributionData = (records: StudentRecord[], filters: Filters, currentSemester: string) => {
  const semesterToFilter = (filters.semestre && filters.semestre !== 'all') ? filters.semestre : currentSemester;
  const filteredRecords = filterRecords(records, { ...filters, semestre: semesterToFilter });

  const distribution = filteredRecords.reduce((acc, record) => {
    const curso = record.CURSO || 'Não informado';
    acc[curso] = (acc[curso] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getTopMatriculationDates = (records: StudentRecord[], filters: Filters, currentSemester: string) => {
  const semesterToFilter = (filters.semestre && filters.semestre !== 'all') ? filters.semestre : currentSemester;
  const filteredRecords = filterRecords(records, { ...filters, semestre: semesterToFilter });

  const dateCounts = filteredRecords.reduce((acc, record) => {
    const formattedDate = record.DTMATRICULA;
    if (formattedDate) {
      acc[formattedDate] = (acc[formattedDate] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
};

const formatSemester = (semester: string): string => {
  if (!semester || semester.length < 5) return semester;
  const year = semester.substring(0, 4);
  const sem = semester.slice(-1);
  return `${year}.${sem}`;
};

// Helper function to find the top course in a given set of records
const getTopCourseForFilteredData = (records: StudentRecord[]): { name: string, count: number } | null => {
  if (records.length === 0) return null;
  const courseCounts = records.reduce((acc, r) => {
    const curso = r.CURSO || 'Não informado';
    acc[curso] = (acc[curso] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];
  return topCourse ? { name: topCourse[0], count: topCourse[1] } : null;
};

export const generateDynamicInsights = (
  processedData: ProcessedData,
  kpiData: CalculatedKPIData,
  filters: Filters
): DynamicInsight[] => {
  const insights: DynamicInsight[] = [];

  const semesterForAnalysis = (filters.semestre && filters.semestre !== 'all')
    ? filters.semestre
    : processedData.currentSemester;

  const filteredRecords = filterRecords(processedData.records, { ...filters, semestre: semesterForAnalysis });
  const totalFiltered = filteredRecords.length;

  // Insight 1: Comparativo com Semestre de Referência (SEMPRE NO TOPO SE ATIVO)
  if (filters.referenceSemester && filters.referenceSemester !== 'all' && filters.referenceSemester !== semesterForAnalysis) {
    const refSemesterRecords = filterRecords(processedData.records, { ...filters, semestre: filters.referenceSemester });
    const refTotal = refSemesterRecords.length;
    const currentTotal = filteredRecords.length;

    if (refTotal > 0) {
      const change = currentTotal - refTotal;
      const percentageChange = (change / refTotal) * 100;
      const formattedRefSemester = formatSemester(filters.referenceSemester);
      const formattedCurrentSemester = formatSemester(semesterForAnalysis);

      if (Math.abs(percentageChange) > 1) { // Only show if there's a meaningful change
        insights.push({
          icon: percentageChange > 0 ? 'ArrowUpRight' : 'ArrowDownLeft',
          type: percentageChange > 0 ? 'success' : 'danger',
          title: `Comparativo: ${formattedCurrentSemester} vs ${formattedRefSemester}`,
          description: `Houve uma ${percentageChange > 0 ? 'aumento' : 'queda'} de ${Math.abs(percentageChange).toFixed(1)}% (${Math.abs(change)} alunos) em relação ao semestre de referência.`,
        });
      }
    }
  }

  // Insight 2: Crescimento geral (em relação ao período anterior)
  if (Math.abs(kpiData.growthRate) > 5) { // Only show if growth is significant
    insights.push({
      icon: kpiData.growthRate > 0 ? 'TrendingUp' : 'TrendingDown',
      type: kpiData.growthRate > 0 ? 'success' : 'danger',
      title: kpiData.growthRate > 0 ? 'Crescimento Expressivo' : 'Redução no Nº de Alunos',
      description: `A seleção atual mostra uma ${kpiData.growthRate > 0 ? 'aumento' : 'queda'} de ${Math.abs(kpiData.growthRate).toFixed(1)}% em comparação ao período anterior equivalente.`,
    });
  }

  // Insight 3: Análise de Curso (Adaptativo)
  if (filters.curso && filters.curso !== 'all') {
    // Insight focado no curso selecionado
    const captacaoInCourse = filteredRecords.filter(r => r.QTDCAPTACAO === 'CAPTAÇÃO').length;
    const captacaoPercentage = totalFiltered > 0 ? (captacaoInCourse / totalFiltered) * 100 : 0;
    insights.push({
      icon: 'Focus',
      type: 'primary',
      title: `Análise do Curso: ${filters.curso}`,
      description: `Este curso possui ${totalFiltered} alunos na seleção. Desses, ${captacaoPercentage.toFixed(0)}% são de captação (novos alunos).`
    });
  } else if (totalFiltered > 0) {
    // Insight geral sobre o curso de destaque
    const courseCounts = filteredRecords.reduce((acc, r) => {
      const curso = r.CURSO || 'Não informado';
      acc[curso] = (acc[curso] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCourse) {
      insights.push({
        icon: 'Users',
        type: 'primary',
        title: 'Curso Destaque',
        description: `O curso de ${topCourse[0]} é o mais populoso na seleção atual, com ${topCourse[1]} alunos, representando ${((topCourse[1] / totalFiltered) * 100).toFixed(0)}% do total.`,
      });
    }
  }

  // Insight 4: Perfil de Matrícula (Adaptativo)
  if (filters.tipoCaptacao && filters.tipoCaptacao !== 'all') {
    // Insight focado no tipo de captação
    const topCourseInFilter = getTopCourseForFilteredData(filteredRecords);
    if (topCourseInFilter) {
      insights.push({
        icon: filters.tipoCaptacao === 'captacao' ? 'UserPlus' : 'UserCheck',
        type: 'primary',
        title: `Análise de ${filters.tipoCaptacao === 'captacao' ? 'Captação' : 'Rematrícula'}`,
        description: `Para este filtro, o curso de ${topCourseInFilter.name} se destaca com ${topCourseInFilter.count} alunos.`
      });
    }
  } else if (totalFiltered > 20) {
    // Insight geral sobre o perfil
    const captacaoPercentage = kpiData.captacaoRate;
    if (captacaoPercentage > 65) {
      insights.push({
        icon: 'UserPlus',
        type: 'primary',
        title: 'Perfil de Novos Alunos',
        description: `A maioria (${captacaoPercentage.toFixed(0)}%) dos alunos nesta seleção são de captação (novas matrículas).`,
      });
    } else if (captacaoPercentage < 35) {
      insights.push({
        icon: 'UserCheck',
        type: 'primary',
        title: 'Perfil de Veteranos',
        description: `A base de alunos é de rematrículas (${(100 - captacaoPercentage).toFixed(0)}%), indicando boa retenção.`,
      });
    }
  }

  // Insight 5: Análise de Turno (Adaptativo)
  if (filters.turno && filters.turno !== 'all') {
    // Insight focado no turno selecionado
    const topCourseInShift = getTopCourseForFilteredData(filteredRecords);
    if (topCourseInShift) {
      insights.push({
        icon: 'Clock',
        type: 'primary',
        title: `Análise do Turno: ${filters.turno}`,
        description: `Neste turno, o curso de ${topCourseInShift.name} é o mais representativo, com ${topCourseInShift.count} alunos.`
      });
    }
  } else if (totalFiltered > 10) {
    // Insight geral sobre o turno de destaque
    const shiftCounts = filteredRecords.reduce((acc, r) => {
      const shift = r.TURNO || 'Não informado';
      acc[shift] = (acc[shift] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topShift = Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0];
    if (topShift) {
      const topShiftPercentage = (topShift[1] / totalFiltered) * 100;
      if (topShiftPercentage > 60) {
        insights.push({
          icon: 'Clock',
          type: 'primary',
          title: 'Preferência de Turno',
          description: `O turno da ${topShift[0]} é o preferido, concentrando ${topShiftPercentage.toFixed(0)}% dos alunos.`,
        });
      }
    }
  }

  // Remove duplicatas por título para não poluir a tela
  const uniqueInsights = Array.from(new Map(insights.map(item => [item.title, item])).values());

  return uniqueInsights.slice(0, 4); // Retorna os 4 insights mais relevantes
};


export const getPeriodDistributionData = (records: StudentRecord[], filters: Filters, currentSemester: string) => {
  const semesterToFilter = (filters.semestre && filters.semestre !== 'all') ? filters.semestre : currentSemester;
  const filteredRecords = filterRecords(records, { ...filters, semestre: semesterToFilter });

  const distribution = filteredRecords.reduce((acc, record) => {
    const periodValue = record.PERIODO;
    if (periodValue === null || periodValue === undefined || String(periodValue).trim() === '') {
      return acc;
    }
    const periodName = `${periodValue}º Período`;
    acc[periodName] = (acc[periodName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value, sortKey: parseInt(name) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ name, value }) => ({ name, value }));
};

const parseDateToISO = (dateVal: any): string | null => {
  if (!dateVal) return null;
  const str = String(dateVal).trim();
  if (!str) return null;

  // Se já for formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // Se for DD/MM/YYYY
  const partsBr = str.split('/');
  if (partsBr.length === 3) {
    const day = partsBr[0].padStart(2, '0');
    const month = partsBr[1].padStart(2, '0');
    let year = partsBr[2];
    if (year.length === 2) year = '20' + year; // fallback
    return `${year}-${month}-${day}`;
  }

  // Fallback via Date.parse
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}

  return null;
};

export const getLocalTemporalComparison = (
  records: StudentRecord[],
  currentSemester: string,
  filters: Filters
): MultiDayTemporalComparisonItem[] => {
  // 1. Limpamos o semestre dos filtros para podermos analisar múltiplos semestres
  const filtersWithoutSemester = {
    ...filters,
    semestre: undefined,
    referenceSemester: undefined
  };

  // 2. Filtramos todos os registros com os demais filtros (curso, turno, modalidade, status)
  const filteredRecords = filterRecords(records, filtersWithoutSemester);

  // 3. Determinamos as safras/semestres de comparação
  // Se o semestre atual termina com '1' ou '2', queremos os semestres correspondentes dos anos anteriores
  const semType = currentSemester.slice(-1);
  const currentYear = parseInt(currentSemester.substring(0, 4));
  const targetSemesters = [
    currentSemester,
    `${currentYear - 1}${semType}`,
    `${currentYear - 2}${semType}`,
    `${currentYear - 3}${semType}`
  ];

  // 4. Filtramos os registros pertencentes aos semestres de comparação e fazemos o parse das datas
  const recordsInTargetSemesters = filteredRecords.filter(r => 
    r.SEMESTRE && targetSemesters.includes(r.SEMESTRE.toString())
  );

  const parsedRecords = recordsInTargetSemesters.map(r => ({
    ...r,
    parsedDate: parseDateToISO(r.DTMATRICULA)
  })).filter(r => r.parsedDate !== null) as (StudentRecord & { parsedDate: string })[];

  // 5. Encontramos a data de referência no semestre atual
  const currentSemesterRecords = parsedRecords.filter(r => r.SEMESTRE?.toString() === currentSemester);
  let refDateStr = '';
  if (currentSemesterRecords.length > 0) {
    // Pegamos a maior data de matrícula no semestre atual
    const dates = currentSemesterRecords.map(r => r.parsedDate);
    refDateStr = dates.reduce((max, d) => d > max ? d : max, dates[0]);
  } else {
    // Se não houver dados no semestre atual, pegamos a maior data do conjunto inteiro, ou hoje
    const dates = parsedRecords.map(r => r.parsedDate);
    if (dates.length > 0) {
      refDateStr = dates.reduce((max, d) => d > max ? d : max, dates[0]);
    } else {
      refDateStr = new Date().toISOString().split('T')[0];
    }
  }

  // 6. Geramos os últimos 15 dias a partir da data de referência
  const refDate = new Date(refDateStr + 'T00:00:00');
  const last15Days: { dateStr: string; monthDay: string; weekday: string }[] = [];
  const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 14; i >= 0; i--) {
    const d = new Date(refDate.getTime());
    d.setDate(refDate.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    last15Days.push({
      dateStr: `${yyyy}-${mm}-${dd}`,
      monthDay: `${dd}/${mm}`,
      weekday: weekdayNames[d.getDay()]
    });
  }

  // 7. Agrupamos e contamos os registros por dia equivalente em cada semestre
  const results: MultiDayTemporalComparisonItem[] = [];

  for (const sem of targetSemesters) {
    const semYear = sem.substring(0, 4);
    const semRecords = parsedRecords.filter(r => r.SEMESTRE?.toString() === sem);

    for (const day of last15Days) {
      // O dia equivalente para este semestre é o mesmo mês/dia, mas com o ano do semestre
      const [dd, mm] = day.monthDay.split('/');
      const equivDateStr = `${semYear}-${mm}-${dd}`;

      // Contamos quantos alunos matricularam nesse dia
      const count = semRecords.filter(r => r.parsedDate === equivDateStr).length;

      results.push({
        ref_day_month: day.monthDay,
        weekday_name: day.weekday,
        semester_id: sem,
        student_count: count,
        sort_date: day.dateStr // Para ordenação na tabela, mantemos o dia relativo do ano atual
      });
    }
  }

  return results;
};