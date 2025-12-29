import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Users, Store, Bell, MessageSquare, Clock, Save } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { apiUrl } from "@/api/config";
import { toast } from "sonner";

type TeamRole = "admin" | "staff";

interface TeamMember {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: TeamRole;
}

const SettingsPage = () => {
  const { t } = useLocale();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff" as TeamRole,
  });

  const fetchTeam = async () => {
    try {
      setLoadingTeam(true);
      const res = await fetch(apiUrl("team"));
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeamMembers(data);
    } catch {
      toast.error(t("settings.team.loadError"));
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.phone) {
      toast.error(t("settings.team.required"));
      return;
    }
    try {
      setCreatingTeam(true);
      const res = await fetch(apiUrl("team"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("settings.team.createError"));
      }
      toast.success(t("settings.team.created"));
      setNewMember({ name: "", email: "", phone: "", role: "staff" });
      fetchTeam();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.team.createError"));
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleUpdateMember = async (memberId: number, payload: Partial<TeamMember>) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    try {
      setUpdatingId(memberId);
      const res = await fetch(apiUrl(`team/${memberId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name ?? member.name,
          email: payload.email ?? member.email,
          phone: payload.phone ?? member.phone,
          role: payload.role ?? member.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("settings.team.updateError"));
      }
      toast.success(t("settings.team.updated"));
      fetchTeam();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.team.updateError"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    if (!confirm(t("settings.team.deleteConfirm", { name: member.name }))) return;
    try {
      setUpdatingId(memberId);
      const res = await fetch(apiUrl(`team/${memberId}`), { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("settings.team.deleteError"));
      }
      toast.success(t("settings.team.deleted"));
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.team.deleteError"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="store" className="gap-2">
              <Store className="h-4 w-4" />
              {t("settings.tabs.store")}
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <Clock className="h-4 w-4" />
              {t("settings.tabs.subscriptions")}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              {t("settings.tabs.notifications")}
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {t("settings.tabs.whatsapp")}
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              {t("settings.tabs.team")}
            </TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t("settings.store.title")}</CardTitle>
                <CardDescription>{t("settings.store.desc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">{t("settings.store.name")}</Label>
                    <Input id="storeName" defaultValue="Healthy Life ???? ????" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeNameAr">{t("settings.store.nameAr")}</Label>
                    <Input id="storeNameAr" defaultValue="???? ????" className="font-cairo text-right" dir="rtl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("settings.store.phone")}</Label>
                    <Input id="phone" defaultValue="+966501234567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("settings.store.email")}</Label>
                    <Input id="email" type="email" defaultValue="contact@nutrimeal.sa" />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">{t("settings.store.hours")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("settings.store.pickupStart")}</Label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.store.pickupEnd")}</Label>
                      <Input type="time" defaultValue="22:00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Save className="h-4 w-4" />
                    {t("settings.store.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Rules */}
          <TabsContent value="subscriptions">
            <div className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>{t("settings.subscriptions.title")}</CardTitle>
                  <CardDescription>
                    {t("settings.subscriptions.desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                    <p className="text-sm font-medium">{t("settings.subscriptions.movedTitle")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.subscriptions.movedDesc")}
                    </p>
                    <Button asChild variant="outline" className="mt-2 w-fit">
                      <a href="/subscriptions">{t("settings.subscriptions.goToPlans")}</a>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{t("settings.subscriptions.backupGrace")}</Label>
                      <Input type="number" defaultValue="7" />
                      <p className="text-xs text-muted-foreground">
                        {t("settings.subscriptions.backupGraceHint")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.subscriptions.editWindow")}</Label>
                      <Input type="number" defaultValue="3" />
                      <p className="text-xs text-muted-foreground">
                        {t("settings.subscriptions.editWindowHint")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("settings.subscriptions.partialPickup")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.subscriptions.partialPickupDesc")}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-end">
                    <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                      <Save className="h-4 w-4" />
                      {t("settings.subscriptions.save")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t("settings.notifications.title")}</CardTitle>
                <CardDescription>
                  {t("settings.notifications.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label>{t("settings.notifications.expiryFirst")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.notifications.expiryHint")}
                      </p>
                    </div>
                    <Input type="number" defaultValue="5" className="w-20" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label>{t("settings.notifications.expirySecond")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.notifications.expiryHint")}
                      </p>
                    </div>
                    <Input type="number" defaultValue="2" className="w-20" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label>{t("settings.notifications.inactive")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.notifications.inactiveHint")}
                      </p>
                    </div>
                    <Input type="number" defaultValue="3" className="w-20" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Save className="h-4 w-4" />
                    {t("settings.notifications.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t("settings.whatsapp.title")}</CardTitle>
                <CardDescription>
                  {t("settings.whatsapp.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning font-medium">
                    {t("settings.whatsapp.warningTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("settings.whatsapp.warningDesc")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t("settings.whatsapp.phone")}</Label>
                    <Input placeholder="+966XXXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.whatsapp.token")}</Label>
                    <Input type="password" placeholder={t("settings.whatsapp.tokenPlaceholder")} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">{t("settings.whatsapp.messageSettings")}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("settings.whatsapp.includeArabic")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.whatsapp.includeArabicDesc")}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("settings.whatsapp.autoSend")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.whatsapp.autoSendDesc")}
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Save className="h-4 w-4" />
                    {t("settings.whatsapp.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t("settings.team.title")}</CardTitle>
                <CardDescription>
                  {t("settings.team.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-lg border border-border p-4 bg-muted/20">
                  <Input
                    placeholder={t("settings.team.name")}
                    value={newMember.name}
                    onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                    className="md:col-span-1"
                  />
                  <Input
                    placeholder={t("settings.team.email")}
                    value={newMember.email}
                    onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                    className="md:col-span-1"
                  />
                  <Input
                    placeholder={t("settings.team.phone")}
                    value={newMember.phone}
                    onChange={(e) => setNewMember((p) => ({ ...p, phone: e.target.value }))}
                    className="md:col-span-1"
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value as TeamRole }))}
                    className="md:col-span-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="staff">{t("settings.team.role.staff")}</option>
                    <option value="admin">{t("settings.team.role.admin")}</option>
                  </select>
                  <Button className="w-full md:col-span-1" onClick={handleCreateMember} disabled={creatingTeam}>
                    {creatingTeam ? t("settings.team.creating") : t("settings.team.add")}
                  </Button>
                </div>

                <div className="space-y-3">
                  {loadingTeam ? (
                    <p className="text-sm text-muted-foreground">{t("settings.team.loading")}</p>
                  ) : teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("settings.team.empty")}</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email || "—"}</p>
                            <p className="text-xs text-muted-foreground">{member.phone || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleUpdateMember(member.id, { role: e.target.value as TeamRole })
                            }
                            className="flex h-9 rounded-md border border-input bg-background px-2 py-1 text-sm"
                            disabled={updatingId === member.id}
                          >
                            <option value="staff">{t("settings.team.role.staff")}</option>
                            <option value="admin">{t("settings.team.role.admin")}</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={updatingId === member.id}
                          >
                            {t("settings.team.delete")}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
