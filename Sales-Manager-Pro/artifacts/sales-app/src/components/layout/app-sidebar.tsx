import { 
  BarChart3, 
  Box, 
  CreditCard, 
  LayoutDashboard, 
  Package, 
  Settings, 
  ShoppingCart, 
  Users, 
  LogOut,
  Store
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const salesmanItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Point of Sale", url: "/pos", icon: ShoppingCart },
    { title: "Inventory", url: "/inventory", icon: Package },
    { title: "Customers", url: "/customers", icon: Users },
    { title: "Orders", url: "/orders", icon: Box },
  ];

  const adminItems = [
    { title: "Products", url: "/products", icon: Package },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Expenses", url: "/expenses", icon: CreditCard },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const menuItems = isAdmin ? [...salesmanItems, ...adminItems] : salesmanItems;

  return (
    <Sidebar variant="inset" className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3 font-display font-bold text-lg text-primary tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store size={20} />
          </div>
          NEXUS POS
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        h-10 px-3 rounded-lg transition-all duration-200
                        ${isActive ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon size={18} className={isActive ? "text-primary" : "opacity-70"} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate capitalize">{user?.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full rounded-md hover:bg-destructive/10"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
