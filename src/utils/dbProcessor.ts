import { supabase } from "@/integrations/supabase/client";
import { StudentRecord, ProcessedData } from "@/types";

export const fetchRecordsFromDb = async (unidadeId: string): Promise<StudentRecord[]> => {
    let allRecords: any[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('alunos_registros')
            .select('*')
            .eq('unidade_id', unidadeId)
            .range(from, from + step - 1);

        if (error) {
            console.error("Erro ao buscar registros do banco:", error);
            throw error;
        }

        if (data && data.length > 0) {
            allRecords = [...allRecords, ...data];
            from += step;
            // Se o retorno for menor que o passo, chegamos ao fim
            if (data.length < step) hasMore = false;
        } else {
            hasMore = false;
        }

        // Proteção contra loops infinitos em desenvolvimento
        if (from > 100000) break;
    }

    return allRecords.map(r => ({
        CODCOLIGADA: r.codcoligada,
        CODFILIAL: r.cp_filial,
        FILIAL: r.filial,
        SEMESTRE: r.semestre,
        CURSO: r.curso,
        HABILITACAO: r.habilitacao,
        RA: r.ra,
        ALUNO: r.aluno,
        CPF: r.cpf,
        EMAIL: r.email,
        CEP: r.cep,
        RUA: r.rua,
        NUMERO: r.numero,
        BAIRRO: r.bairro,
        TELEFONE1: r.telefone1,
        TELEFONE2: r.telefone2,
        DTMATRICULA: r.dtmatricula,
        QTDCAPTACAO: r.qtdcaptacao,
        TIPOINGRESSO: r.tipoingresso,
        TURNO: r.turno,
        PERIODO: r.periodo,
        STATUS: r.status,
        CODTURMA: r.codturma,
        CODPOLO: r.codpolo,
        POLO: r.polo,
        CIDADE: r.cidade,
        MODALIDADE: r.modalidade,
    } as StudentRecord));
};

export const upsertRecordsToDb = async (unidadeId: string, records: StudentRecord[]) => {
    if (!unidadeId) throw new Error("ID da unidade é obrigatório para o upload.");

    // Fragmentar em lotes para evitar erros de limite de payload
    const batchSize = 300;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize).map(r => ({
            unidade_id: unidadeId,
            ra: String(r.RA),
            semestre: String(r.SEMESTRE),
            codcoligada: r.CODCOLIGADA,
            cp_filial: r.CODFILIAL,
            filial: r.FILIAL,
            curso: r.CURSO,
            habilitacao: r.HABILITACAO,
            aluno: r.ALUNO,
            cpf: r.CPF,
            email: r.EMAIL,
            cep: r.CEP,
            rua: r.RUA,
            numero: r.NUMERO,
            bairro: r.BAIRRO,
            telefone1: r.TELEFONE1,
            telefone2: r.TELEFONE2,
            dtmatricula: r.DTMATRICULA,
            qtdcaptacao: r.QTDCAPTACAO,
            tipoingresso: r.TIPOINGRESSO,
            turno: r.TURNO,
            periodo: r.PERIODO,
            status: r.STATUS,
            codturma: r.CODTURMA,
            codpolo: r.CODPOLO,
            polo: r.POLO,
            cidade: r.CIDADE,
            modalidade: r.MODALIDADE,
        }));

        const { error } = await supabase
            .from('alunos_registros')
            .upsert(batch, {
                onConflict: 'ra,semestre,unidade_id'
            });

        if (error) {
            console.error("Erro no UPSERT:", error);
            throw error;
        }
    }
};

export interface TemporalComparisonItem {
    semester: string;
    student_count: number;
}

export const fetchTemporalComparison = async (
    unidadeId: string,
    currentSemester: string,
    refDay: number,
    refMonth: number
): Promise<TemporalComparisonItem[]> => {
    const { data, error } = await supabase.rpc('get_temporal_comparison', {
        p_unidade_id: unidadeId,
        p_current_semester: currentSemester,
        p_ref_day: refDay,
        p_ref_month: refMonth
    });

    if (error) {
        console.error("Erro ao buscar comparativo temporal:", error);
        throw error;
    }

    return data || [];
};

export interface MultiDayTemporalComparisonItem {
    ref_day_month: string;
    weekday_name: string;
    semester_id: string;
    student_count: number;
    sort_date: string;
}

import { Filters } from "@/types";

export const fetchMultiDayTemporalComparison = async (
    unidadeId: string,
    currentSemester: string,
    refDate: string,
    filters: Filters
): Promise<MultiDayTemporalComparisonItem[]> => {
    try {
        const semesterClean = currentSemester.replace('.', '');
        const params = new URLSearchParams({
            semester: semesterClean,
            ref_date: refDate,
            tipo_captacao: filters.tipoCaptacao || 'all',
            curso: filters.curso || 'all',
            status: filters.status || 'all',
            turno: filters.turno || 'all',
            modalidade: filters.modalidade || 'all'
        });

        const response = await fetch(`/api/temporal-comparison/${unidadeId}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Python API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data as MultiDayTemporalComparisonItem[];
    } catch (error) {
        console.error("Erro ao buscar comparativo temporal via Python:", error);
        throw error;
    }
};

export const prepareProcessedData = (records: StudentRecord[]): ProcessedData => {
    const courses = [...new Set(records.map(r => r.CURSO).filter(Boolean))].sort();
    const statuses = [...new Set(records.map(r => r.STATUS).filter(Boolean))].sort();
    const shifts = [...new Set(records.map(r => r.TURNO).filter(Boolean))].sort();
    const semesters = [...new Set(records.map(r => r.SEMESTRE?.toString()).filter(Boolean))].sort();
    const modalidades = [...new Set(records.map(r => r.MODALIDADE).filter(Boolean))].sort();

    const currentSemester = semesters[semesters.length - 1] || "";

    const firstRecordWithFilial = records.find(r => r.FILIAL && r.FILIAL.trim() !== '');
    const filialName = firstRecordWithFilial ? firstRecordWithFilial.FILIAL : 'UNINASSAU';

    return {
        records,
        courses,
        statuses,
        shifts,
        semesters,
        modalidades,
        currentSemester,
        filialName
    };
};
