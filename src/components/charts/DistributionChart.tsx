import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";

const generatePaletteFromCSS = (): string[] => {
  if (typeof window === 'undefined') {
    return ['#8884d8'];
  }
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary').trim();

  if (!primaryColor) {
    return ['hsl(190, 70%, 40%)', 'hsl(240, 60%, 65%)', 'hsl(300, 70%, 60%)'];
  }

  const [h, s, l] = primaryColor.split(' ').map(parseFloat);

  return [
    `hsl(${h}, ${s}%, ${l}%)`,
    `hsl(${h}, ${s}%, ${l + 15}%)`,
    `hsl(${h}, ${s}%, ${l + 30}%)`,
    `hsl(${h}, ${s - 20}%, ${l}%)`,
    `hsl(${h}, ${s - 20}%, ${l + 20}%)`,
    `hsl(${h + 30}, ${s}%, ${l}%)`,
    `hsl(${h - 30}, ${s}%, ${l}%)`,
  ];
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
    >
      {`${name}\n${value}`}
    </text>
  );
};

const DistributionChart = ({ data }: { data: any[] }) => {
  const [palette, setPalette] = useState<string[]>(generatePaletteFromCSS());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setPalette(generatePaletteFromCSS());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Turno</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DistributionChart;