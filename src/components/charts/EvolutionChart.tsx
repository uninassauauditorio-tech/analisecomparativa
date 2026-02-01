import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList } from 'recharts';
import { Filters } from "@/types";

interface EvolutionChartProps {
  data: any[];
  referenceData?: number;
  referenceSemesterLabel?: string;
  referenceCaptacaoData?: number;
  filters: Filters;
  filialName?: string;
}

const EvolutionChart = ({ data, referenceData, referenceSemesterLabel, referenceCaptacaoData, filters, filialName }: EvolutionChartProps) => {
  const renderBars = () => {
    const labelStyle = { fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 'bold' };
    const captacaoLabelStyle = { fill: 'hsl(var(--primary))', fontSize: 11, fontWeight: 'bold' };

    switch (filters.tipoCaptacao) {
      case 'captacao':
        return (
          <Bar dataKey="captacao" fill="hsl(var(--primary))" name="Captação" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="captacao" position="top" style={captacaoLabelStyle} offset={5} />
          </Bar>
        );
      case 'rematricula':
        return (
          <Bar dataKey="rematricula" fill="hsl(var(--primary))" name="Rematrícula" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="rematricula" position="top" style={labelStyle} offset={5} />
          </Bar>
        );
      default:
        return (
          <>
            <Bar dataKey="alunos" fill="hsl(var(--primary))" name="Total de Matriculados" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="alunos" position="top" style={labelStyle} offset={5} />
            </Bar>
            <Bar dataKey="captacao" fill="#f97316" name="Captação" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="captacao" position="top" style={{ fill: '#f97316', fontSize: 11, fontWeight: 'bold' }} offset={5} />
            </Bar>
          </>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução por Semestre {filialName ? `- ${filialName}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 30, right: 80, left: 0, bottom: 5 }}>
            <XAxis dataKey="semestre" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            {renderBars()}

            {referenceData && (
              <ReferenceLine
                y={referenceData}
                stroke="hsl(var(--danger))"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Ref: ${referenceSemesterLabel}`,
                  position: 'right',
                  fill: 'hsl(var(--danger))',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}

            {referenceCaptacaoData && filters.tipoCaptacao === 'all' && (
              <ReferenceLine
                y={referenceCaptacaoData}
                stroke="#f97316"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Captação Ref`,
                  position: 'right',
                  fill: '#f97316',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EvolutionChart;