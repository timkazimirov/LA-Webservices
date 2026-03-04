import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FolderKanban, FileText, DollarSign, TrendingUp, Receipt, CheckCircle2, Clock } from "lucide-react";
import type { Project, Invoice, Contract } from "@shared/schema";

function StatCard({ title, value, icon: Icon, description, color }: {
  title: string; value: string | number; icon: any; description?: string; color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${color || "bg-primary/10 text-primary"}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<{
    totalClients: number; totalProjects: number; activeProjects: number; totalContracts: number;
    signedContracts: number; totalRevenue: number; pendingRevenue: number; totalInvoices: number;
    paidInvoices: number; pendingInvoices: number;
  }>({ queryKey: ["/api/dashboard/stats"] });

  const { data: recentProjects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: recentInvoices } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"] });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    "in-progress": "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
    active: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
    completed: "bg-primary/10 text-primary",
    paused: "bg-muted text-muted-foreground",
  };

  const invoiceStatusColor: Record<string, string> = {
    paid: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
    pending: "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
    overdue: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your agency performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} description={`$${(stats?.pendingRevenue || 0).toLocaleString()} pending`} color="bg-chart-2/10 text-chart-2 dark:bg-chart-2/20" />
        <StatCard title="Active Projects" value={stats?.activeProjects || 0} icon={FolderKanban} description={`${stats?.totalProjects || 0} total`} color="bg-primary/10 text-primary" />
        <StatCard title="Clients" value={stats?.totalClients || 0} icon={Users} color="bg-chart-4/10 text-chart-4 dark:bg-chart-4/20" />
        <StatCard title="Invoices" value={`${stats?.paidInvoices || 0}/${stats?.totalInvoices || 0}`} icon={Receipt} description={`${stats?.pendingInvoices || 0} pending`} color="bg-chart-3/10 text-chart-3 dark:bg-chart-3/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects?.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0" data-testid={`row-project-${project.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.domain}</p>
                </div>
                <Badge variant="secondary" className={statusColor[project.status] || ""}>
                  {project.status}
                </Badge>
              </div>
            ))}
            {(!recentProjects || recentProjects.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInvoices?.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0" data-testid={`row-invoice-${invoice.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{invoice.description || "Invoice"}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.dueDate ? `Due ${new Date(invoice.dueDate).toLocaleDateString()}` : "No due date"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">${parseFloat(invoice.amount).toLocaleString()}</span>
                  <Badge variant="secondary" className={invoiceStatusColor[invoice.status] || ""}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
            {(!recentInvoices || recentInvoices.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClientDashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: invoicesList } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"] });
  const { data: contractsList } = useQuery<Contract[]>({ queryKey: ["/api/contracts"] });

  const totalPaid = invoicesList?.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount), 0) || 0;
  const totalPending = invoicesList?.filter(i => i.status === "pending").reduce((s, i) => s + parseFloat(i.amount), 0) || 0;

  if (projectsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter(p => p.status === "in-progress" || p.status === "active").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">My Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your project progress and account overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={activeProjects} icon={FolderKanban} description={`${projects?.length || 0} total`} color="bg-primary/10 text-primary" />
        <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} icon={CheckCircle2} color="bg-chart-2/10 text-chart-2 dark:bg-chart-2/20" />
        <StatCard title="Pending" value={`$${totalPending.toLocaleString()}`} icon={Clock} color="bg-chart-4/10 text-chart-4 dark:bg-chart-4/20" />
        <StatCard title="Contracts" value={contractsList?.length || 0} icon={FileText} color="bg-chart-3/10 text-chart-3 dark:bg-chart-3/20" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects?.map((project) => (
            <div key={project.id} className="flex items-center justify-between gap-2 py-3 border-b border-border/50 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                {project.domain && <p className="text-xs text-primary mt-1">{project.domain}</p>}
              </div>
              <Badge variant="secondary">{project.status}</Badge>
            </div>
          ))}
          {(!projects || projects.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No projects assigned yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
}
