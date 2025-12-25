import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  Clock,
  UserX,
  Package,
  MessageSquareWarning,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: "expiring" | "inactive" | "message_failed" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
}

const notifications: Notification[] = [
  // Data will be loaded from database
];

const NotificationsPage = () => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "expiring":
        return <Package className="h-5 w-5" />;
      case "inactive":
        return <UserX className="h-5 w-5" />;
      case "message_failed":
        return <MessageSquareWarning className="h-5 w-5" />;
      case "system":
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconStyle = (type: Notification["type"]) => {
    switch (type) {
      case "expiring":
        return "bg-warning/10 text-warning";
      case "inactive":
        return "bg-destructive/10 text-destructive";
      case "message_failed":
        return "bg-muted text-muted-foreground";
      case "system":
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on important events
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft border-l-4 border-l-warning">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-l-4 border-l-destructive">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <UserX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Inactive Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-l-4 border-l-muted-foreground">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <MessageSquareWarning className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Failed Messages</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl transition-colors",
                  notification.read ? "bg-transparent" : "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                    getIconStyle(notification.type)
                  )}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn("font-medium", !notification.read && "text-foreground")}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.description}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                    {notification.actionLabel && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        {notification.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
