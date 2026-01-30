import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Ticket,
  MessageSquare,
  Users,
  HelpCircle,
  UtensilsCrossed,
  Megaphone,
  CheckSquare,
  Calendar,
  MessageCircle,
  Settings,
  Hotel,
  Crown,
  Bot,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Analytics Dashboard", url: "/", icon: BarChart3 },
  { title: "Ticket Management", url: "/tickets", icon: Ticket },
  { title: "Review Management", url: "/reviews", icon: MessageSquare },
  { title: "User Management", url: "/users", icon: Users },
  { title: "Booking Information", url: "/bookings", icon: Calendar },
  { title: "Guest Interactions", url: "/interactions", icon: MessageCircle },
];

const operationsItems = [
  { title: "Q&A Manager", url: "/qna", icon: HelpCircle },
  { title: "Menu Manager", url: "/menu", icon: UtensilsCrossed },
  { title: "Rate Management", url: "/rate-management", icon: IndianRupee },
  { title: "Channel Management", url: "/channel-management", icon: TrendingUp },
  { title: "Campaigns Manager", url: "/campaigns", icon: Megaphone },
  { title: "Do's & Don'ts", url: "/policies", icon: CheckSquare },
];

const systemItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) =>
    cn(
      "w-full justify-start smooth-transition font-medium",
      isActive(path)
        ? "bg-hotel-gold text-hotel-navy font-semibold shadow-sm"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    );

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={cn("border-r border-sidebar-border", isCollapsed ? "w-16" : "w-64")}>
      <SidebarContent className="py-4">
        {/* Hotel Logo & Brand */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-hotel-gold rounded-lg">
              <Crown className="h-6 w-6 text-hotel-navy" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold luxury-gradient bg-clip-text text-transparent">
                  ILORA RETREATS
                </h1>
                <p className="text-xs text-muted-foreground">Hotel Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-hotel-gold font-semibold">
            {!isCollapsed && "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-hotel-gold font-semibold">
            {!isCollapsed && "Operations"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-hotel-gold font-semibold">
            {!isCollapsed && "System"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}