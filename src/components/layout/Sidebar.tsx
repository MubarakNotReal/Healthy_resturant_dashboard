import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  CalendarCheck,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart3,
  Leaf,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";

const navigation = [
  { nameKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { nameKey: "nav.dailyMenu", href: "/menu", icon: UtensilsCrossed },
  { nameKey: "nav.checkIn", href: "/checkin", icon: CalendarCheck },
  { nameKey: "nav.customers", href: "/customers", icon: Users },
  { nameKey: "nav.subscriptions", href: "/subscriptions", icon: Package },
  { nameKey: "nav.messages", href: "/messages", icon: MessageSquare },
  { nameKey: "nav.reports", href: "/reports", icon: BarChart3 },
];

const adminNavigation = [
  { nameKey: "nav.settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Temporarily disable auth for debugging
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLocale();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
              <Leaf className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-foreground">
                NutriMeal
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {allNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.nameKey}
                to={item.href}
                className={cn(
                  "nav-item",
                  isActive && "active",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                {!collapsed && <span>{t(item.nameKey)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn("flex items-center gap-3 mb-3", collapsed && "justify-center")}>
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || t("nav.userFallback")}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {user?.role || t("nav.roleFallback")}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
