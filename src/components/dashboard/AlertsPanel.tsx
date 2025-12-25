import { AlertTriangle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  bgColor: string;
  color: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
  loading?: boolean;
}

export function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  const { t } = useLocale();
  const showPlaceholder = !loading && alerts.length === 0;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold">{t("alerts.title")}</h3>
      </div>
      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">{t("alerts.loading")}</p>}
        {showPlaceholder && (
          <p className="text-sm text-muted-foreground">{t("alerts.empty")}</p>
        )}
        {!loading &&
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                  alert.bgColor,
                )}
              >
                <alert.icon className={cn("h-5 w-5", alert.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                {alert.action}
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
