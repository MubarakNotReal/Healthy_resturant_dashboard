import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";
import {
  CheckCircle,
  Eye,
  FileText,
  Image,
  Link as LinkIcon,
  Send,
  Users,
  XCircle,
  Clock,
} from "lucide-react";

interface MessageLog {
  id: number;
  campaign: string;
  recipients: number;
  delivered: number;
  read: number;
  failed: number;
  date: string;
  status: "completed" | "in-progress" | "failed";
}

interface TemplateOption {
  id: number;
  name: string;
  nameAr: string;
  description: string;
}

const messageLogs: MessageLog[] = [
  {
    id: 1,
    campaign: "Expiry Reminder",
    recipients: 120,
    delivered: 118,
    read: 102,
    failed: 2,
    date: "Today, 10:30 AM",
    status: "completed",
  },
  {
    id: 2,
    campaign: "Daily Menu",
    recipients: 85,
    delivered: 82,
    read: 64,
    failed: 3,
    date: "Yesterday, 6:00 PM",
    status: "in-progress",
  },
];

const templates: TemplateOption[] = [
  { id: 1, name: "Daily Menu", nameAr: "قائمة اليوم", description: "Send today's menu to customers" },
  { id: 2, name: "Expiry Reminder", nameAr: "تذكير بانتهاء الاشتراك", description: "Remind customers about expiring subscription" },
  { id: 3, name: "Inactivity Reminder", nameAr: "تذكير بالنشاط", description: "Remind inactive customers" },
  { id: 4, name: "Welcome Message", nameAr: "رسالة ترحيب", description: "Welcome new subscribers" },
];

const MessagesPage = () => {
  const { t } = useLocale();
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("promo");
  const [customMessage, setCustomMessage] = useState("");

  const segments = [
    { value: "all", label: t("messagesPage.compose.segmentAll"), count: 127 },
    { value: "expiring", label: t("messagesPage.compose.segmentExpiring"), count: 12 },
    { value: "inactive", label: t("messagesPage.compose.segmentInactive"), count: 5 },
    { value: "twoMeals", label: t("messagesPage.compose.segmentTwoMeals"), count: 78 },
    { value: "threeMeals", label: t("messagesPage.compose.segmentThreeMeals"), count: 49 },
  ];

  const getStatusBadge = (status: MessageLog["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="badge-success">{t("messagesPage.status.completed")}</Badge>;
      case "in-progress":
        return <Badge className="badge-info">{t("messagesPage.status.inProgress")}</Badge>;
      case "failed":
        return <Badge variant="destructive">{t("messagesPage.status.failed")}</Badge>;
      default:
        return null;
    }
  };

  const selectedSegmentCount = segments.find((s) => s.value === selectedSegment)?.count ?? 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("messagesPage.title")}</h1>
          <p className="text-muted-foreground">{t("messagesPage.subtitle")}</p>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="compose" className="gap-2">
              <Send className="h-4 w-4" />
              {t("messagesPage.tabCompose")}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              {t("messagesPage.tabHistory")}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              {t("messagesPage.tabTemplates")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="shadow-soft lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("messagesPage.compose.title")}</CardTitle>
                  <CardDescription>{t("messagesPage.compose.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("messagesPage.compose.senderAccount")}</Label>
                      <Select defaultValue="main">
                        <SelectTrigger>
                          <SelectValue placeholder={t("messagesPage.compose.selectAccount")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">{t("messagesPage.compose.accountMain")}</SelectItem>
                          <SelectItem value="support">{t("messagesPage.compose.accountSupport")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("messagesPage.compose.targetCustomers")}</Label>
                      <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("messagesPage.compose.selectSegment")} />
                        </SelectTrigger>
                        <SelectContent>
                          {segments.map((segment) => (
                            <SelectItem key={segment.value} value={segment.value}>
                              {segment.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("messagesPage.compose.messageTemplate")}</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("messagesPage.compose.selectTemplate")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promo">{t("messagesPage.compose.templatePromo")}</SelectItem>
                        <SelectItem value="renewal">{t("messagesPage.compose.templateRenewal")}</SelectItem>
                        <SelectItem value="feedback">{t("messagesPage.compose.templateFeedback")}</SelectItem>
                        <SelectItem value="custom">{t("messagesPage.compose.templateCustom")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("messagesPage.compose.deliverySchedule")}</Label>
                      <Select defaultValue="now">
                        <SelectTrigger>
                          <SelectValue placeholder={t("messagesPage.compose.selectSchedule")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">{t("messagesPage.compose.scheduleNow")}</SelectItem>
                          <SelectItem value="later">{t("messagesPage.compose.scheduleLater")}</SelectItem>
                          <SelectItem value="morning">{t("messagesPage.compose.scheduleMorning")}</SelectItem>
                          <SelectItem value="evening">{t("messagesPage.compose.scheduleEvening")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("messagesPage.compose.personalization")}</Label>
                      <div className="flex flex-wrap gap-2">
                        {["{first_name}", "{plan_name}", "{renewal_date}", "{checkin_count}"].map((token) => (
                          <Button key={token} variant="outline" size="sm" className="font-mono">
                            {token}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("messagesPage.compose.messageContent")}</Label>
                    <div className="rounded-md bg-muted/50 p-4">
                      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">HSM</Badge>
                        <span>{t("messagesPage.compose.verifiedLabel")}</span>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="font-medium text-foreground">Hey {`{first_name}`},</p>
                        <p className="text-muted-foreground">{t("messagesPage.compose.templatePreview")}</p>
                        <div className="space-y-1">
                          <p className="text-foreground">{t("messagesPage.compose.previewLink")}</p>
                          <p className="text-primary">nourishhub.app/menu/today</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("messagesPage.compose.attachments")}</Label>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Image className="mr-2 h-4 w-4" />
                        {t("messagesPage.compose.addImage")}
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        {t("messagesPage.compose.addDocument")}
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {t("messagesPage.compose.addLink")}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("messagesPage.compose.customMessage")}</Label>
                    <Textarea
                      placeholder={t("messagesPage.customPlaceholder")}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="min-h-[180px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{t("messagesPage.variablesHint")}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" />
                      {t("messagesPage.preview")}
                    </Button>
                    <Button className="flex-1 gap-2 bg-gradient-primary hover:opacity-90">
                      <Send className="h-4 w-4" />
                      {t("messagesPage.sendToCount", { count: selectedSegmentCount })}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t("messagesPage.messagePreview")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[260px] rounded-xl bg-[#e5ddd5] p-4">
                      <div className="ml-auto max-w-[80%] rounded-lg bg-[#dcf8c6] p-3 shadow-sm">
                        <p className="text-sm text-gray-800">
                          {customMessage || t("messagesPage.compose.previewFallback")}
                        </p>
                        <p className="mt-1 text-[10px] text-gray-500">12:00 PM ✓✓</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4" />
                      {t("messagesPage.selectedAudience")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {segments
                        .filter((s) => s.value === selectedSegment)
                        .map((segment) => (
                          <div
                            key={segment.value}
                            className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                          >
                            <span className="text-sm font-medium">{segment.label}</span>
                            <Badge>{t("messagesPage.compose.segmentCount", { count: segment.count })}</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t("messagesPage.tabHistory")}</CardTitle>
                <CardDescription>{t("messagesPage.historySubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                {messageLogs.length === 0 ? (
                  <div className="flex items-center justify-center rounded-lg bg-muted/30 p-6 text-sm text-muted-foreground">
                    {t("messagesPage.noHistory")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messageLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Send className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{log.campaign}</p>
                            <p className="text-sm text-muted-foreground">{log.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{log.recipients}</span>
                          </div>
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle className="h-4 w-4" />
                            <span>{log.delivered}</span>
                          </div>
                          <div className="flex items-center gap-1 text-info">
                            <Eye className="h-4 w-4" />
                            <span>{log.read}</span>
                          </div>
                          {log.failed > 0 && (
                            <div className="flex items-center gap-1 text-destructive">
                              <XCircle className="h-4 w-4" />
                              <span>{log.failed}</span>
                            </div>
                          )}
                        </div>
                        {getStatusBadge(log.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer shadow-soft transition-shadow hover:shadow-medium"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary">{t("messagesPage.status.active")}</Badge>
                    </div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="font-cairo mt-1 text-sm text-muted-foreground">{template.nameAr}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
              <Card className="cursor-pointer border-dashed shadow-soft transition-colors hover:bg-muted/30">
                <CardContent className="flex min-h-[180px] h-full flex-col items-center justify-center p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">{t("messagesPage.addTemplate")}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default MessagesPage;
