import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { Users, FolderKanban, FileText, DollarSign, TrendingUp, Receipt, CheckCircle2, Clock, Plus, MessageSquare, ExternalLink, Check } from "lucide-react";
import type { Project, Invoice, Contract, ProjectRequest } from "@shared/schema";

function StatCard({ title, value, icon: Icon, description, color }: {
  title: string; value: string | number; icon: any; description?: string; color?: string;
}) {
  return (
    <div className="glass-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${color || "bg-primary/10 text-primary"}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight" data-testid="text-page-title">Dashboard</h1>
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

const PRICING_PLANS = [
  { id: "starter", name: "Starter", price: "$1,000 one-time + $95/mo", description: "Custom website, mobile responsive, SEO, managed hosting" },
  { id: "monthly", name: "Monthly", price: "$0 upfront — $299/mo", description: "Everything included, bilingual, unlimited edits, priority support" },
  { id: "custom", name: "Custom", price: "Custom pricing", description: "Fully custom build, integrations, e-commerce, dedicated support" },
];

const ADD_ONS = [
  { id: "bilingual", name: "Bilingual Add-on", price: "+$300" },
  { id: "ecommerce", name: "E-commerce Integration", price: "+$500" },
  { id: "booking", name: "Custom Booking System", price: "+$400" },
  { id: "analytics", name: "Analytics Dashboard", price: "+$150" },
  { id: "widgets", name: "Custom Widgets", price: "From $200" },
  { id: "branding", name: "Logo & Brand Design", price: "+$350" },
];

function ProjectRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const mutation = useMutation({
    mutationFn: async (data: { title: string; description: string; budget: string; timeline: string }) => {
      await apiRequest("POST", "/api/project-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-requests"] });
      setTitle("");
      setDescription("");
      setSelectedPlan("");
      setSelectedAddOns([]);
      setTimeline("");
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedPlan) return;
    const plan = PRICING_PLANS.find(p => p.id === selectedPlan);
    const addOns = selectedAddOns.map(id => ADD_ONS.find(a => a.id === id)?.name).filter(Boolean);
    const budget = plan ? `${plan.name} (${plan.price})${addOns.length ? ` + ${addOns.join(", ")}` : ""}` : "";
    mutation.mutate({ title, description, budget, timeline });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="req-title">Project Title</Label>
            <Input
              id="req-title"
              data-testid="input-request-title"
              placeholder="e.g. My Business Website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-description">Description</Label>
            <Textarea
              id="req-description"
              data-testid="input-request-description"
              placeholder="Describe your project needs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Select a Plan</Label>
            <div className="grid gap-2">
              {PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`plan-${plan.id}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                    selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}>
                    {selectedPlan === plan.id && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{plan.name}</p>
                      <Badge variant="secondary" className="text-[10px] shrink-0 no-default-active-elevate">{plan.price}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Add-ons <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <div className="grid grid-cols-1 gap-1.5">
              {ADD_ONS.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                    selectedAddOns.includes(addon.id)
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 hover:border-border"
                  }`}
                  data-testid={`addon-${addon.id}`}
                >
                  <Checkbox
                    checked={selectedAddOns.includes(addon.id)}
                    onCheckedChange={() => toggleAddOn(addon.id)}
                    data-testid={`checkbox-addon-${addon.id}`}
                  />
                  <span className="text-sm flex-1">{addon.name}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 no-default-active-elevate">{addon.price}</Badge>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timeline</Label>
            <Select value={timeline} onValueChange={setTimeline}>
              <SelectTrigger data-testid="select-request-timeline">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASAP">ASAP</SelectItem>
                <SelectItem value="Within a week">Within a week</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending || !title.trim() || !description.trim() || !selectedPlan}
            data-testid="button-submit-request"
          >
            {mutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClientDashboard() {
  const { user } = useAuth();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: invoicesList } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"] });
  const { data: contractsList } = useQuery<Contract[]>({ queryKey: ["/api/contracts"] });
  const { data: projectRequests } = useQuery<ProjectRequest[]>({ queryKey: ["/api/project-requests"] });

  const totalPaid = invoicesList?.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount), 0) || 0;
  const totalPending = invoicesList?.filter(i => i.status === "pending").reduce((s, i) => s + parseFloat(i.amount), 0) || 0;
  const pendingInvoices = invoicesList?.filter(i => i.status === "pending") || [];

  if (projectsLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter(p => p.status === "in-progress" || p.status === "active") || [];

  const requestStatusColor: Record<string, string> = {
    pending: "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
    approved: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
    rejected: "bg-destructive/10 text-destructive",
  };

  const projectStatusColor: Record<string, string> = {
    "in-progress": "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
    active: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
    completed: "bg-primary/10 text-primary",
    paused: "bg-muted text-muted-foreground",
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <ProjectRequestDialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen} />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-page-title">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1" data-testid="text-page-subtitle">
            Here's what's happening with your projects
          </p>
        </div>
        <Button onClick={() => setRequestDialogOpen(true)} data-testid="button-request-project">
          <Plus className="w-4 h-4 mr-2" />
          Request a Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={activeProjects.length} icon={FolderKanban} description={`${projects?.length || 0} total`} color="bg-primary/10 text-primary" />
        <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} icon={CheckCircle2} color="bg-chart-2/10 text-chart-2 dark:bg-chart-2/20" />
        <StatCard title="Pending" value={`$${totalPending.toLocaleString()}`} icon={Clock} color="bg-chart-4/10 text-chart-4 dark:bg-chart-4/20" />
        <StatCard title="Contracts" value={contractsList?.length || 0} icon={FileText} color="bg-chart-3/10 text-chart-3 dark:bg-chart-3/20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5" onClick={() => setRequestDialogOpen(true)} data-testid="card-quick-request">
          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium tracking-tight">Request Project</p>
              <p className="text-xs text-muted-foreground">Start a new project</p>
            </div>
          </div>
        </div>
        <Link href="/messages" data-testid="link-quick-messages">
          <div className="glass-card rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5">
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium tracking-tight">Send Message</p>
                <p className="text-xs text-muted-foreground">Chat with your team</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/invoices" data-testid="link-quick-invoices">
          <div className="glass-card rounded-xl hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5">
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-chart-2/10 text-chart-2 dark:bg-chart-2/20 shadow-sm">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium tracking-tight">View Invoices</p>
                <p className="text-xs text-muted-foreground">Manage payments</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {projectRequests && projectRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Project Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-2 py-3 border-b border-border/50 last:border-0" data-testid={`card-request-${req.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" data-testid={`text-request-title-${req.id}`}>{req.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{req.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {req.budget && <span className="text-xs text-muted-foreground">{req.budget}</span>}
                    {req.timeline && <span className="text-xs text-muted-foreground">{req.timeline}</span>}
                  </div>
                </div>
                <Badge variant="secondary" className={requestStatusColor[req.status] || ""} data-testid={`badge-request-status-${req.id}`}>
                  {req.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects?.map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-2 py-3 border-b border-border/50 last:border-0" data-testid={`row-project-${project.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                  {project.domain && (
                    <a
                      href={project.domain.startsWith("http") ? project.domain : `https://${project.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary mt-1 inline-flex items-center gap-1 hover:underline"
                      data-testid={`link-project-domain-${project.id}`}
                    >
                      {project.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <Badge variant="secondary" className={projectStatusColor[project.status] || ""}>
                  {project.status}
                </Badge>
              </div>
            ))}
            {(!projects || projects.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No projects assigned yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-2 py-3 border-b border-border/50 last:border-0" data-testid={`row-invoice-${invoice.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{invoice.description || "Invoice"}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.dueDate ? `Due ${new Date(invoice.dueDate).toLocaleDateString()}` : "No due date"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" data-testid={`text-invoice-amount-${invoice.id}`}>
                    ${parseFloat(invoice.amount).toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 dark:bg-chart-4/20">
                    pending
                  </Badge>
                </div>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No pending invoices</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
}
