import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { DynamicInsight } from "@/types";

interface InsightsPanelProps {
  insights: DynamicInsight[];
}

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  const getIconColor = (type: string) => {
    switch (type) {
      case "success": return "text-success";
      case "warning": return "text-yellow-500";
      case "danger": return "text-danger";
      default: return "text-primary";
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-success/10";
      case "warning": return "bg-yellow-500/10";
      case "danger": return "bg-danger/10";
      default: return "bg-primary/10";
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="p-6 shadow-card text-center">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <LucideIcons.Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Insights Automáticos</h3>
        </div>
        <p className="text-muted-foreground">Nenhum insight específico para a seleção atual. Tente outros filtros.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <LucideIcons.Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Insights Automáticos</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = LucideIcons[insight.icon] as LucideIcons.LucideIcon;
          return (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border hover:shadow-md transition-all"
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${getBgColor(insight.type)} shrink-0`}>
                  {Icon && <Icon className={`h-5 w-5 ${getIconColor(insight.type)}`} />}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InsightsPanel;