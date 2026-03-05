import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Globe, ExternalLink, FolderKanban, ClipboardList, DollarSign, Calendar, Save, BarChart3, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Project, ProjectRequest, User, AnalyticsSnapshot } from "@shared/schema";

type SafeUser = Omit<User, "password">;

const projectSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional(),
  status: z.string().default("in-progress"),
  description: z.string().optional(),
});

const statusOptions = [
  { value: "in-progress", label: "In Progress" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

const statusColor: Record<string, string> = {
  "in-progress": "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
  active: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
  completed: "bg-primary/10 text-primary",
  paused: "bg-muted text-muted-foreground",
  requested: "bg-chart-5/10 text-chart-5 dark:bg-chart-5/20",
  approved: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
  pending: "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
  rejected: "bg-destructive/10 text-destructive",
};

const analyticsSchema = z.object({
  visitors: z.string().min(1),
  pageViews: z.string().min(1),
  bounceRate: z.string().optional(),
  avgSessionDuration: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

function ProjectDetailView({ project, onBack }: { project: Project; onBack: () => void }) {
  const { toast } = useToast();
  const [editDomain, setEditDomain] = useState(project.domain || "");
  const [editDescription, setEditDescription] = useState(project.description || "");
  const [editName, setEditName] = useState(project.name);
  const [editStatus, setEditStatus] = useState(project.status);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const { data: clients } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"] });
  const client = clients?.find(c => c.id === project.clientId);

  const { data: analyticsData, isLoading: analyticsLoading, isError: analyticsError } = useQuery<AnalyticsSnapshot[]>({
    queryKey: ["/api/analytics", project.id],
    enabled: activeTab === "analytics",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await apiRequest("PATCH", `/api/projects/${project.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project updated" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const analyticsForm = useForm<z.infer<typeof analyticsSchema>>({
    resolver: zodResolver(analyticsSchema),
    defaultValues: { visitors: "", pageViews: "", bounceRate: "", avgSessionDuration: "", date: "" },
  });

  const createAnalyticsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof analyticsSchema>) => {
      await apiRequest("POST", "/api/analytics", {
        projectId: project.id,
        visitors: parseInt(data.visitors),
        pageViews: parseInt(data.pageViews),
        bounceRate: data.bounceRate || null,
        avgSessionDuration: data.avgSessionDuration ? parseInt(data.avgSessionDuration) : null,
        date: data.date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics", project.id] });
      setAnalyticsDialogOpen(false);
      analyticsForm.reset();
      toast({ title: "Analytics snapshot added" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add analytics", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} data-testid="button-back-projects">
        <ArrowLeft className="w-4 h-4 mr-2" />Back to Projects
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold" data-testid="text-project-detail-name">{project.name}</h1>
              {client && (
                <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-project-client">
                  Client: {client.fullName} {client.company ? `(${client.company})` : ""}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant="secondary" className={statusColor[project.status] || ""} data-testid="badge-project-status">
                  {project.status}
                </Badge>
                {project.domain && (
                  <a
                    href={project.domain.startsWith("http") ? project.domain : `https://${project.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                    data-testid="link-project-domain"
                  >
                    <ExternalLink className="w-3 h-3" />{project.domain}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-project-detail">
          <TabsTrigger value="details" data-testid="tab-project-details">Details</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-project-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Project Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  data-testid="input-edit-project-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Domain URL</label>
                <Input
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  placeholder="example.com"
                  data-testid="input-edit-project-domain"
                />
                <p className="text-xs text-muted-foreground mt-1">The client will see this domain link on their projects page</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger data-testid="select-edit-project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add project notes, plan details, progress updates..."
                  rows={5}
                  data-testid="input-edit-project-notes"
                />
              </div>
              <Button
                onClick={() => updateMutation.mutate({
                  name: editName,
                  domain: editDomain || null,
                  status: editStatus,
                  description: editDescription || null,
                })}
                disabled={updateMutation.isPending}
                data-testid="button-save-project"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="font-medium text-sm">Analytics Snapshots</h3>
                <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-project-analytics">
                      <Plus className="w-4 h-4 mr-2" />Add Snapshot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Analytics Snapshot</DialogTitle>
                    </DialogHeader>
                    <Form {...analyticsForm}>
                      <form onSubmit={analyticsForm.handleSubmit((d) => createAnalyticsMutation.mutate(d))} className="space-y-4">
                        <FormField control={analyticsForm.control} name="date" render={({ field }) => (
                          <FormItem><FormLabel>Date</FormLabel><FormControl><Input {...field} type="date" data-testid="input-snap-date" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField control={analyticsForm.control} name="visitors" render={({ field }) => (
                            <FormItem><FormLabel>Visitors</FormLabel><FormControl><Input {...field} type="number" data-testid="input-snap-visitors" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={analyticsForm.control} name="pageViews" render={({ field }) => (
                            <FormItem><FormLabel>Page Views</FormLabel><FormControl><Input {...field} type="number" data-testid="input-snap-pageviews" /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField control={analyticsForm.control} name="bounceRate" render={({ field }) => (
                            <FormItem><FormLabel>Bounce Rate (%)</FormLabel><FormControl><Input {...field} type="number" step="0.01" data-testid="input-snap-bounce" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={analyticsForm.control} name="avgSessionDuration" render={({ field }) => (
                            <FormItem><FormLabel>Avg Session (s)</FormLabel><FormControl><Input {...field} type="number" data-testid="input-snap-duration" /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <Button type="submit" className="w-full" disabled={createAnalyticsMutation.isPending} data-testid="button-submit-snap">
                          {createAnalyticsMutation.isPending ? "Adding..." : "Add Snapshot"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {analyticsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 rounded-md" />
                  <Skeleton className="h-12 rounded-md" />
                </div>
              ) : analyticsError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive">Failed to load analytics data</p>
                </div>
              ) : analyticsData && analyticsData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-md bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Total Visitors</p>
                      <p className="text-lg font-bold mt-1" data-testid="text-proj-total-visitors">
                        {analyticsData.reduce((s, a) => s + a.visitors, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Total Page Views</p>
                      <p className="text-lg font-bold mt-1" data-testid="text-proj-total-pageviews">
                        {analyticsData.reduce((s, a) => s + a.pageViews, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Avg Bounce Rate</p>
                      <p className="text-lg font-bold mt-1">
                        {(analyticsData.filter(a => a.bounceRate).reduce((s, a) => s + parseFloat(a.bounceRate || "0"), 0) / (analyticsData.filter(a => a.bounceRate).length || 1)).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-md bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">Avg Session</p>
                      <p className="text-lg font-bold mt-1">
                        {Math.round(analyticsData.filter(a => a.avgSessionDuration).reduce((s, a) => s + (a.avgSessionDuration || 0), 0) / (analyticsData.filter(a => a.avgSessionDuration).length || 1))}s
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {analyticsData.map((snap) => (
                      <div key={snap.id} className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50" data-testid={`snap-${snap.id}`}>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{new Date(snap.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{snap.visitors} visitors</span>
                          <span>{snap.pageViews} views</span>
                          {snap.bounceRate && <span>{snap.bounceRate}% bounce</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-project-analytics">
                    No analytics data yet. Add a snapshot to start tracking.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: projectsList, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: clients } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"], enabled: isAdmin });
  const { data: projectRequests } = useQuery<ProjectRequest[]>({ queryKey: ["/api/project-requests"], enabled: !isAdmin });

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { clientId: "", name: "", domain: "", status: "in-progress", description: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setOpen(false);
      form.reset();
      toast({ title: "Project created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create project", description: err.message, variant: "destructive" });
    },
  });

  const selectedProject = projectsList?.find(p => p.id === selectedProjectId);

  if (isAdmin && selectedProject) {
    return <ProjectDetailView project={selectedProject} onBack={() => setSelectedProjectId(null)} />;
  }

  const requestCards = (!isAdmin && projectRequests) ? projectRequests
    .filter(r => r.status !== "approved")
    .map(r => ({
      id: `req-${r.id}`,
      name: r.title,
      domain: null,
      status: r.status === "pending" ? "requested" : r.status,
      description: r.description,
      createdAt: r.createdAt,
      clientId: r.clientId,
      isRequest: true,
      budget: r.budget,
      timeline: r.timeline,
    })) : [];

  const allItems = [...(projectsList || []).map(p => ({ ...p, isRequest: false, budget: null, timeline: null })), ...requestCards];

  const filtered = allItems.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.domain?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{isAdmin ? "Manage all client projects" : "Your website projects"}</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-project"><Plus className="w-4 h-4 mr-2" />New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                  <FormField control={form.control} name="clientId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger data-testid="select-project-client"><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.fullName} - {c.company || c.email}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} data-testid="input-project-name" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="domain" render={({ field }) => (
                    <FormItem><FormLabel>Domain</FormLabel><FormControl><Input {...field} placeholder="example.com" data-testid="input-project-domain" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="resize-none" data-testid="input-project-description" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-project">
                    {createMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-projects" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            {!isAdmin && <SelectItem value="requested">Requested</SelectItem>}
            {!isAdmin && <SelectItem value="rejected">Rejected</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered?.map((project) => {
            const clientName = isAdmin && clients ? clients.find(c => c.id === project.clientId)?.fullName : null;
            return (
              <Card
                key={project.id}
                className={isAdmin && !project.isRequest ? "cursor-pointer hover:bg-accent/30 transition-colors" : ""}
                onClick={isAdmin && !project.isRequest ? () => setSelectedProjectId(project.id) : undefined}
                data-testid={`card-project-${project.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${project.isRequest ? "bg-chart-5/10 text-chart-5" : "bg-primary/10 text-primary"}`}>
                        {project.isRequest ? <ClipboardList className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{project.name}</p>
                        {clientName && (
                          <p className="text-xs text-muted-foreground mt-0.5">{clientName}</p>
                        )}
                        {project.domain && (
                          <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />{project.domain}
                          </p>
                        )}
                        {project.isRequest && project.budget && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />{project.budget}
                          </p>
                        )}
                        {project.isRequest && project.timeline && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{project.timeline}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusColor[project.status] || ""}>{project.status}</Badge>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{project.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/50">
                    {project.isRequest ? "Requested" : "Created"} {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
          {filtered?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No projects found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
