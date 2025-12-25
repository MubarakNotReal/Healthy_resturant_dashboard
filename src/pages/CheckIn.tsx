import { useState, useEffect, useMemo, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  QrCode,
  Check,
  Minus,
  Plus,
  User,
  CalendarDays,
  Utensils,
  AlertCircle,
  Edit,
  Trash2,
  Clock,
  PauseCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCustomers } from "@/api/customers-client";
import { getCheckIns, getTodayCheckIns, createCheckIn, updateCheckIn, deleteCheckIn, CheckInWithCustomer } from "@/api/checkins-client";
import { useLocale } from "@/contexts/LocaleContext";

interface Customer {
  id: number;
  name: string;
  nameAr: string;
  phone: string;
  plan: string;
  mealsPerDay: number;
  daysRemaining: number;
  lastPickup: string;
  status: "active" | "expiring" | "inactive";
  subscriptionId?: number;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

type AttendanceStatus = 'present' | 'absent' | 'paused';

const CheckInPage = () => {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckInWithCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [calendarCustomer, setCalendarCustomer] = useState<Customer | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarDrafts, setCalendarDrafts] = useState<Record<string, { status: AttendanceStatus; meals: number; checkInId?: number }>>({});
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit check-in dialog
  const [editingCheckIn, setEditingCheckIn] = useState<CheckInWithCustomer | null>(null);
  const [editMealCount, setEditMealCount] = useState(0);
  const [editAttendanceStatus, setEditAttendanceStatus] = useState<AttendanceStatus>('present');
  const [editNotes, setEditNotes] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, checkInsData] = await Promise.all([
        getCustomers(),
        getTodayCheckIns()
      ]);

      // Transform customers data to include subscription info
      const transformedCustomers: Customer[] = customersData.map(customer => ({
        id: customer.id,
        name: customer.name,
        nameAr: customer.nameAr || '',
        phone: customer.phone,
        plan: customer.plan || 'No Plan',
        mealsPerDay: customer.mealsPerDay ?? 1,
        daysRemaining: customer.daysRemaining || 0,
        lastPickup: customer.lastPickup || 'Never',
        status: customer.subscriptionStatus === 'active' ? 'active' :
                customer.subscriptionStatus === 'expiring' ? 'expiring' : 'inactive',
        subscriptionId: customer.subscriptionId,
        subscriptionStartDate: customer.startDate,
        subscriptionEndDate: customer.endDate,
      }));

      setCustomers(transformedCustomers);
      setTodayCheckIns(checkInsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) => {
      const hasActiveSubscription = customer.status === 'active' && customer.subscriptionId;
      if (!hasActiveSubscription) return false;

      // Show active customers matching search
      return (
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.nameAr.includes(search) ||
        customer.phone.includes(search)
      );
    }
  );

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMealCount(customer.mealsPerDay);
    // Open calendar view for per-day editing
    void enterCalendar(customer);
  };

  const handleCheckIn = async () => {
    if (!selectedCustomer || !selectedCustomer.subscriptionId || mealCount < 0) {
      toast.error('Invalid check-in data');
      return;
    }

    try {
      setSubmitting(true);

      await createCheckIn({
        subscriptionId: selectedCustomer.subscriptionId,
        userId: selectedCustomer.id,
        checkInDate: new Date().toISOString().split('T')[0],
        mealsPickedUp: mealCount,
        attendanceStatus: mealCount > 0 ? 'present' : 'absent',
        notes: '',
      });

      toast.success(`Checked in ${selectedCustomer.name} for ${mealCount} meals`);
      await loadData();
      setSelectedCustomer(null);
      setMealCount(0);
    } catch (error) {
      console.error('Error creating check-in:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCheckIn = (checkIn: CheckInWithCustomer) => {
    setEditingCheckIn(checkIn);
    setEditMealCount(checkIn.mealsPickedUp);
    const normalized: AttendanceStatus = checkIn.attendanceStatus === 'present'
      ? 'present'
      : checkIn.attendanceStatus === 'paused'
        ? 'paused'
        : 'absent';
    setEditAttendanceStatus(normalized);
    setEditNotes(checkIn.notes || '');
  };

  const handleUpdateCheckIn = async () => {
    if (!editingCheckIn) return;
    try {
      setSubmitting(true);
      await updateCheckIn(editingCheckIn.id, {
        mealsPickedUp: editMealCount,
        attendanceStatus: editAttendanceStatus,
        notes: editNotes,
      });
      toast.success('Check-in updated successfully');
      await loadData();
      setEditingCheckIn(null);
    } catch (error) {
      console.error('Error updating check-in:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCheckIn = async (checkInId: number) => {
    if (!confirm('Are you sure you want to delete this check-in?')) return;

    try {
      await deleteCheckIn(checkInId);
      toast.success('Check-in deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting check-in:', error);
      toast.error('Failed to delete check-in');
    }
  };

  const dateKey = (date: Date) => date.toISOString().split('T')[0];

  const enterCalendar = async (customer: Customer) => {
    setCalendarCustomer(customer);
    await loadCalendar(customer);
  };

  const loadCalendar = async (customer: Customer) => {
    try {
      setCalendarLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(end.getDate() + 1); // show one day ahead
      let start = new Date(today);
      if (customer.subscriptionStartDate) {
        const s = new Date(customer.subscriptionStartDate);
        if (!Number.isNaN(s.getTime())) {
          s.setHours(0, 0, 0, 0);
          start = s;
        }
      } else {
        start.setDate(end.getDate() - 29);
      }

      if (start > end) {
        start = new Date(end);
      }

      const startStr = dateKey(start);
      const endStr = dateKey(end);

      const checkInsRange = await getCheckIns({ userId: customer.id, startDate: startStr, endDate: endStr });
      const map: Record<string, CheckInWithCustomer> = {};
      checkInsRange.forEach((c) => {
        const key = typeof c.checkInDate === 'string' ? c.checkInDate.slice(0, 10) : dateKey(new Date(c.checkInDate));
        map[key] = c;
      });

      const drafts: Record<string, { status: AttendanceStatus; meals: number; checkInId?: number }> = {};
      const days: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const copy = new Date(d);
        days.push(copy);
        const key = dateKey(copy);
        const existing = map[key];
        const existingStatus = existing?.attendanceStatus;
        const status: AttendanceStatus = existingStatus === 'present' ? 'present' : existingStatus === 'paused' ? 'paused' : 'absent';
        drafts[key] = {
          status,
          meals: existing?.mealsPickedUp ?? customer.mealsPerDay,
          checkInId: existing?.id,
        };
      }

      setCalendarDrafts(drafts);
      setCalendarDays(days);
    } catch (error) {
      console.error('Error loading calendar', error);
      toast.error('Failed to load calendar');
    } finally {
      setCalendarLoading(false);
    }
  };

  const saveCheckIn = useCallback(
    async (dateStr: string, draft: { status: AttendanceStatus; meals: number; checkInId?: number }) => {
      if (!calendarCustomer?.subscriptionId) {
        toast.error('Customer has no active subscription');
        return;
      }

      try {
        setSaving(true);
        if (draft.checkInId) {
          const updated = await updateCheckIn(draft.checkInId, {
            mealsPickedUp: draft.meals,
            attendanceStatus: draft.status,
          });
          setCalendarDrafts((prev) => ({
            ...prev,
            [dateStr]: {
              status: updated.attendanceStatus as AttendanceStatus,
              meals: updated.mealsPickedUp,
              checkInId: updated.id,
            },
          }));
        } else {
          const created = await createCheckIn({
            subscriptionId: calendarCustomer.subscriptionId,
            userId: calendarCustomer.id,
            checkInDate: dateStr,
            mealsPickedUp: draft.meals,
            attendanceStatus: draft.status,
          });
          setCalendarDrafts((prev) => ({
            ...prev,
            [dateStr]: {
              status: created.attendanceStatus as AttendanceStatus,
              meals: created.mealsPickedUp,
              checkInId: created.id,
            },
          }));
        }
      } catch (error) {
        console.error('Error saving check-in', error);
        toast.error('Failed to save check-in');
      } finally {
        setSaving(false);
      }
    },
    [calendarCustomer],
  );

  const handleToggleStatus = (dateStr: string) => {
    setCalendarDrafts((prev) => {
      const current = prev[dateStr];
      if (!current) return prev;
      const order: AttendanceStatus[] = ['present', 'absent', 'paused'];
      const next = order[(order.indexOf(current.status) + 1) % order.length];
      const updated = { ...prev, [dateStr]: { ...current, status: next } };
      void saveCheckIn(dateStr, updated[dateStr]);
      return updated;
    });
  };

  const handleMealsChange = (dateStr: string, meals: number) => {
    setCalendarDrafts((prev) => {
      const current = prev[dateStr];
      if (!current) return prev;
      const updated = { ...prev, [dateStr]: { ...current, meals } };
      void saveCheckIn(dateStr, updated[dateStr]);
      return updated;
    });
  };

  const calendarWeeks = useMemo(() => {
    const ordered = [...calendarDays].sort((a, b) => a.getTime() - b.getTime());
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = Array(7).fill(null);

    ordered.forEach((day) => {
      const idx = (day.getDay() + 6) % 7; // Monday=0 ... Sunday=6
      // If current slot already filled, start a new week
      if (currentWeek[idx]) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
      }
      currentWeek[idx] = day;

      // If Sunday (idx 6), close the week
      if (idx === 6) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
      }
    });

    // Push trailing week if it has any day
    if (currentWeek.some((d) => d)) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [calendarDays]);

  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="badge-success">{t("common.status.active")}</Badge>;
      case "expiring":
        return <Badge className="badge-warning">{t("common.status.expiring")}</Badge>;
      case "inactive":
        return <Badge className="badge-destructive">{t("common.status.inactive")}</Badge>;
    }
  };

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="badge-success">{t("checkinPage.calendarStatus.present")}</Badge>;
      case "absent":
        return <Badge className="badge-destructive">{t("checkinPage.calendarStatus.absent")}</Badge>;
      case "paused":
        return <Badge variant="outline">{t("checkinPage.calendarStatus.paused")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (calendarCustomer) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("checkinPage.calendarTitle", { name: calendarCustomer.name })}</h1>
              <p className="text-muted-foreground">{t("checkinPage.calendarHint")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCalendarCustomer(null);
                setSelectedCustomer(null);
              }}
            >
              {t("common.buttons.cancel")}
            </Button>
          </div>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                {t("checkinPage.title")}
              </CardTitle>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Check className="h-4 w-4 text-emerald-600" /> {t("checkinPage.calendarStatus.present")}</span>
                <span className="inline-flex items-center gap-1"><X className="h-4 w-4 text-rose-600" /> {t("checkinPage.calendarStatus.absent")}</span>
                <span className="inline-flex items-center gap-1"><PauseCircle className="h-4 w-4 text-slate-600" /> {t("checkinPage.calendarStatus.paused")}</span>
                <span className="text-xs text-muted-foreground">{saving ? t("checkinPage.calendarLegendSavingNow") : t("checkinPage.calendarLegendSaving")}</span>
              </div>
            </CardHeader>
            <CardContent>
              {calendarLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className="h-28 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {t("checkinPage.calendarWeekday")?.map((d: string) => (
                          <th key={d} className="px-3 py-2 text-left text-muted-foreground font-medium">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {calendarWeeks.map((week, rowIdx) => (
                        <tr key={rowIdx}>
                          {week.map((day, colIdx) => {
                            if (!day) {
                              return <td key={`empty-${rowIdx}-${colIdx}`} className="p-3" />;
                            }
                            const key = dateKey(day);
                            const draft = calendarDrafts[key];
                            const status = draft?.status || 'absent';
                            const statusStyles: Record<AttendanceStatus, string> = {
                              present: 'bg-emerald-50 border-emerald-200',
                              absent: 'bg-rose-50 border-rose-200',
                              paused: 'bg-slate-50 border-slate-200',
                            };
                            const statusIcon: Record<AttendanceStatus, JSX.Element> = {
                              present: <Check className="h-5 w-5 text-emerald-600" />, 
                              absent: <X className="h-5 w-5 text-rose-600" />, 
                              paused: <PauseCircle className="h-5 w-5 text-slate-600" />, 
                            };
                            const statusLabel: Record<AttendanceStatus, string> = {
                              present: t("checkinPage.calendarStatus.present"),
                              absent: t("checkinPage.calendarStatus.absent"),
                              paused: t("checkinPage.calendarStatus.paused"),
                            };

                            return (
                              <td
                                key={`${rowIdx}-${colIdx}`}
                                className={cn(
                                  "align-top border p-3 rounded-lg transition hover:shadow-sm cursor-pointer",
                                  statusStyles[status],
                                  key === dateKey(new Date()) && "ring-2 ring-primary/50"
                                )}
                                onClick={() => handleToggleStatus(key)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-semibold leading-tight">{day.toLocaleDateString()}</p>
                                    <p className="text-[11px] text-muted-foreground">{day.toLocaleDateString('en-GB', { weekday: 'long' })}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {statusIcon[status]}
                                    <span className="text-xs font-semibold uppercase tracking-wide">{statusLabel[status]}</span>
                                    {draft?.checkInId && <Badge variant="outline">Saved</Badge>}
                                  </div>
                                </div>

                                <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={draft?.meals ?? 0}
                                    onChange={(e) => handleMealsChange(key, parseInt(e.target.value, 10) || 0)}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("checkinPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("checkinPage.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search & Customer List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("checkinPage.searchPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-search h-14 text-lg"
                    />
                  </div>
                  <Button variant="outline" size="lg" className="h-14 px-6 gap-2">
                    <QrCode className="h-5 w-5" />
                    {t("checkinPage.scan")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer List */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  {loading ? t("checkinPage.loading") : t("checkinPage.activeCustomers", { count: filteredCustomers.length })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">{t("checkinPage.noCustomers")}</p>
                    <p className="text-sm">{t("checkinPage.noCustomers")}</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className={cn(
                      "customer-row cursor-pointer border border-transparent rounded-xl",
                      selectedCustomer?.id === customer.id &&
                        "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customer.name}</p>
                        <span className="text-sm text-muted-foreground font-cairo">
                          {customer.nameAr}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone} • {customer.mealsPerDay} meals/day
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {customer.daysRemaining} days left
                        </span>
                      </div>
                      {getStatusBadge(customer.status)}
                    </div>
                  </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Check-in Panel & Recent */}
          <div className="space-y-6">
            {/* Check-in Panel */}
            <Card className={cn(
              "shadow-soft transition-all duration-300",
              selectedCustomer && "ring-2 ring-primary shadow-glow"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t("checkinPage.checkin")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedCustomer ? (
                  <>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 mb-3">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                      <p className="text-muted-foreground font-cairo">
                        {selectedCustomer.nameAr}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCustomer.plan} • {selectedCustomer.daysRemaining} days remaining
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-3">
                        {t("checkinPage.mealsToPick")}
                      </label>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-xl"
                          onClick={() => setMealCount(Math.max(0, mealCount - 1))}
                          disabled={mealCount === 0}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <div className="w-20 text-center">
                          <span className="text-4xl font-bold">{mealCount}</span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("checkinPage.ofAllowed", { count: selectedCustomer.mealsPerDay })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-xl"
                          onClick={() =>
                            setMealCount(
                              Math.min(selectedCustomer.mealsPerDay, mealCount + 1)
                            )
                          }
                          disabled={mealCount >= selectedCustomer.mealsPerDay}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {selectedCustomer.status === "expiring" && (
                      <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-warning">{t("checkinPage.expiringWarning")}</p>
                          <p className="text-muted-foreground">
                            {t("checkinPage.daysRemaining", { days: selectedCustomer.daysRemaining })}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full h-14 text-lg gap-2 bg-gradient-primary hover:opacity-90"
                      onClick={handleCheckIn}
                      disabled={mealCount === 0}
                    >
                      <Check className="h-5 w-5" />
                      {t("checkinPage.confirmCheckin")}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">{t("checkinPage.noCustomerSelected")}</p>
                    <p className="text-sm">{t("checkinPage.searchOrScan")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("checkinPage.todaysCheckins", { count: todayCheckIns.length })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayCheckIns.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t("checkinPage.noCheckins")}</p>
                  </div>
                ) : (
                  todayCheckIns.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{checkin.customerName}</p>
                          {getAttendanceBadge(checkin.attendanceStatus)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {checkin.mealsPickedUp} meals • {new Date(checkin.createdAt).toLocaleTimeString()}
                        </p>
                        {checkin.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{checkin.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditCheckIn(checkin)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCheckIn(checkin.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Check-in Dialog */}
      <Dialog open={!!editingCheckIn} onOpenChange={() => setEditingCheckIn(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("checkinPage.editDialogTitle")}</DialogTitle>
          </DialogHeader>
          {editingCheckIn && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-lg font-semibold">{editingCheckIn.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(editingCheckIn.checkInDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-3">
                  {t("checkinPage.mealsPicked")}
                </label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => setEditMealCount(Math.max(0, editMealCount - 1))}
                    disabled={editMealCount === 0}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="w-20 text-center">
                    <span className="text-4xl font-bold">{editMealCount}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => setEditMealCount(editMealCount + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  {t("checkinPage.attendanceStatus")}
                </label>
                <Select value={editAttendanceStatus} onValueChange={(value) => setEditAttendanceStatus(value as AttendanceStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">{t("checkinPage.calendarStatus.present")}</SelectItem>
                    <SelectItem value="absent">{t("checkinPage.calendarStatus.absent")}</SelectItem>
                    <SelectItem value="paused">{t("checkinPage.calendarStatus.paused")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  {t("checkinPage.notes")}
                </label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={t("checkinPage.notes")}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingCheckIn(null)}
                  className="flex-1"
                >
                  {t("common.buttons.cancel")}
                </Button>
                <Button
                  onClick={handleUpdateCheckIn}
                  disabled={submitting}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {submitting ? t("checkinPage.updateCheckin") : t("checkinPage.updateCheckin")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CheckInPage;
