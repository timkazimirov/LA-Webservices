import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, Eye, Clock, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import type { Project, AnalyticsSnapshot } from "@shared/schema";

export default function AnalyticsPage() {
  const [selectedProject, setSelectedProject] = useState<string>("");

  const { data: projectsList, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsSnapshot[]>({
    queryKey: ["/api/analytics", selectedProject],
    enabled: !!selectedProject,
  });

  if (!selectedProject && projectsList && projectsList.length > 0) {
    setSelectedProject(projectsList[0].id);
  }

  const totalVisitors = analytics?.reduce((s, a) => s + a.visitors, 0) || 0;
  const totalPageViews = analytics?.reduce((s, a) => s + a.pageViews, 0) || 0;
  const avgBounce = analytics && analytics.length > 0
    ? (analytics.reduce((s, a) => s + parseFloat(a.bounceRate || "0"), 0) / analytics.length).toFixed(1)
    : "0";
  const avgDuration = analytics && analytics.length > 0
    ? Math.round(analytics.reduce((s, a) => s + (a.avgSessionDuration || 0), 0) / analytics.length)
    : 0;

  const chartData = analytics?.map(a => ({
    date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visitors: a.visitors,
    pageViews: a.pageViews,
    bounceRate: parseFloat(a.bounceRate || "0"),
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Website performance metrics</p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[260px]" data-testid="select-analytics-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projectsList?.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProject ? (
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Select a project to view analytics</p>
        </div>
      ) : analyticsLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
          <Skeleton className="h-80 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Visitors</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-visitors">{totalVisitors.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                  </div>
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Views</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-pageviews">{totalPageViews.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                  </div>
                  <div className="w-9 h-9 rounded-md bg-chart-2/10 flex items-center justify-center"><Eye className="w-4 h-4 text-chart-2" /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bounce Rate</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-bounce">{avgBounce}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Average</p>
                  </div>
                  <div className="w-9 h-9 rounded-md bg-chart-4/10 flex items-center justify-center"><TrendingDown className="w-4 h-4 text-chart-4" /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Session</p>
                    <p className="text-2xl font-bold mt-1" data-testid="stat-session">{Math.floor(avgDuration / 60)}m {avgDuration % 60}s</p>
                    <p className="text-xs text-muted-foreground mt-1">Duration</p>
                  </div>
                  <div className="w-9 h-9 rounded-md bg-chart-3/10 flex items-center justify-center"><Clock className="w-4 h-4 text-chart-3" /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Visitors & Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" fill="url(#colorVisitors)" strokeWidth={2} />
                    <Area type="monotone" dataKey="pageViews" stroke="hsl(var(--chart-2))" fill="url(#colorPageViews)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bounce Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="bounceRate" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
