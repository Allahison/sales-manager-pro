import { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Activity, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useGetSalesReport, useGetTopProducts, useGetProfitReport } from "@workspace/api-client-react";
import { PageTransition } from "@/components/page-transition";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { data: sales, isLoading: isLoadingSales } = useGetSalesReport({ period: "daily" });
  const { data: topProducts, isLoading: isLoadingTop } = useGetTopProducts({ limit: 5 });
  const { data: profit, isLoading: isLoadingProfit } = useGetProfitReport();

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your business metrics.</p>
      </div>

      {/* High-level Profit Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={profit?.totalRevenue} prefix="$" isLoading={isLoadingProfit} icon={<DollarSign className="w-5 h-5 text-emerald-500" />} />
        <MetricCard title="Total Cost" value={profit?.totalCost} prefix="$" isLoading={isLoadingProfit} icon={<Package className="w-5 h-5 text-blue-500" />} />
        <MetricCard title="Gross Profit" value={profit?.grossProfit} prefix="$" isLoading={isLoadingProfit} icon={<TrendingUp className="w-5 h-5 text-primary" />} />
        <MetricCard title="Profit Margin" value={profit?.profitMargin} suffix="%" isLoading={isLoadingProfit} icon={<Activity className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="rounded-2xl border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily revenue generation</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSales ? <Skeleton className="h-[300px] w-full rounded-xl" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sales?.data || []}>
                    <defs>
                      <linearGradient id="colorSalesRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesRep)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="rounded-2xl border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By total revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTop ? <Skeleton className="h-[300px] w-full rounded-xl" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts || []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} cursor={{fill: 'hsl(var(--muted)/0.3)'}} />
                    <Bar dataKey="totalRevenue" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

function MetricCard({ title, value, prefix = "", suffix = "", isLoading, icon }: any) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <h3 className="text-3xl font-display font-bold text-foreground">
                {prefix}{value?.toFixed(2)}{suffix}
              </h3>
            )}
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
