import { Link } from "react-router-dom";
import {
  CalendarCheck,
  UtensilsCrossed,
  Send,
  UserPlus,
  Package,
  FileText,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const actions = [
  {
    nameKey: "quickActions.checkinName",
    descriptionKey: "quickActions.checkinDesc",
    icon: CalendarCheck,
    href: "/checkin",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    nameKey: "quickActions.menuName",
    descriptionKey: "quickActions.menuDesc",
    icon: UtensilsCrossed,
    href: "/menu",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    nameKey: "quickActions.messageName",
    descriptionKey: "quickActions.messageDesc",
    icon: Send,
    href: "/messages",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    nameKey: "quickActions.newCustomerName",
    descriptionKey: "quickActions.newCustomerDesc",
    icon: UserPlus,
    href: "/customers/new",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    nameKey: "quickActions.newSubName",
    descriptionKey: "quickActions.newSubDesc",
    icon: Package,
    href: "/subscriptions/new",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    nameKey: "quickActions.reportName",
    descriptionKey: "quickActions.reportDesc",
    icon: FileText,
    href: "/reports",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
];

export function QuickActions() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("quickActions.title")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <Link key={action.nameKey} to={action.href} className="quick-action">
            <div className={`p-3 rounded-xl ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{t(action.nameKey)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(action.descriptionKey)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
