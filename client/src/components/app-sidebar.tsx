import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Users, FolderKanban, FileText, Receipt, MessageSquare, BarChart3, LogOut,
} from "lucide-react";
import logoPath from "@assets/la-webservices-logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const clientItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Projects", url: "/projects", icon: FolderKanban },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const items = isAdmin ? adminItems : clientItems;

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread"],
    refetchInterval: 15000,
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <img src={logoPath} alt="LA Webservices" className="w-10 h-10 rounded-md object-contain" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight">LA</h1>
              <p className="text-[10px] text-muted-foreground tracking-wide uppercase">Webservices</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Management" : "Portal"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url || (item.url !== "/dashboard" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.title === "Messages" && unreadData && unreadData.count > 0 && (
                          <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center no-default-active-elevate">
                            {unreadData.count}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">{user?.fullName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.company || user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
