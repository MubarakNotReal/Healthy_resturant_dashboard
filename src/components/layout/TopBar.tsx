import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";

export function TopBar() {
  const { locale, toggleLocale, t } = useLocale();
  const today = new Date();
  const formattedDate = today.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {formattedDate}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("topbar.searchPlaceholder")}
              className="w-64 pl-9 h-9 bg-muted/50 border-0"
            />
          </div>

          {/* Quick actions */}
          <Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("topbar.quickCheckIn")}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={toggleLocale}>
            {locale === "ar" ? t("topbar.englishLabel") : t("topbar.arabicLabel")}
          </Button>
        </div>
      </div>
    </header>
  );
}
