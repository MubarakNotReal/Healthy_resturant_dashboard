import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Package,
  Calendar,
  Utensils,
  Clock,
  RefreshCw,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscription {
  id: number;
  customerName: string;
  customerNameAr: string;
  plan: string;
  mealsPerDay: number;
  startDate: string;
  endDate: string;
  daysTotal: number;
  daysUsed: number;
  daysRemaining: number;
  backupDays: number;
  status: "active" | "paused" | "expiring" | "expired";
  lastPickup: string;
}

const subscriptions: Subscription[] = [
  { id: 1, customerName: "Sarah Ahmed", customerNameAr: "سارة أحمد", plan: "30 Days Premium", mealsPerDay: 2, startDate: "2024-01-15", endDate: "2024-02-14", daysTotal: 30, daysUsed: 12, daysRemaining: 18, backupDays: 0, status: "active", lastPickup: "Today" },
  { id: 2, customerName: "Mohammed Ali", customerNameAr: "محمد علي", plan: "30 Days Standard", mealsPerDay: 3, startDate: "2024-01-10", endDate: "2024-02-09", daysTotal: 30, daysUsed: 25, daysRemaining: 5, backupDays: 2, status: "expiring", lastPickup: "Yesterday" },
  { id: 3, customerName: "Fatima Hassan", customerNameAr: "فاطمة حسن", plan: "14 Days Trial", mealsPerDay: 2, startDate: "2024-02-01", endDate: "2024-02-15", daysTotal: 14, daysUsed: 2, daysRemaining: 12, backupDays: 0, status: "active", lastPickup: "2 days ago" },
  { id: 4, customerName: "Omar Khalid", customerNameAr: "عمر خالد", plan: "30 Days Premium", mealsPerDay: 3, startDate: "2024-01-20", endDate: "2024-02-19", daysTotal: 30, daysUsed: 8, daysRemaining: 22, backupDays: 1, status: "active", lastPickup: "Today" },
  { id: 5, customerName: "Aisha Rahman", customerNameAr: "عائشة رحمان", plan: "30 Days Standard", mealsPerDay: 2, startDate: "2023-12-15", endDate: "2024-01-14", daysTotal: 30, daysUsed: 30, daysRemaining: 0, backupDays: 3, status: "expired", lastPickup: "5 days ago" },
  { id: 6, customerName: "Khalid Mansour", customerNameAr: "خالد منصور", plan: "30 Days Premium", mealsPerDay: 2, startDate: "2024-02-01", endDate: "2024-03-01", daysTotal: 30, daysUsed: 0, daysRemaining: 30, backupDays: 0, status: "paused", lastPickup: "Never" },
];

const plans = [
  { name: "14 Days Trial", days: 14, price: 350, mealsOptions: [2] },
  { name: "30 Days Standard", days: 30, price: 750, mealsOptions: [2, 3] },
  { name: "30 Days Premium", days: 30, price: 950, mealsOptions: [2, 3] },
];

const SubscriptionsPage = () => {
  const [search, setSearch] = useState("");

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
      sub.customerNameAr.includes(search) ||
      sub.plan.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusConfig = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return { badge: "badge-success", label: "Active", icon: Play };
      case "paused":
        return { badge: "badge-info", label: "Paused", icon: Pause };
      case "expiring":
        return { badge: "badge-warning", label: "Expiring", icon: Clock };
      case "expired":
        return { badge: "badge-destructive", label: "Expired", icon: RefreshCw };
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage customer meal subscriptions
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4" />
            New Subscription
          </Button>
        </div>

        {/* Plans Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.days} days • {plan.mealsOptions.join(" or ")} meals/day
                    </p>
                  </div>
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold mt-4">
                  {plan.price} <span className="text-sm font-normal text-muted-foreground">SAR</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => {
            const statusConfig = getStatusConfig(sub.status);
            const progress = (sub.daysUsed / sub.daysTotal) * 100;

            return (
              <Card key={sub.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{sub.customerName}</CardTitle>
                      <p className="text-sm text-muted-foreground font-cairo">
                        {sub.customerNameAr}
                      </p>
                    </div>
                    <Badge className={statusConfig.badge}>{statusConfig.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{sub.plan}</span>
                    <span className="font-medium">{sub.mealsPerDay} meals/day</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {sub.daysUsed} / {sub.daysTotal} days
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium">{sub.daysRemaining} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Backup Days</p>
                        <p className="font-medium">{sub.backupDays} days</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Last pickup: {sub.lastPickup}
                    </span>
                    <div className="flex gap-2">
                      {sub.status === "paused" ? (
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <Play className="h-3 w-3" />
                          Resume
                        </Button>
                      ) : sub.status === "active" ? (
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <Pause className="h-3 w-3" />
                          Pause
                        </Button>
                      ) : sub.status === "expired" ? (
                        <Button size="sm" className="h-8 gap-1 bg-gradient-primary">
                          <RefreshCw className="h-3 w-3" />
                          Renew
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionsPage;
