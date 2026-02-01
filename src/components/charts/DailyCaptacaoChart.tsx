import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useMemo } from "react";

interface DailyCaptacaoChartProps {
    data: any[]; // Processed similar to table data but daily deltas
}

const DailyCaptacaoChart = ({ data }: DailyCaptacaoChartProps) => {
    const chartData = useMemo(() => {
        if (!data || !data.length) return [];

        // Data structure: labels (dateStr), currentYearValue, prevYearValue, metaValue
        // Since input is rawData (cumulative), we need to compute deltas
        const dates = Array.from(new Set(data.map(d => d.sort_date))).sort();
        const semesters = Array.from(new Set(data.map(d => d.semester_id))).sort((a, b) => b.localeCompare(a));

        const currentSem = semesters[0];
        const prevSem = semesters[1];

        return dates.map((date, idx) => {
            const dayLabel = data.find(d => d.sort_date === date)?.ref_day_month || '';

            const getCurrent = (sem: string, d: string) => data.find(x => x.semester_id === sem && x.sort_date === d)?.student_count || 0;
            const getPrev = (sem: string, d: string) => {
                if (idx === 0) return 0;
                const prevDate = dates[idx - 1];
                return data.find(x => x.semester_id === sem && x.sort_date === prevDate)?.student_count || 0;
            };

            const currentVal = getCurrent(currentSem, date) - getPrev(currentSem, date);
            const prevVal = getCurrent(prevSem, date) - getPrev(prevSem, date);
            const metaVal = Math.round(prevVal * 1.15); // Simulated meta

            return {
                name: dayLabel,
                current: currentVal >= 0 ? currentVal : 0,
                previous: prevVal >= 0 ? prevVal : 0,
                meta: metaVal >= 0 ? metaVal : 0
            };
        });
    }, [data]);

    return (
        <Card className="border-[#a3b1cc] border-2 rounded-lg overflow-hidden shadow-sm h-full">
            <CardHeader className="bg-[#f0f4fa] py-2 px-4 border-b-2 border-[#a3b1cc]">
                <CardTitle className="text-[#003366] text-lg font-bold text-center">
                    Captação Diária <br />
                    <span className="text-sm font-normal text-[#444]">(Alunos Captados no dia)</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px' }} />

                        <Bar dataKey="previous" name="2025.1" fill="#ffcccc" barSize={35} radius={[2, 2, 0, 0]}>
                            <LabelList dataKey="previous" position="top" style={{ fill: '#884444', fontSize: 11, fontWeight: 'bold' }} />
                        </Bar>

                        <Bar dataKey="meta" name="Ritmo Meta captação" fill="#99cc99" barSize={35} radius={[2, 2, 0, 0]}>
                            <LabelList dataKey="meta" position="top" style={{ fill: '#2d5a2d', fontSize: 11, fontWeight: 'bold' }} />
                        </Bar>

                        <Line type="monotone" dataKey="current" name="2026.1" stroke="#4a86e8" strokeWidth={3} dot={{ r: 6, fill: '#4a86e8', strokeWidth: 2, stroke: '#fff' }}>
                            <LabelList dataKey="current" position="top" style={{ fill: '#003366', fontSize: 13, fontWeight: 'bold' }} offset={10} />
                        </Line>
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default DailyCaptacaoChart;
