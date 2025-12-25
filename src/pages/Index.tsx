import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodayMenu } from "@/components/dashboard/TodayMenu";
import { RecentActivity, ActivityItem } from "@/components/dashboard/RecentActivity";
import { AlertsPanel, AlertItem } from "@/components/dashboard/AlertsPanel";
import { Users, CalendarCheck, Package, TrendingUp } from "lucide-react";
import { getTodayCheckIns } from "@/api/checkins-client";
import { getCustomers, CustomerApiRecord } from "@/api/customers-client";
import { useLocale } from "@/contexts/LocaleContext";

interface MenuItem {
  id: number;
  name: string;
  nameAr: string;
  calories: number;
  protein: number;
  category: string;
}

const TODAY_MENU_STORAGE_KEY = "nh-today-menu";

const Dashboard = () => {
  const [customers, setCustomers] = useState<CustomerApiRecord[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<Awaited<ReturnType<typeof getTodayCheckIns>>>([]);
  const [todayMenu, setTodayMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLocale();
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US";

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [customerData, checkInData] = await Promise.all([
          getCustomers(),
          getTodayCheckIns(),
        ]);

        if (!active) return;
        setCustomers(customerData);
        setTodayCheckIns(checkInData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    if (typeof window !== "undefined") {
      try {
        const storedMenu = localStorage.getItem(TODAY_MENU_STORAGE_KEY);
        if (storedMenu) {
          setTodayMenu(JSON.parse(storedMenu));
        }
      } catch (err) {
        console.error("Failed to read saved menu", err);
      }
    }

    return () => {
      active = false;
    };
  }, []);

  const activeSubscribers = useMemo(
    () => customers.filter((c) => c.status === "active").length,
    [customers],
  );

  const expiringSoon = useMemo(
    () =>
      customers.filter(
        (c) => c.status === "active" && typeof c.daysRemaining === "number" && c.daysRemaining <= 3,
      ),
    [customers],
  );

  const mealsServedToday = useMemo(
    () => todayCheckIns.reduce((sum, checkIn) => sum + (checkIn.mealsPickedUp || 0), 0),
    [todayCheckIns],
  );

  const pickupRate = useMemo(() => {
    if (activeSubscribers === 0) return 0;
    const rate = Math.round((todayCheckIns.length / activeSubscribers) * 100);
    return Math.min(100, Math.max(0, rate));
  }, [activeSubscribers, todayCheckIns.length]);

  const activities: ActivityItem[] = useMemo(
    () =>
      todayCheckIns.slice(0, 6).map((checkIn) => ({
        id: checkIn.id.toString(),
        title: t("dashboard.activityTitle", { name: checkIn.customerName || t("dashboard.unknownCustomer") }),
        description: t("dashboard.activityDescription", {
          count: checkIn.mealsPickedUp ?? 0,
          status:
            checkIn.attendanceStatus === "present"
              ? t("common.status.present")
              : checkIn.attendanceStatus === "paused"
                ? t("common.status.paused")
                : t("common.status.absent"),
        }),
        time: new Date(checkIn.checkInDate).toLocaleDateString(dateLocale, {
          month: "short",
          day: "numeric",
        }),
        icon: CalendarCheck,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      })),
    [todayCheckIns, t, dateLocale],
  );

  const alerts: AlertItem[] = useMemo(
    () =>
      expiringSoon.map((customer) => ({
        id: customer.id.toString(),
        title: t("dashboard.alertTitle", { name: customer.name }),
        description: t("dashboard.alertDescription", {
          days: customer.daysRemaining,
          plan: customer.plan,
        }),
        action: t("dashboard.alertActionRenew"),
        icon: Package,
        bgColor: "bg-warning/10",
        color: "text-warning",
      })),
    [expiringSoon, t],
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!todayMenu.length) return t("dashboard.lastUpdatedNone");
    return t("dashboard.lastUpdatedRecent");
  }, [todayMenu.length, t]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t("dashboard.statsActiveTitle")}
            value={loading ? "--" : activeSubscribers}
            subtitle={t("dashboard.statsActiveSubtitle", { count: expiringSoon.length })}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title={t("dashboard.statsCheckinsTitle")}
            value={loading ? "--" : todayCheckIns.length}
            subtitle={loading
              ? t("dashboard.statsCheckinsSubtitleLoading")
              : t("dashboard.statsCheckinsSubtitleMeals", { count: mealsServedToday })}
            icon={CalendarCheck}
            variant="accent"
          />
          <StatCard
            title={t("dashboard.statsExpiringTitle")}
            value={loading ? "--" : expiringSoon.length}
            subtitle={t("dashboard.statsExpiringSubtitle")}
            icon={Package}
            variant="warning"
          />
          <StatCard
            title={t("dashboard.statsPickupTitle")}
            value={loading ? "--" : `${pickupRate}%`}
            subtitle={t("dashboard.statsPickupSubtitle")}
            icon={TrendingUp}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TodayMenu
              items={todayMenu}
              readyCount={activeSubscribers}
              lastUpdated={lastUpdatedLabel}
              loading={loading}
            />
            <RecentActivity activities={activities} loading={loading} />
          </div>
          <div className="space-y-6">
            <AlertsPanel alerts={alerts} loading={loading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
