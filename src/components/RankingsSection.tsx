import { useState, useMemo, useEffect } from "react";
import {
    Trophy,
    Target,
    ArrowUpRight,
    Users,
    TrendingUp,
    UserMinus,
    AlertTriangle
} from "lucide-react";
import { StudentRecord, MetaCurso, Filters } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { filterRecords } from "@/utils/excelProcessor";
import GoalsDialog from "./GoalsDialog";
import { Button } from "./ui/button";

interface RankingsSectionProps {
    records: StudentRecord[];
    unidadeId: string;
    semesterForAnalysis: string;
    courses: string[];
    filters: Filters;
}

const RankingsSection = ({ records, unidadeId, semesterForAnalysis, courses, filters }: RankingsSectionProps) => {
    const [metas, setMetas] = useState<MetaCurso[]>([]);
    const [isCaptacaoModalOpen, setIsCaptacaoModalOpen] = useState(false);
    const [isRematriculaModalOpen, setIsRematriculaModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (unidadeId && semesterForAnalysis) {
            fetchMetas();
        }
    }, [unidadeId, semesterForAnalysis]);

    const fetchMetas = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("metas_cursos")
                .select("*")
                .eq("unidade_id", unidadeId)
                .eq("semestre", semesterForAnalysis);
            if (error) throw error;
            setMetas(data || []);
        } catch (error) {
            console.error("Erro ao buscar metas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentFilteredRecords = useMemo(() => {
        // Aplica todos os filtros atuais, mas fixa o semestre no que está sendo analisado (YoY ou Atual)
        return filterRecords(records, { ...filters, semestre: semesterForAnalysis });
    }, [records, semesterForAnalysis, filters]);

    // Ranking Rematrícula
    const rematriculaData = useMemo(() => {
        const stats = courses.map(curso => {
            const courseRecords = currentFilteredRecords.filter(r => r.CURSO === curso && r.QTDCAPTACAO !== 'CAPTAÇÃO');

            // RENOVOU: Todos os MATRICULADOS que não são novos alunos
            const renovou = courseRecords.filter(r => r.STATUS === 'MATRICULADO').length;

            // FALTA RENOVAR: Todos os PRÉ-MATRICULA WEB (eles pretendem renovar mas ainda não são MATRICULADOS)
            const faltaRenovar = courseRecords.filter(r => r.STATUS === 'PRÉ-MATRICULA WEB').length;

            // EVASÃO: O grupo de saída que definimos
            const evasaoStatuses = [
                'TRANCADO', 'CANCELADO', 'ABANDONO',
                'TRANSFERENCIA PARA EAD', 'TRANSFERENCIA EXTERNA', 'TRANSFERENCIA ENTRE UNIDADES'
            ];
            const evasao = courseRecords.filter(r => evasaoStatuses.includes(r.STATUS)).length;

            const metaObj = metas.find(m => m.curso === curso && m.tipo === 'rematricula');
            const meta = metaObj ? metaObj.meta_valor : 0;

            const porcRenovou = meta > 0 ? (renovou / meta) * 100 : 0;
            const porcNaoRenovou = meta > 0 ? ((meta - renovou) / meta) * 100 : 0;

            return {
                curso,
                meta,
                renovou,
                evasao,
                faltaRenovar,
                porcRenovou,
                porcNaoRenovou
            };
        });

        return stats.sort((a, b) => b.porcRenovou - a.porcRenovou);
    }, [currentFilteredRecords, courses, metas]);

    // Ranking Captação
    const captacaoData = useMemo(() => {
        const stats = courses.map(curso => {
            const courseRecords = currentFilteredRecords.filter(r => r.CURSO === curso);
            const realizado = courseRecords.filter(r => r.QTDCAPTACAO === 'CAPTAÇÃO').length;

            const metaObj = metas.find(m => m.curso === curso && m.tipo === 'captacao');
            const meta = metaObj ? metaObj.meta_valor : 0;

            const porc = meta > 0 ? (realizado / meta) * 100 : 0;

            return {
                curso,
                meta,
                realizado,
                porc
            };
        });

        return stats.sort((a, b) => b.porc - a.porc);
    }, [currentFilteredRecords, courses, metas]);

    const getColorClass = (value: number) => {
        if (value >= 90) return "bg-[#86efac] text-[#166534]"; // Verde forte
        if (value >= 70) return "bg-[#bbf7d0] text-[#166534]"; // Verde claro
        if (value >= 50) return "bg-[#fef08a] text-[#854d0e]"; // Amarelo
        if (value >= 30) return "bg-[#fecaca] text-[#991b1b]"; // Laranja/Vermelho claro
        return "bg-[#fca5a5] text-[#991b1b]"; // Vermelho
    };

    return (
        <div className="space-y-12">
            {/* Seção de Metas e Botões de Ação */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h3 className="text-lg font-bold text-[#003366] flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Ranking de Resultados por Curso
                    </h3>
                    <p className="text-sm text-slate-500">
                        {semesterForAnalysis ? `Semestre de Análise: ${semesterForAnalysis.substring(0, 4)}.${semesterForAnalysis.slice(-1)}` : "Selecione um semestre"}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-[#003366] text-[#003366] hover:bg-[#003366]/5"
                        onClick={() => setIsRematriculaModalOpen(true)}
                    >
                        <Target className="h-4 w-4 mr-2" />
                        Metas Rematrícula
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-[#003366] text-[#003366] hover:bg-[#003366]/5"
                        onClick={() => setIsCaptacaoModalOpen(true)}
                    >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Metas Captação
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Tabela de Rematrícula */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-[#003366] p-4">
                        <h4 className="text-white font-bold text-center uppercase tracking-wider text-sm">% POR CURSO - REMATRÍCULA</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#f8fafc] text-[#003366] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 border-r">CURSO</th>
                                    <th className="px-2 py-3 border-r text-center">META</th>
                                    <th className="px-2 py-3 border-r text-center bg-green-50">RENOVOU</th>
                                    <th className="px-2 py-3 border-r text-center bg-red-50">EVASÃO</th>
                                    <th className="px-2 py-3 border-r text-center bg-amber-50">FALTA RENOVAR</th>
                                    <th className="px-2 py-3 border-r text-center bg-blue-50">% RENOVOU</th>
                                    <th className="px-2 py-3 text-center bg-slate-50">% NÃO RENOVOU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rematriculaData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-3 py-2 font-medium border-r bg-white sticky left-0">{row.curso}</td>
                                        <td className="px-2 py-2 text-center border-r font-bold">{row.meta}</td>
                                        <td className="px-2 py-2 text-center border-r text-green-700 font-bold bg-green-50/30">{row.renovou}</td>
                                        <td className="px-2 py-2 text-center border-r text-red-600 font-bold bg-red-50/30">{row.evasao}</td>
                                        <td className="px-2 py-2 text-center border-r text-amber-700 font-bold bg-amber-50/30">{row.faltaRenovar}</td>
                                        <td className={`px-2 py-2 text-center border-r font-bold ${getColorClass(row.porcRenovou)}`}>
                                            {row.porcRenovou.toFixed(2)}%
                                        </td>
                                        <td className={`px-2 py-2 text-center font-bold ${getColorClass(row.porcNaoRenovou)}`}>
                                            {row.porcNaoRenovou.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabela de Captação */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-[#166534] p-4">
                        <h4 className="text-white font-bold text-center uppercase tracking-wider text-sm">META - CAPTAÇÃO POR CURSO</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#f8fafc] text-[#166534] font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 border-r">CURSO</th>
                                    <th className="px-4 py-3 border-r text-center">META</th>
                                    <th className="px-4 py-3 border-r text-center">REALIZADO</th>
                                    <th className="px-4 py-3 text-center">% ALCANÇADO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {captacaoData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 font-medium border-r bg-white sticky left-0">{row.curso}</td>
                                        <td className="px-4 py-2 text-center border-r font-bold">{row.meta}</td>
                                        <td className="px-4 py-2 text-center border-r font-bold text-green-700 bg-green-50/30">{row.realizado}</td>
                                        <td className={`px-4 py-2 text-center font-bold ${getColorClass(row.porc)}`}>
                                            {row.porc.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <GoalsDialog
                isOpen={isRematriculaModalOpen}
                onOpenChange={setIsRematriculaModalOpen}
                unidadeId={unidadeId}
                semestre={semesterForAnalysis}
                courses={courses}
                tipo="rematricula"
                onSuccess={fetchMetas}
            />
            <GoalsDialog
                isOpen={isCaptacaoModalOpen}
                onOpenChange={setIsCaptacaoModalOpen}
                unidadeId={unidadeId}
                semestre={semesterForAnalysis}
                courses={courses}
                tipo="captacao"
                onSuccess={fetchMetas}
            />
        </div>
    );
};

export default RankingsSection;
