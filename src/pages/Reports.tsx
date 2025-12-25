import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/contexts/LocaleContext";
import { apiUrl } from "../api/config";

interface SubscriptionRow {
  id: number;
  userId: number;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentMethod?: string | null;
  paymentAmount?: number | null;
  customerName?: string;
  customerPhone?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const ReportsPage = () => {
  const { t } = useLocale();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl("subscriptions/customers"));
        if (!res.ok) throw new Error("Failed to load subscriptions");
        const data = (await res.json()) as SubscriptionRow[];
        setSubscriptions(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load finance data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const cancelled = subscriptions.filter((s) => s.status === "cancelled");
    const totalRevenue = subscriptions.reduce(
      (sum, s) => sum + (s.paymentAmount ? Number(s.paymentAmount) : 0),
      0,
    );
    const avgTicket = subscriptions.length ? totalRevenue / subscriptions.length : 0;
    return { activeCount: active.length, cancelledCount: cancelled.length, totalRevenue, avgTicket };
  }, [subscriptions]);

  const exportCsv = () => {
    const header = [
      "Customer",
      "Phone",
      "Plan",
      "Status",
      "Start Date",
      "End Date",
      "Payment Amount",
      "Payment Method",
    ];

    const rows = subscriptions.map((s) => [
      s.customerName || "",
      s.customerPhone || "",
      s.plan,
      s.status,
      s.startDate,
      s.endDate,
      s.paymentAmount ?? "",
      s.paymentMethod ?? "",
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("reportsPage.title")}</h1>
            <p className="text-muted-foreground">
              {t("reportsPage.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              {t("reportsPage.exportCsv")}
            </Button>
          </div>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t("reportsPage.summaryTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground">{t("reportsPage.loading")}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span>{t("reportsPage.totalRevenue")}</span>
                  <span className="font-semibold">{formatCurrency(totals.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span>{t("reportsPage.avgTicket")}</span>
                  <span className="font-semibold">{formatCurrency(totals.avgTicket)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span>{t("reportsPage.activeSubs")}</span>
                  <Badge variant="secondary">{totals.activeCount}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span>{t("reportsPage.cancelledSubs")}</span>
                  <Badge variant="outline">{totals.cancelledCount}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t("reportsPage.tableTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2">{t("reportsPage.tableCustomer")}</th>
                    <th className="px-3 py-2">{t("reportsPage.tablePlan")}</th>
                    <th className="px-3 py-2">{t("reportsPage.tableStatus")}</th>
                    <th className="px-3 py-2">{t("reportsPage.tableStart")}</th>
                    <th className="px-3 py-2">{t("reportsPage.tableEnd")}</th>
                    <th className="px-3 py-2">{t("reportsPage.tablePayment")}</th>
                    <th className="px-3 py-2">{t("reportsPage.tableMethod")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="px-3 py-3" colSpan={7}>
                        {t("reportsPage.loading")}
                      </td>
                    </tr>
                  )}
                  {!loading && subscriptions.length === 0 && (
                    <tr>
                      <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                        {t("reportsPage.noRecords")}
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    subscriptions.map((row) => (
                      <tr key={row.id} className="border-t border-border/40">
                        <td className="px-3 py-2">
                          <div className="font-medium">{row.customerName || "--"}</div>
                          <div className="text-xs text-muted-foreground">{row.customerPhone || ""}</div>
                        </td>
                        <td className="px-3 py-2">{row.plan}</td>
                        <td className="px-3 py-2">
                          <Badge variant={row.status === "active" ? "secondary" : "outline"}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">{row.startDate}</td>
                        <td className="px-3 py-2">{row.endDate}</td>
                        <td className="px-3 py-2">{row.paymentAmount ? formatCurrency(Number(row.paymentAmount)) : "--"}</td>
                        <td className="px-3 py-2">{row.paymentMethod || "--"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              {t("reportsPage.exportHint")}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
