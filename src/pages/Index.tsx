import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KPICard from "@/components/KPICard";
import EvolutionChart from "@/components/charts/EvolutionChart";
import ComparativeChart from "@/components/charts/ComparativeChart";
import DistributionChart from "@/components/charts/DistributionChart";
import CourseDistributionChart from "@/components/charts/CourseDistributionChart";
import PeriodDistributionChart from "@/components/charts/PeriodDistributionChart";
import TemporalComparisonTable from "@/components/TemporalComparisonTable";
import TopFilters from "@/components/TopFilters";
import InsightsPanel from "@/components/InsightsPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import RankingsSection from "@/components/RankingsSection";
import { Users, TrendingUp, UserPlus, UserX, Database } from "lucide-react";
import { Filters, CalculatedKPIData, DynamicInsight } from "@/types";
import { calculateKPIs, getEvolutionData, getComparativeData, getDistributionData, generateDynamicInsights, getCourseDistributionData, getTopMatriculationDates, getPeriodDistributionData, filterRecords } from "@/utils/excelProcessor";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

const initialFilters: Filters = {
  semesterType: 'all',
  tipoCaptacao: 'all',
  modalidade: 'PRESENCIAL',
  status: 'MATRICULADO'
};

const Index = () => {
  const { processedData, setProcessedData, isAnalyticLoading, refreshData } = useData();
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState<string | null>(null);

  const handleLoadSavedData = useCallback(async (unitId: string) => {
    if (!unitId) return;
    setHasAttemptedInitialLoad(unitId);
    await refreshData(unitId);
  }, [refreshData]);

  useEffect(() => {
    const unitId = profile?.current_unidade_id;
    if (user && unitId && !processedData && !isAnalyticLoading && hasAttemptedInitialLoad !== unitId) {
      handleLoadSavedData(unitId);
    }
  }, [user, profile?.current_unidade_id, processedData, isAnalyticLoading, handleLoadSavedData, hasAttemptedInitialLoad]);

  useEffect(() => {
    if (processedData) {
      setFilters(prevFilters => ({
        ...prevFilters,
        referenceSemester: processedData.currentSemester,
      }));
    }
  }, [processedData]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearAllFilters = () => {
    setFilters(initialFilters);
    toast.info("Filtros redefinidos para o padrão.");
  };

  const semesterForAnalysis = useMemo(() => {
    if (filters.referenceSemester && filters.referenceSemester !== 'all') {
      return filters.referenceSemester;
    }
    return (filters.semestre && filters.semestre !== 'all')
      ? filters.semestre
      : processedData?.currentSemester || '';
  }, [filters.semestre, filters.referenceSemester, processedData?.currentSemester]);

  const availableCoursesForFilter = useMemo(() => {
    if (!processedData) return [];
    const recordsWithoutCourseFilter = filterRecords(processedData.records, {
      ...filters,
      curso: undefined,
    });
    return [...new Set(recordsWithoutCourseFilter.map(r => r.CURSO).filter(Boolean))].sort();
  }, [processedData, filters]);

  const kpiData: CalculatedKPIData | null = useMemo(() => {
    if (!processedData || !semesterForAnalysis) return null;
    return calculateKPIs(processedData.records, processedData.currentSemester, filters);
  }, [processedData, filters, semesterForAnalysis]);

  const evolutionData = useMemo(() => {
    if (!processedData) return [];
    return getEvolutionData(processedData.records, filters);
  }, [processedData, filters]);

  const referenceData = useMemo(() => {
    if (!filters.referenceSemester || filters.referenceSemester === 'all' || !evolutionData.length) return null;
    const dataKey = filters.tipoCaptacao === 'captacao' ? 'captacao' :
      filters.tipoCaptacao === 'rematricula' ? 'rematricula' : 'alunos';
    const refRecord = evolutionData.find(d => d.semestre.replace('.', '') === filters.referenceSemester);
    return refRecord ? { value: refRecord[dataKey], label: refRecord.semestre } : null;
  }, [evolutionData, filters.referenceSemester, filters.tipoCaptacao]);

  const referenceCaptacaoData = useMemo(() => {
    if (filters.tipoCaptacao !== 'all' || !filters.referenceSemester || filters.referenceSemester === 'all' || !evolutionData.length) return null;
    const refRecord = evolutionData.find(d => d.semestre.replace('.', '') === filters.referenceSemester);
    return refRecord ? { value: refRecord.captacao, label: refRecord.semestre } : null;
  }, [evolutionData, filters.referenceSemester, filters.tipoCaptacao]);

  const comparativeData = useMemo(() => {
    if (!processedData) return [];
    return getComparativeData(processedData.records, processedData.currentSemester, filters);
  }, [processedData, filters]);

  const comparisonPeriodLabel = useMemo(() => {
    const semesterForComparison = (filters.referenceSemester && filters.referenceSemester !== 'all')
      ? filters.referenceSemester : processedData?.currentSemester;
    if (!semesterForComparison) return "períodos equivalentes";
    return semesterForComparison.slice(-1) === '1' ? "primeiros semestres" : "segundos semestres";
  }, [filters.referenceSemester, processedData?.currentSemester]);

  const distributionData = useMemo(() => {
    if (!processedData || !semesterForAnalysis) return [];
    return getDistributionData(processedData.records, filters, semesterForAnalysis);
  }, [processedData, filters, semesterForAnalysis]);

  const courseDistributionData = useMemo(() => {
    if (!processedData || !semesterForAnalysis) return [];
    return getCourseDistributionData(processedData.records, filters, semesterForAnalysis);
  }, [processedData, filters, semesterForAnalysis]);

  const periodDistributionData = useMemo(() => {
    if (!processedData || !semesterForAnalysis) return [];
    return getPeriodDistributionData(processedData.records, filters, semesterForAnalysis);
  }, [processedData, filters, semesterForAnalysis]);

  const dynamicInsights: DynamicInsight[] = useMemo(() => {
    if (!processedData || !kpiData) return [];
    return generateDynamicInsights(processedData, kpiData, filters);
  }, [processedData, kpiData, filters]);

  const coursesInSemester = useMemo(() => {
    if (!processedData || !semesterForAnalysis) return [];
    const semesterRecords = processedData.records.filter(r => r.SEMESTRE?.toString() === semesterForAnalysis);

    // Filtra cursos que realmente têm atividade (Matrícula, Pré-Web ou Captação)
    const activeCourses = semesterRecords.filter(r =>
      r.STATUS === 'MATRICULADO' ||
      r.STATUS === 'PRÉ-MATRICULA WEB' ||
      r.QTDCAPTACAO === 'CAPTAÇÃO'
    ).map(r => r.CURSO);

    return [...new Set(activeCourses.filter(Boolean))].sort();
  }, [processedData, semesterForAnalysis]);

  const formatSemester = (semester: string): string => {
    if (!semester || semester.length < 5) return semester;
    return `${semester.substring(0, 4)}.${semester.slice(-1)}`;
  };

  const overviewSubtitle = useMemo(() => {
    if (!semesterForAnalysis) return "Aguardando dados...";
    const formatted = formatSemester(semesterForAnalysis);
    if (filters.semestre && filters.semestre !== 'all') {
      return `Exibindo dados do semestre selecionado: ${formatted}`;
    }
    return `Dados referentes ao semestre mais recente: ${formatted}`;
  }, [semesterForAnalysis, filters.semestre]);

  const statusDescription = useMemo(() => {
    if (filters.status && filters.status !== 'all') {
      return `Status: ${filters.status}`;
    }
    return `Todos os Status`;
  }, [filters.status]);

  if (isAnalyticLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header isDataLoaded={!!processedData} onFileUpdate={async () => { }} isUpdating={false} />
        <main className="flex-grow container mx-auto px-6 py-8">
          <LoadingSpinner message="Carregando dados da unidade..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        isDataLoaded={!!processedData}
        filialName={processedData?.filialName}
        onFileUpdate={async () => { }}
        isUpdating={false}
      />

      {processedData && (
        <TopFilters
          onFilterChange={handleFilterChange}
          onClearAllFilters={handleClearAllFilters}
          courses={availableCoursesForFilter}
          statuses={processedData.statuses}
          shifts={processedData.shifts}
          semesters={processedData.semesters}
          modalidades={processedData.modalidades}
          currentFilters={filters}
        />
      )}

      <main className="flex-grow container mx-auto px-6 py-4">
        {user && (
          <div className="animate-fade-in space-y-8">
            <section id="visao-geral">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#003366]">Visão Geral do Dashboard</h2>
                  <p className="text-muted-foreground text-sm">
                    {processedData ? (`${overviewSubtitle} | ${statusDescription}`) : ("Nenhum dado encontrado para a unidade selecionada.")}
                  </p>
                </div>
              </div>

              {!processedData ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white/50 border-2 border-dashed border-[#003366]/10 rounded-3xl">
                  <Database className="h-16 w-16 text-[#003366]/20 mb-4" />
                  <h3 className="text-xl font-bold text-[#003366]">Unidade sem Dados</h3>
                  <p className="text-muted-foreground text-center max-w-xs mb-8">
                    Esta unidade ainda não possui registros no sistema. Utilize o botão "Importar Planilha" no topo para começar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard
                    title="Total de Alunos"
                    value={kpiData?.totalStudents.toLocaleString('pt-BR') || '0'}
                    icon={Users}
                    trend={kpiData?.growthRate || 0}
                    trendLabel={`vs. semestre anterior`}
                    variant="default"
                    valueDescription={`${statusDescription} em ${formatSemester(semesterForAnalysis)}`}
                  />
                  <KPICard
                    title="Crescimento"
                    value={`${kpiData?.growthRate.toFixed(1)}%`}
                    icon={TrendingUp}
                    trend={kpiData?.growthRate || 0}
                    trendLabel="vs. ano anterior"
                    variant={kpiData && kpiData.growthRate >= 0 ? "success" : "danger"}
                  />
                  <KPICard
                    title="Captação (Novos Alunos)"
                    value={kpiData?.captacaoCount.toLocaleString('pt-BR') || '0'}
                    icon={UserPlus}
                    trend={kpiData?.captacaoRate || 0}
                    trendLabel={`${kpiData?.captacaoRate.toFixed(1)}% do total`}
                    variant="warning"
                  />
                  <KPICard
                    title="Evasão Total"
                    value={kpiData?.evasaoCount.toLocaleString('pt-BR') || '0'}
                    icon={UserX}
                    trend={kpiData?.evasaoRate || 0}
                    trendLabel={`${kpiData?.evasaoRate.toFixed(1)}% do total`}
                    variant="danger"
                  />
                </div>
              )}
            </section>

            {processedData && (
              <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section id="matriculas">
                  <TemporalComparisonTable
                    currentSemester={semesterForAnalysis}
                    filters={filters}
                  />
                </section>

                <section id="evolucao">
                  <EvolutionChart
                    data={evolutionData}
                    filters={filters}
                    referenceData={referenceData?.value}
                    referenceSemesterLabel={referenceData?.label}
                    referenceCaptacaoData={referenceCaptacaoData?.value}
                  />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section id="comparativo">
                    <ComparativeChart data={comparativeData} comparisonPeriodLabel={comparisonPeriodLabel} />
                  </section>
                  <section id="distribuicao-status">
                    <DistributionChart data={distributionData} />
                  </section>
                </div>

                <section id="distribuicao-cursos">
                  <CourseDistributionChart data={courseDistributionData} />
                </section>

                {/* 
                <section id="rankings">
                  <RankingsSection
                    records={processedData.records}
                    unidadeId={profile?.current_unidade_id || ""}
                    semesterForAnalysis={semesterForAnalysis}
                    courses={coursesInSemester}
                    filters={filters}
                  />
                </section>
                */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <PeriodDistributionChart data={periodDistributionData} />
                  </div>
                  <div className="lg:col-span-1">
                    <InsightsPanel insights={dynamicInsights} />
                  </div>
                </div>

                <div className="mt-8 text-center text-xs text-muted-foreground border-t pt-4">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')} • Semestre: {processedData.currentSemester.substring(0, 4)}.{processedData.currentSemester.slice(-1)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;