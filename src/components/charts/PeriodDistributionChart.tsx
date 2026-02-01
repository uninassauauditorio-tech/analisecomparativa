import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const PeriodDistributionChart = ({ data, filialName }: { data: any[], filialName?: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Período {filialName ? `- ${filialName}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="value" name="Alunos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="value" position="right" style={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} offset={5} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PeriodDistributionChart;