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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Globe, ExternalLink, FolderKanban, ClipboardList, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Project, ProjectRequest, User } from "@shared/schema";

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

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const requestCards = (!isAdmin && projectRequests) ? projectRequests.map(r => ({
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
            {!isAdmin && <SelectItem value="approved">Approved</SelectItem>}
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
          {filtered?.map((project) => (
            <Card key={project.id} data-testid={`card-project-${project.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${project.isRequest ? "bg-chart-5/10 text-chart-5" : "bg-primary/10 text-primary"}`}>
                      {project.isRequest ? <ClipboardList className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{project.name}</p>
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
                  {isAdmin && !project.isRequest ? (
                    <Select value={project.status} onValueChange={(v) => updateStatusMutation.mutate({ id: project.id, status: v })}>
                      <SelectTrigger className="w-auto h-auto p-0 border-0 shadow-none">
                        <Badge variant="secondary" className={statusColor[project.status] || ""}>{project.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary" className={statusColor[project.status] || ""}>{project.status}</Badge>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{project.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  {project.isRequest ? "Requested" : "Created"} {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Recently"}
                </p>
              </CardContent>
            </Card>
          ))}
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
