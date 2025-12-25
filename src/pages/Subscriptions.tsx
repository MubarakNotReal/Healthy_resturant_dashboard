import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Package, Search, Upload, CalendarClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";
import { apiUrl } from "../api/config";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  mealsPerDay: number;
  status: string;
  features: string | null;
}

interface AssignmentCustomer {
  id: number;
  name: string;
  phone?: string;
}

const formatCurrency = (value: number, locale: "en" | "ar") =>
  new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value);

const readFileAsDataUrl = (file: File) =>
  new Promise<string | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string | null);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const SubscriptionsPage = () => {
  const { isAdmin } = useAuth();
  const { t, locale } = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [assignmentCustomers, setAssignmentCustomers] = useState<AssignmentCustomer[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    customerId: "",
    paymentMethod: "",
    details: "",
    receipt: null as File | null,
    startDate: "",
    paymentAmount: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    mealsPerDay: "1",
    features: "",
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await fetch(apiUrl("subscriptions"));
        if (!response.ok) throw new Error("Failed to fetch plans");
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        console.error(err);
        toast.error(t("subscriptionsAssign.loading"));
      } finally {
        setLoadingPlans(false);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await fetch(apiUrl("customers"));
        if (!response.ok) throw new Error("Failed to fetch customers");
        const data = await response.json();
        setAssignmentCustomers(data);
      } catch (err) {
        console.error(err);
        toast.error(t("subscriptionsAssign.noCustomers"));
      }
    };

    fetchPlans();
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.toLowerCase();
    if (!term) return assignmentCustomers;
    return assignmentCustomers.filter((customer) =>
      customer.name.toLowerCase().includes(term) || customer.phone?.toLowerCase().includes(term)
    );
  }, [assignmentCustomers, customerSearch]);

  const handleAssignSubscription = async () => {
    if (!assignmentForm.customerId || !selectedPlanId) {
      toast.error(t("subscriptionsAssign.summaryPlanMissing"));
      return;
    }

    try {
      setAssignmentSubmitting(true);
      const payload: Record<string, unknown> = {
        planId: Number(selectedPlanId),
        paymentMethod: assignmentForm.paymentMethod || undefined,
        paymentDetails: assignmentForm.details || undefined,
        startDate: assignmentForm.startDate || undefined,
      };

      if (assignmentForm.paymentAmount) {
        payload.paymentAmount = Number(assignmentForm.paymentAmount);
      }

      if (assignmentForm.receipt) {
        payload.receiptImage = await readFileAsDataUrl(assignmentForm.receipt);
      }

      const response = await fetch(apiUrl(`customers/${assignmentForm.customerId}/subscribe`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("subscriptionsAssign.assignButton"));
      }

      toast.success(t("subscriptionsAssign.assignButton"));
      setAssignmentForm({ customerId: "", paymentMethod: "", details: "", receipt: null, startDate: "", paymentAmount: "" });
      setCustomerSearch("");
      setSelectedPlanId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("subscriptionsAssign.assignButton"));
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!createForm.name || !createForm.price || !createForm.duration) {
      toast.error(t("subscriptionsAssign.dialogDescription"));
      return;
    }

    try {
      setCreateSubmitting(true);
      const response = await fetch(apiUrl("subscriptions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description || undefined,
          price: Number(createForm.price),
          duration: Number(createForm.duration),
          mealsPerDay: Number(createForm.mealsPerDay || 1),
          features: createForm.features || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || t("subscriptionsAssign.dialogSubmit"));
      }

      toast.success(t("subscriptionsAssign.dialogSubmit"));
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "", price: "", duration: "", mealsPerDay: "1", features: "" });

      // Refresh plans list
      setLoadingPlans(true);
      const plansRes = await fetch(apiUrl("subscriptions"));
      const plansData = await plansRes.json();
      setPlans(plansData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("subscriptionsAssign.dialogSubmit"));
    } finally {
      setCreateSubmitting(false);
      setLoadingPlans(false);
    }
  };

  if (loadingPlans) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">{t("subscriptionsAssign.loading")}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("subscriptionsAssign.pageTitle")}</h1>
          <p className="text-muted-foreground">{t("subscriptionsAssign.pageSubtitle")}</p>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            {t("subscriptionsAssign.createPlan")}
          </Button>
        )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id.toString();
            return (
              <Card
                key={plan.id}
                className={cn(
                  "shadow-soft cursor-pointer border transition-all",
                  isSelected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"
                )}
                onClick={() => {
                  setSelectedPlanId(plan.id.toString());
                  setAssignmentForm((prev) => ({
                    ...prev,
                    paymentAmount: plan.price ? String(plan.price) : prev.paymentAmount,
                  }));
                }}
              >
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("subscriptionsAssign.planMeta", { days: plan.duration, meals: plan.mealsPerDay })}
                      </p>
                    </div>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(plan.price, locale)}</p>
                  {plan.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
                  )}
                  {isAdmin && plan.status !== "active" && (
                    <p className="text-xs text-amber-600">{t("subscriptionsAssign.planInactive")}</p>
                  )}
                  {isSelected && <p className="text-sm font-medium text-primary">{t("subscriptionsAssign.planSelected")}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{t("subscriptionsAssign.customerSectionTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("subscriptionsAssign.findCustomer")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("subscriptionsAssign.searchPlaceholder")}
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-md border bg-muted/40">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-left transition hover:bg-muted",
                        assignmentForm.customerId === customer.id.toString() && "bg-primary/10"
                      )}
                      onClick={() =>
                        setAssignmentForm((prev) => ({
                          ...prev,
                          customerId: customer.id.toString(),
                        }))
                      }
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.phone || "--"}</div>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">{t("subscriptionsAssign.noCustomers")}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("subscriptionsAssign.startDate")}</Label>
                <div className="relative">
                  <CalendarClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={assignmentForm.startDate}
                    onChange={(event) =>
                      setAssignmentForm((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                  />
                </div>
                <Label>{t("subscriptionsAssign.paymentAmount")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("subscriptionsAssign.paymentAmountPlaceholder")}
                  value={assignmentForm.paymentAmount}
                  onChange={(event) =>
                    setAssignmentForm((prev) => ({ ...prev, paymentAmount: event.target.value }))
                  }
                />
                <Label>{t("subscriptionsAssign.paymentMethod")}</Label>
                <Input
                  placeholder="Cash / Card / Transfer"
                  value={assignmentForm.paymentMethod}
                  onChange={(event) =>
                    setAssignmentForm((prev) => ({ ...prev, paymentMethod: event.target.value }))
                  }
                />
                <Label>{t("subscriptionsAssign.paymentDetails")}</Label>
                <Textarea
                  placeholder={t("subscriptionsAssign.paymentDetailsPlaceholder")}
                  value={assignmentForm.details}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, details: event.target.value }))}
                  rows={3}
                />
                <div className="space-y-1">
                  <Label htmlFor="receiptUpload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> {t("subscriptionsAssign.receiptLabel")}
                  </Label>
                  <Input
                    id="receiptUpload"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        receipt: event.target.files && event.target.files[0] ? event.target.files[0] : null,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedPlanId ? t("subscriptionsAssign.summaryPlanSelected") : t("subscriptionsAssign.summaryPlanMissing")} • {assignmentForm.customerId ? t("subscriptionsAssign.summaryCustomerSelected") : t("subscriptionsAssign.summaryCustomerMissing")}
              </div>
              <Button onClick={handleAssignSubscription} disabled={assignmentSubmitting} className="w-full sm:w-auto">
                {assignmentSubmitting ? t("subscriptionsAssign.assigningButton") : t("subscriptionsAssign.assignButton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("subscriptionsAssign.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("subscriptionsAssign.dialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{t("subscriptionsAssign.nameLabel")}</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={t("subscriptionsAssign.nameLabel")}
              />
            </div>
            <div className="space-y-1">
              <Label>{t("subscriptionsAssign.descriptionLabel")}</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={t("subscriptionsAssign.descriptionLabel")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>{t("subscriptionsAssign.priceLabel")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.price}
                  onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label>{t("subscriptionsAssign.durationLabel")}</Label>
                <Input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm((p) => ({ ...p, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>
              <div className="space-y-1">
                <Label>{t("subscriptionsAssign.mealsPerDayLabel")}</Label>
                <Input
                  type="number"
                  value={createForm.mealsPerDay}
                  onChange={(e) => setCreateForm((p) => ({ ...p, mealsPerDay: e.target.value }))}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("subscriptionsAssign.featuresLabel")}</Label>
              <Textarea
                value={createForm.features}
                onChange={(e) => setCreateForm((p) => ({ ...p, features: e.target.value }))}
                placeholder="Comma-separated or free text"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t("subscriptionsAssign.dialogCancel")}
            </Button>
            <Button onClick={handleCreatePlan} disabled={createSubmitting}>
              {createSubmitting ? t("subscriptionsAssign.dialogSubmitting") : t("subscriptionsAssign.dialogSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SubscriptionsPage;
