import React from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartData {
  ano: string;
  alunos: number;
}

const CustomComparativeTooltip = ({ active, payload, label, data }: TooltipProps<ValueType, NameType> & { data: ChartData[] }) => {
  if (active && payload && payload.length) {
    const currentData = payload[0].payload as ChartData;
    const currentIndex = data.findIndex(item => item.ano === currentData.ano);
    
    let trendComponent = null;
    if (currentIndex > 0) {
      const previousData = data[currentIndex - 1];
      const currentAlunos = currentData.alunos;
      const previousAlunos = previousData.alunos;

      if (previousAlunos > 0) {
        const percentageChange = ((currentAlunos - previousAlunos) / previousAlunos) * 100;
        const isIncreasing = percentageChange > 0;
        const isDecreasing = percentageChange < 0;

        const TrendIcon = isIncreasing ? TrendingUp : (isDecreasing ? TrendingDown : Minus);
        const trendColor = isIncreasing ? "text-success" : (isDecreasing ? "text-danger" : "text-muted-foreground");
        const trendLabel = `${Math.abs(percentageChange).toFixed(1)}% vs. ano anterior`;

        trendComponent = (
          <p className={cn("text-sm flex items-center gap-1 mt-1", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            {trendLabel}
          </p>
        );
      } else if (currentAlunos > 0) {
        // If previous was 0 and current is > 0, it's a 100% increase
        trendComponent = (
          <p className="text-sm flex items-center gap-1 mt-1 text-success">
            <TrendingUp className="h-4 w-4" />
            100% vs. ano anterior
          </p>
        );
      } else {
        // Both 0 or previous > 0 and current 0, no change or significant drop
        trendComponent = (
          <p className="text-sm flex items-center gap-1 mt-1 text-muted-foreground">
            <Minus className="h-4 w-4" />
            Sem alteração significativa
          </p>
        );
      }
    } else {
      // First data point, no previous year to compare
      trendComponent = (
        <p className="text-sm text-muted-foreground mt-1">
          Primeiro período registrado
        </p>
      );
    }

    return (
      <div className="p-3 bg-card border border-border rounded-md shadow-lg text-sm">
        <p className="font-semibold text-foreground mb-1">Ano: {label}</p>
        <p className="text-muted-foreground">Alunos: <span className="font-medium text-foreground">{currentData.alunos.toLocaleString('pt-BR')}</span></p>
        {trendComponent}
      </div>
    );
  }

  return null;
};

export default CustomComparativeTooltip;