import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type KPICardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: number;
  trendLabel: string;
  variant?: "default" | "success" | "warning" | "danger";
  valueDescription?: string;
};

const KPICard = ({ title, value, icon: Icon, trend, trendLabel, variant = "default", valueDescription }: KPICardProps) => {
  const variantClasses = {
    default: {
      bg: "bg-primary/10",
      icon: "text-primary",
    },
    success: {
      bg: "bg-success/10",
      icon: "text-success",
    },
    warning: {
      bg: "bg-yellow-500/10",
      icon: "text-yellow-500",
    },
    danger: {
      bg: "bg-danger/10",
      icon: "text-danger",
    },
  };

  return (
    <Card className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-elevated shadow-card">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", variantClasses[variant].bg)}>
          <Icon className={cn("h-6 w-6", variantClasses[variant].icon)} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {valueDescription && <p className="text-xs text-muted-foreground">{valueDescription}</p>}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend !== 0 && (
              trend > 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-danger" />
            )}
            {trendLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;