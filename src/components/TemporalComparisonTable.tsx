import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import { fetchMultiDayTemporalComparison, MultiDayTemporalComparisonItem } from "@/utils/dbProcessor";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import DailyCaptacaoChart from "./charts/DailyCaptacaoChart";

import { Filters } from "@/types";

interface TemporalComparisonTableProps {
    currentSemester: string;
    filters: Filters;
    filialName?: string;
}

const TemporalComparisonTable = ({ currentSemester, filters, filialName }: TemporalComparisonTableProps) => {
    const { profile } = useAuth();
    const [rawData, setRawData] = useState<MultiDayTemporalComparisonItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Data de referência: Hoje
    const today = new Date();
    const refDateStr = today.toISOString().split('T')[0];

    useEffect(() => {
        const loadData = async () => {
            if (!profile?.current_unidade_id || !currentSemester) return;

            setLoading(true);
            try {
                const result = await fetchMultiDayTemporalComparison(
                    profile.current_unidade_id,
                    currentSemester,
                    refDateStr,
                    filters
                );
                setRawData(result || []);
            } catch (error) {
                console.error("Error loading multi-day temporal comparison:", error);
                setRawData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [profile?.current_unidade_id, currentSemester, refDateStr, filters]);

    const tableData = useMemo(() => {
        if (!rawData.length) return null;

        // Agrupar por data para as colunas
        const dates = Array.from(new Set(rawData.map(d => d.sort_date))).sort();
        const semesters = Array.from(new Set(rawData.map(d => d.semester_id))).sort((a, b) => b.localeCompare(a));

        const columns = dates.map(date => {
            const dayData = rawData.find(d => d.sort_date === date);
            return {
                dateStr: dayData?.ref_day_month || '',
                weekday: dayData?.weekday_name || '',
                fullDate: date
            };
        });

        const rows = semesters.map(sem => {
            return {
                semester: sem,
                values: dates.map(date => {
                    return rawData.find(d => d.semester_id === sem && d.sort_date === date)?.student_count || 0;
                })
            };
        });

        return { columns, rows, semesters };
    }, [rawData]);

    const formatSemesterLabel = (sem: string) => {
        if (!sem) return "";
        return `${sem.substring(0, 4)}.${sem.substring(4)}`;
    };

    const calculateGrowth = (current: number[], previous: number[]) => {
        return current.map((val, i) => {
            if (!previous[i] || previous[i] === 0) return 0;
            return ((val - previous[i]) / previous[i]) * 100;
        });
    };

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <Card className="h-96 w-full border-[#a3b1cc] border-2"><CardContent className="p-4"><Skeleton className="h-full w-full" /></CardContent></Card>
            </div>
        );
    }

    if (!tableData || tableData.rows.length === 0) {
        return (
            <Card className="w-full border-dashed border-2 p-8 text-center text-gray-400">
                Aguardando carregamento de dados históricos... se esta unidade for nova, certifique-se de realizar a primeira importação.
            </Card>
        );
    }

    const currentYearRow = tableData.rows[0];
    const yoyRows = tableData.rows.slice(1, 2).map(prevRow => ({
        label: `% Cresc. ${currentYearRow.semester.substring(2, 4)} x ${prevRow.semester.substring(2, 4)}`,
        values: calculateGrowth(currentYearRow.values, prevRow.values)
    }));

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Tabela de Comparativo de Captação - Ocupando largura total para exibir mais dias */}
            <Card className="w-full border-[#a3b1cc] border-2 rounded-lg overflow-hidden shadow-sm font-sans">
                <CardHeader className="bg-[#f0f4fa] py-2 px-4 border-b-2 border-[#a3b1cc]">
                    <CardTitle className="text-[#003366] text-lg font-bold flex items-center justify-between">
                        <span>
                            Produção Diária {filialName ? `- ${filialName}` : ''} ({filters.tipoCaptacao === 'rematricula' ? 'Rematrícula' : filters.tipoCaptacao === 'captacao' ? 'Captação' : 'Matrículas'})
                            <span className="font-normal text-sm ml-2 text-[#444]">- {tableData.semesters.slice().reverse().map(formatSemesterLabel).join(' x ')}</span>
                        </span>
                        <span className="text-xs font-normal text-gray-400 italic">(Realizado por Dia • Últimos 15 dias)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#f0f4fa]">
                                    <th className="border-r-2 border-b-2 border-[#a3b1cc] p-2 text-[#003366] font-bold text-center w-32 sticky left-0 z-10 bg-[#f0f4fa]">Ano</th>
                                    {tableData.columns.map((col, i) => (
                                        <th key={i} className="border-r-2 border-b-2 border-[#a3b1cc] p-2 text-[#003366] font-bold text-center min-w-[70px]">
                                            <div className="text-sm">{col.dateStr}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Linhas de Anos */}
                                {tableData.rows.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-[#e6f2ff]' : 'bg-white'}>
                                        <td className="border-r-2 border-b-2 border-[#a3b1cc] p-2 font-bold text-[#003366] text-center sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                            {formatSemesterLabel(row.semester)}
                                        </td>
                                        {row.values.map((val, i) => (
                                            <td key={i} className="border-r-2 border-b-2 border-[#a3b1cc] p-2 text-center text-gray-800 font-bold whitespace-nowrap">
                                                {val.toLocaleString('pt-BR')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Linhas de Crescimento YoY */}
                                {yoyRows.map((row, idx) => (
                                    <tr key={idx} className="bg-white">
                                        <td className="border-r-2 border-b-2 border-[#a3b1cc] p-2 font-bold text-[#003366] text-left italic bg-[#f8f9fa] text-xs sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                            {row.label}
                                        </td>
                                        {row.values.map((val, i) => {
                                            const isPositive = val > 0;
                                            const isNegative = val < 0;
                                            const color = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';

                                            return (
                                                <td key={i} className={`border-r-2 border-b-2 border-[#a3b1cc] p-2 text-center italic font-bold ${color}`}>
                                                    {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',')}%
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#dae5f2] h-2 w-full"></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TemporalComparisonTable;
