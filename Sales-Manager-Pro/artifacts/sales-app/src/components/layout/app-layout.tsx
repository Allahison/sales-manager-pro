import React from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/pos": "Point of Sale",
  "/products": "Products",
  "/inventory": "Inventory",
  "/customers": "Customers",
  "/orders": "Sales History",
  "/reports": "Analytics & Reports",
  "/expenses": "Expenses",
  "/settings": "Settings",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  const pageTitle = PAGE_TITLES[location] || "NEXUS POS";
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/40 bg-card/60 backdrop-blur-xl sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{pageTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium">{today}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 border border-border shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 px-1.5 capitalize ${
                      isAdmin
                        ? "border-primary/40 text-primary bg-primary/10"
                        : "border-blue-400/40 text-blue-400 bg-blue-400/10"
                    }`}
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gradient-to-b from-background to-background/95">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
