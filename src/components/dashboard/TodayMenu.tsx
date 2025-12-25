import { Link } from "react-router-dom";
import { ArrowRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/contexts/LocaleContext";

interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  calories: number;
  protein: number;
  category: string;
}

interface TodayMenuProps {
  items: MenuItem[];
  readyCount: number;
  lastUpdated?: string;
  loading?: boolean;
}

export function TodayMenu({ items, readyCount, lastUpdated, loading }: TodayMenuProps) {
  const { t } = useLocale();
  const showEmpty = !loading && items.length === 0;

  const readyLabel = loading
    ? t("todayMenu.readyCountChecking")
    : readyCount === 1
      ? t("todayMenu.readyCountOne")
      : t("todayMenu.readyCount", { count: readyCount });

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("todayMenu.title")}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="h-3.5 w-3.5" />
            {lastUpdated || t("todayMenu.loading")}
          </p>
        </div>
        <Link to="/menu">
          <Button variant="outline" size="sm" className="gap-2">
            {t("todayMenu.editMenu")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {loading && <p className="text-sm text-muted-foreground">{t("todayMenu.loading")}</p>}
        {showEmpty && <p className="text-sm text-muted-foreground">{t("todayMenu.empty")}</p>}
        {!loading &&
          items.map((meal) => (
            <div key={meal.id} className="menu-item-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{meal.name}</p>
                  <p className="text-sm text-muted-foreground font-cairo">
                    {meal.nameAr}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{meal.calories} cal</p>
                    <p className="text-xs text-muted-foreground">
                      {meal.protein}g protein
                    </p>
                  </div>
                  <Badge variant="secondary">{meal.category}</Badge>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{readyLabel}</span>
        </div>
        <Button size="sm" className="bg-gradient-primary hover:opacity-90">
          {t("todayMenu.sendToCustomers")}
        </Button>
      </div>
    </div>
  );
}
