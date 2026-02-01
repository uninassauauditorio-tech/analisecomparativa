import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import CustomComparativeTooltip from './CustomComparativeTooltip'; // Importa o novo componente de tooltip

interface ChartData {
  ano: string;
  alunos: number;
}

interface ComparativeChartProps {
  data: ChartData[];
  comparisonPeriodLabel: string;
}

const ComparativeChart = ({ data, comparisonPeriodLabel }: ComparativeChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo Anual</CardTitle>
        <CardDescription>
          Comparando o total de alunos para os {comparisonPeriodLabel} ao longo dos anos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="ano" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              content={<CustomComparativeTooltip data={data} />} // Usa o componente de tooltip personalizado
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Legend wrapperStyle={{ fontSize: "14px" }} />
            <Line type="monotone" dataKey="alunos" stroke="hsl(var(--primary))" strokeWidth={2} name="Alunos" dot={{ r: 4 }} activeDot={{ r: 8, strokeWidth: 2, fill: 'hsl(var(--primary))' }}>
              <LabelList dataKey="alunos" position="top" style={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} offset={5} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ComparativeChart;