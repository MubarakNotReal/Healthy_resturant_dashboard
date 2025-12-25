import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  const { t } = useLocale();
  const showPlaceholder = !loading && activities.length === 0;

  return (
    <div className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-semibold">{t("recentActivity.title")}</h3>
      <div className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">{t("recentActivity.loading")}</p>}
        {showPlaceholder && (
          <p className="text-sm text-muted-foreground">{t("recentActivity.empty")}</p>
        )}
        {!loading &&
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-4 animate-fade-in",
                index !== activities.length - 1 && "pb-4 border-b border-border/50",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                  activity.iconBg,
                )}
              >
                <activity.icon className={cn("h-5 w-5", activity.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
