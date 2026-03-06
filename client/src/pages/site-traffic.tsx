import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, Eye, Timer, TrendingUp, TrendingDown, BarChart3, ArrowUpRight, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { AnalyticsSnapshot, Project, User } from "@shared/schema";

type SafeUser = Omit<User, "password">;

export default function SiteTrafficPage() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsSnapshot[]>({
    queryKey: ["/api/analytics/all"],
    refetchInterval: 30000,
  });

  const { data: projectsList } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: clients } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"] });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const clientMap = new Map(clients?.map(c => [c.id, c]) || []);
  const projectMap = new Map(projectsList?.map(p => [p.id, p]) || []);

  const now = new Date();
  const rangeDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
  const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

  const filtered = analytics?.filter(a => {
    const matchesProject = projectFilter === "all" || a.projectId === projectFilter;
    const date = new Date(a.date);
    const matchesRange = date >= rangeStart;
    return matchesProject && matchesRange;
  }) || [];

  const sortedByDate = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalVisitors = filtered.reduce((sum, a) => sum + a.visitors, 0);
  const totalPageViews = filtered.reduce((sum, a) => sum + a.pageViews, 0);
  const avgBounceRate = filtered.length > 0
    ? filtered.reduce((sum, a) => sum + parseFloat(a.bounceRate || "0"), 0) / filtered.length
    : 0;
  const avgSessionDuration = filtered.length > 0
    ? Math.round(filtered.reduce((sum, a) => sum + (a.avgSessionDuration || 0), 0) / filtered.length)
    : 0;

  const prevRangeStart = new Date(rangeStart.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const prevFiltered = analytics?.filter(a => {
    const matchesProject = projectFilter === "all" || a.projectId === projectFilter;
    const date = new Date(a.date);
    return matchesProject && date >= prevRangeStart && date < rangeStart;
  }) || [];

  const prevVisitors = prevFiltered.reduce((sum, a) => sum + a.visitors, 0);
  const prevPageViews = prevFiltered.reduce((sum, a) => sum + a.pageViews, 0);

  const visitorChange = prevVisitors > 0 ? ((totalVisitors - prevVisitors) / prevVisitors * 100) : 0;
  const pageViewChange = prevPageViews > 0 ? ((totalPageViews - prevPageViews) / prevPageViews * 100) : 0;

  const chartData = sortedByDate.map(a => ({
    date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visitors: a.visitors,
    pageViews: a.pageViews,
    bounceRate: parseFloat(a.bounceRate || "0"),
    avgSession: a.avgSessionDuration || 0,
    project: projectMap.get(a.projectId)?.name || "Unknown",
  }));

  const projectBreakdown = projectsList?.map(p => {
    const projectData = filtered.filter(a => a.projectId === p.id);
    const client = clientMap.get(p.clientId);
    return {
      id: p.id,
      name: p.name,
      client: client?.fullName || "Unknown",
      domain: p.domain,
      visitors: projectData.reduce((sum, a) => sum + a.visitors, 0),
      pageViews: projectData.reduce((sum, a) => sum + a.pageViews, 0),
      avgBounce: projectData.length > 0
        ? (projectData.reduce((sum, a) => sum + parseFloat(a.bounceRate || "0"), 0) / projectData.length).toFixed(1)
        : "0",
      snapshots: projectData.length,
    };
  }).filter(p => p.snapshots > 0).sort((a, b) => b.visitors - a.visitors) || [];

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Site Traffic
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time traffic overview across all projects</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 text-xs" data-testid="badge-live">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live — updated {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/analytics/all"] });
              setLastRefresh(new Date());
            }}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-project-filter">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectsList?.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="365d">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="stat-visitors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  {visitorChange !== 0 && (
                    <Badge variant="secondary" className={visitorChange > 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive"}>
                      {visitorChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(visitorChange).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold mt-3" data-testid="text-total-visitors">{totalVisitors.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Visitors</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-pageviews">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-chart-2" />
                  </div>
                  {pageViewChange !== 0 && (
                    <Badge variant="secondary" className={pageViewChange > 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive"}>
                      {pageViewChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(pageViewChange).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold mt-3" data-testid="text-total-pageviews">{totalPageViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Page Views</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-bounce">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-chart-4" />
                </div>
                <p className="text-2xl font-bold mt-3" data-testid="text-bounce-rate">{avgBounceRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg Bounce Rate</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-session">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-chart-5" />
                </div>
                <p className="text-2xl font-bold mt-3" data-testid="text-avg-session">{formatDuration(avgSessionDuration)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg Session Duration</p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Visitors Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64" data-testid="chart-visitors">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                          />
                          <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" fill="url(#visitorGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Page Views Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64" data-testid="chart-pageviews">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                          />
                          <Area type="monotone" dataKey="pageViews" stroke="hsl(var(--chart-2))" fill="url(#pvGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Bounce Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64" data-testid="chart-bounce">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" unit="%" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                            formatter={(value: number) => [`${value}%`, "Bounce Rate"]}
                          />
                          <Line type="monotone" dataKey="bounceRate" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Traffic by Project</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64" data-testid="chart-by-project">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectBreakdown.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                          />
                          <Legend />
                          <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Visitors" />
                          <Bar dataKey="pageViews" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Page Views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground" data-testid="text-no-data">No traffic data yet for the selected time range</p>
                <p className="text-xs text-muted-foreground mt-1">Add analytics snapshots from the project detail pages to see data here</p>
              </CardContent>
            </Card>
          )}

          {projectBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Project Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-project-breakdown">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Project</th>
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Client</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">Visitors</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">Page Views</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">Bounce Rate</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">Data Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectBreakdown.map((p) => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors" data-testid={`row-project-${p.id}`}>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div>
                                <p className="font-medium">{p.name}</p>
                                {p.domain && <p className="text-xs text-muted-foreground">{p.domain}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">{p.client}</td>
                          <td className="py-2.5 px-3 text-right font-medium">{p.visitors.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-medium">{p.pageViews.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right">{p.avgBounce}%</td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">{p.snapshots}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
