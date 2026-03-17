import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { useGetDashboardStats, type DashboardStats } from "@workspace/api-client-react";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Handle missing backend nicely
  const defaultStats: DashboardStats = {
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    monthSales: 0,
    monthOrders: 0,
    salesChart: [],
    recentOrders: [],
    lowStockProducts: [],
  };

  // Some API clients wrap payloads as `{ data: ... }`. Also guard against partial payloads.
  const d =
    ((stats as unknown as { data?: typeof defaultStats } | null)?.data as
      | typeof defaultStats
      | undefined) ??
    (stats ?? defaultStats);

  const todaySales = Number(d.todaySales ?? 0);
  const todayOrders = Number(d.todayOrders ?? 0);
  const totalCustomers = Number(d.totalCustomers ?? 0);
  const lowStockCount = Number(d.lowStockCount ?? 0);
  const salesChart = Array.isArray(d.salesChart) ? d.salesChart : [];
  const recentOrders = Array.isArray(d.recentOrders) ? d.recentOrders : [];

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your business performance today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={`$${todaySales.toFixed(2)}`} 
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          trend={+12.5}
          trendText="vs yesterday"
          bgClass="bg-emerald-500/10"
        />
        <StatCard 
          title="Today's Orders" 
          value={todayOrders.toString()} 
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          trend={+5.2}
          trendText="vs yesterday"
          bgClass="bg-primary/10"
        />
        <StatCard 
          title="Total Customers" 
          value={totalCustomers.toString()} 
          icon={<Users className="w-5 h-5 text-blue-500" />}
          bgClass="bg-blue-500/10"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockCount.toString()} 
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          bgClass="bg-amber-500/10"
          isAlert={lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Sales performance over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {salesChart.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                <p>No sales data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="rounded-2xl border-border/50 shadow-md flex flex-col">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        #{order.id}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.customerName || "Walk-in Customer"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.totalPrice.toFixed(2)}</p>
                      <Badge variant="outline" className={`text-[10px] mt-1 ${order.status === 'completed' ? 'text-emerald-500 border-emerald-500/30' : 'text-amber-500 border-amber-500/30'}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-20" />
                <p>No recent orders.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

function StatCard({ title, value, icon, trend, trendText, bgClass, isAlert }: any) {
  return (
    <Card className={`rounded-2xl border-border/50 shadow-md overflow-hidden relative ${isAlert ? 'border-amber-500/50 shadow-amber-500/10' : ''}`}>
      {isAlert && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />}
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${bgClass}`}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-muted-foreground ml-2">{trendText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
