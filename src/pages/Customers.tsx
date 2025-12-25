import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { apiUrl } from "../api/config";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Filter,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  plan: string;
  daysRemaining: number;
  totalPickups: number;
  joinDate: string;
  status: "active" | "expiring" | "expired" | "inactive";
}

interface Customer {
  id: number;
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  plan: string;
  mealsPerDay: number;
  daysRemaining: number;
  totalPickups: number;
  joinDate: string;
  status: "active" | "expiring" | "expired" | "inactive";
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  mealsPerDay: number;
  features: string;
  status: string;
  createdAt: string;
}

const CustomersPage = () => {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [subscribingCustomer, setSubscribingCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    planId: "",
    paymentMethod: "",
    paymentDetails: "",
    paymentAmount: "",
    receiptImage: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(apiUrl('customers'));
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch(apiUrl('subscriptions'));
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const data = await response.json();
      setSubscriptionPlans(data);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchSubscriptionPlans();
  }, []);

  // Create customer
  const handleCreateCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone number are required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(apiUrl('customers'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const newCustomer = await response.json();
      setCustomers(prev => [newCustomer, ...prev]);
      setIsCreateDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
      toast.success("Customer created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create customer');
      console.error('Error creating customer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Update customer
  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !formData.name || !formData.phone) {
      toast.error("Name and phone number are required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(apiUrl(`customers/${editingCustomer.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      const updatedCustomer = await response.json();
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
      toast.success("Customer updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update customer');
      console.error('Error updating customer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`customers/${customerId}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      setCustomers(prev => prev.filter(c => c.id !== customerId));
      toast.success("Customer deleted successfully");
    } catch (err) {
      toast.error("Failed to delete customer");
      console.error('Error deleting customer:', err);
    }
  };

  // Subscribe customer
  const handleSubscribeCustomer = async () => {
    if (!subscribingCustomer || !subscriptionFormData.planId) {
      toast.error("Please select a subscription plan");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(apiUrl(`customers/${subscribingCustomer.id}/subscribe`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to subscribe customer');
      }

      const newSubscription = await response.json();
      // Refresh customers to show updated subscription info
      await fetchCustomers();
      setIsSubscribeDialogOpen(false);
      setSubscribingCustomer(null);
      setSubscriptionFormData({ planId: "", paymentMethod: "", paymentDetails: "", paymentAmount: "", receiptImage: "" });
      toast.success("Customer subscribed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to subscribe customer');
      console.error('Error subscribing customer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open subscribe dialog
  const openSubscribeDialog = (customer: Customer) => {
    setSubscribingCustomer(customer);
    setSubscriptionFormData({ planId: "", paymentMethod: "", paymentDetails: "", paymentAmount: "", receiptImage: "" });
    setIsSubscribeDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", address: "" });
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone && customer.phone.includes(search));
    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="badge-success">{t("common.status.active")}</Badge>;
      case "expiring":
        return <Badge className="badge-warning">{t("common.status.expiring")}</Badge>;
      case "expired":
        return <Badge className="badge-destructive">{t("common.status.expired")}</Badge>;
      case "inactive":
        return <Badge variant="secondary">{t("common.status.inactive")}</Badge>;
    }
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    expiring: customers.filter((c) => c.status === "expiring").length,
    expired: customers.filter((c) => c.status === "expired").length,
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("customersPage.title")}</h1>
            <p className="text-muted-foreground">
              {t("customersPage.subtitle")}
            </p>
          </div>
          <Button
            className="gap-2 bg-gradient-primary hover:opacity-90"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t("customersPage.addCustomer")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("customersPage.statsTotal")}</p>
              <p className="text-2xl font-bold">{loading ? "..." : stats.total}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("customersPage.statsActive")}</p>
              <p className="text-2xl font-bold text-success">{loading ? "..." : stats.active}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("customersPage.statsExpiring")}</p>
              <p className="text-2xl font-bold text-warning">{loading ? "..." : stats.expiring}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("customersPage.statsExpired")}</p>
              <p className="text-2xl font-bold text-destructive">{loading ? "..." : stats.expired}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("customersPage.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {["all", "active", "expiring", "expired"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-gradient-primary" : ""}
                  >
                    {status === "all"
                      ? t("customersPage.filtersAll")
                      : t(`common.status.${status}` as const)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchCustomers} variant="outline">
                  {t("common.buttons.update")}
                </Button>
              </div>
            )}
            {!error && (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t("customersPage.tableCustomer")}</TableHead>
                      <TableHead>{t("customersPage.tableContact")}</TableHead>
                      <TableHead>{t("customersPage.tablePlan")}</TableHead>
                      <TableHead>{t("customersPage.tableDaysLeft")}</TableHead>
                      <TableHead>{t("customersPage.tablePickups")}</TableHead>
                      <TableHead>{t("customersPage.tableStatus")}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          {t("customersPage.loadingCustomers")}
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("customersPage.noCustomers")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {customer.phone || "--"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {customer.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.plan}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{customer.daysRemaining}</span>
                          </TableCell>
                          <TableCell>
                            <span>{customer.totalPickups}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => openEditDialog(customer)}
                                >
                                  <Edit className="h-4 w-4" />
                                  {t("customersPage.actionEdit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => openSubscribeDialog(customer)}
                                >
                                  <Package className="h-4 w-4" />
                                  {t("customersPage.actionSubscribe")}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  {t("customersPage.actionMessage")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {t("customersPage.actionDelete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Customer Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("customersPage.createTitle")}</DialogTitle>
              <DialogDescription>
                {t("customersPage.createDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("customersPage.nameLabel")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("customersPage.nameLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("customersPage.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t("customersPage.emailLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("customersPage.phoneLabel")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t("customersPage.phoneLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("customersPage.addressLabel")}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t("customersPage.addressLabel")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                {t("customersPage.cancel")}
              </Button>
              <Button onClick={handleCreateCustomer} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("customersPage.createButton")}
                  </>
                ) : (
                  t("customersPage.createButton")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("customersPage.editTitle")}</DialogTitle>
              <DialogDescription>
                {t("customersPage.editDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("customersPage.nameLabel")}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("customersPage.nameLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t("customersPage.emailLabel")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t("customersPage.emailLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t("customersPage.phoneLabel")}</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t("customersPage.phoneLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">{t("customersPage.addressLabel")}</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t("customersPage.addressLabel")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                {t("customersPage.cancel")}
              </Button>
              <Button onClick={handleUpdateCustomer} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("customersPage.updateButton")}
                  </>
                ) : (
                  t("customersPage.updateButton")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subscribe Dialog */}
        <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("customersPage.subscribeTitle")}</DialogTitle>
              <DialogDescription>
                {t("customersPage.subscribeDesc", { name: subscribingCustomer?.name || "" })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan" className="text-right">
                  {t("customersPage.planLabel")}
                </Label>
                <select
                  id="plan"
                  value={subscriptionFormData.planId}
                  onChange={(e) => {
                    const nextPlanId = e.target.value;
                    const selectedPlan = subscriptionPlans.find((p) => String(p.id) === nextPlanId);
                    setSubscriptionFormData(prev => ({
                      ...prev,
                      planId: nextPlanId,
                      // Pre-fill payment amount with plan price when selecting a plan
                      paymentAmount: selectedPlan ? String(selectedPlan.price ?? "") : prev.paymentAmount,
                    }));
                  }}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t("customersPage.planLabel")}</option>
                  {subscriptionPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price} ({plan.duration} days)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-method" className="text-right">
                  {t("customersPage.paymentMethod")}
                </Label>
                <select
                  id="payment-method"
                  value={subscriptionFormData.paymentMethod}
                  onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t("customersPage.paymentMethod")}</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-amount" className="text-right">
                  {t("customersPage.paymentAmount")}
                </Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  value={subscriptionFormData.paymentAmount}
                  onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                  className="col-span-3"
                  placeholder={t("customersPage.paymentAmount")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-details" className="text-right">
                  {t("customersPage.paymentDetails")}
                </Label>
                <Textarea
                  id="payment-details"
                  value={subscriptionFormData.paymentDetails}
                  onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, paymentDetails: e.target.value }))}
                  className="col-span-3"
                  placeholder={t("customersPage.paymentDetails")}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="receipt-image" className="text-right">
                  {t("customersPage.receiptImage")}
                </Label>
                <Input
                  id="receipt-image"
                  value={subscriptionFormData.receiptImage}
                  onChange={(e) => setSubscriptionFormData(prev => ({ ...prev, receiptImage: e.target.value }))}
                  className="col-span-3"
                  placeholder={t("customersPage.receiptImage")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubscribeDialogOpen(false);
                  setSubscribingCustomer(null);
                  setSubscriptionFormData({ planId: "", paymentMethod: "", paymentDetails: "", paymentAmount: "", receiptImage: "" });
                }}
              >
                {t("customersPage.cancel")}
              </Button>
              <Button onClick={handleSubscribeCustomer} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("customersPage.subscribeButton")}
                  </>
                ) : (
                  t("customersPage.subscribeButton")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CustomersPage;
