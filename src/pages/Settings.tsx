import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Store,
  Bell,
  MessageSquare,
  Shield,
  Clock,
  Users,
  Save,
} from "lucide-react";

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your store and system preferences
          </p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="store" className="gap-2">
              <Store className="h-4 w-4" />
              Store
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <Clock className="h-4 w-4" />
              Plans & Rules
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Basic information about your meal store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input id="storeName" defaultValue="Healthy Life هلثي لايف" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeNameAr">Store Name (Arabic)</Label>
                    <Input id="storeNameAr" defaultValue="هلثي لايف" className="font-cairo text-right" dir="rtl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" defaultValue="+966501234567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" defaultValue="contact@nutrimeal.sa" />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Operating Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pickup Start Time</Label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pickup End Time</Label>
                      <Input type="time" defaultValue="22:00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Save className="h-4 w-4" />
                    Save Changes
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
                  <CardTitle>Subscription Rules</CardTitle>
                <CardDescription>
                  Configure how subscriptions and backup days work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                    <p className="text-sm font-medium">Per-plan rules moved to subscription creation.</p>
                    <p className="text-xs text-muted-foreground">
                      Set backup/pause allowances while creating each plan on the Subscriptions page so every plan can have its own limits.
                    </p>
                    <Button asChild variant="outline" className="mt-2 w-fit">
                      <a href="/subscriptions">Go to Subscriptions</a>
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Partial Pickup Allowed</Label>
                      <p className="text-sm text-muted-foreground">
                        Customer can take fewer meals than allowed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-end">
                    <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                      <Save className="h-4 w-4" />
                      Save Rules
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
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure automated reminders and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label>Expiry Reminder - First</Label>
                      <p className="text-sm text-muted-foreground">
                        Days before subscription ends
                      </p>
                    </div>
                    <Input type="number" defaultValue="5" className="w-20" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label>Expiry Reminder - Second</Label>
                      <p className="text-sm text-muted-foreground">
                        Days before subscription ends
                      </p>
                    </div>
                    <Input type="number" defaultValue="2" className="w-20" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <Label>Inactivity Reminder</Label>
                      <p className="text-sm text-muted-foreground">
                        Days without pickup to trigger reminder
                      </p>
                    </div>
                    <Input type="number" defaultValue="3" className="w-20" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>WhatsApp Integration</CardTitle>
                <CardDescription>
                  Configure WhatsApp Business API connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning font-medium">
                    WhatsApp Business API requires setup
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your WhatsApp Business account to enable messaging
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>WhatsApp Business Phone</Label>
                    <Input placeholder="+966XXXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>API Access Token</Label>
                    <Input type="password" placeholder="Enter your API token" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Message Settings</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Arabic Text</Label>
                      <p className="text-sm text-muted-foreground">
                        Send bilingual messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Daily Menu Auto-Send</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically send menu at scheduled time
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage staff access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ahmed Mohammed", email: "ahmed@nutrimeal.sa", role: "Admin" },
                    { name: "Sara Ali", email: "sara@nutrimeal.sa", role: "Staff" },
                    { name: "Omar Hassan", email: "omar@nutrimeal.sa", role: "Staff" },
                  ].map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          member.role === "Admin" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {member.role}
                        </span>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Invite Team Member
                  </Button>
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
