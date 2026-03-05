import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Search, Mail, Phone, Building2, Users, ArrowLeft,
  Globe, Calendar, Send, FileText, FolderOpen, MessageSquare,
  ExternalLink, Save, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User, Project, Invoice, Contract, ProjectRequest, Message, AnalyticsSnapshot } from "@shared/schema";

type SafeUser = Omit<User, "password">;

type ClientProfile = SafeUser & {
  projects: Project[];
  invoices: Invoice[];
  contracts: Contract[];
  projectRequests: ProjectRequest[];
};

const STAGES = ["all", "potential", "negotiation", "active"] as const;
type Stage = "potential" | "negotiation" | "active";

function stageBadgeVariant(stage: string | null | undefined): "secondary" | "default" | "outline" {
  if (stage === "active") return "default";
  if (stage === "negotiation") return "outline";
  return "secondary";
}

function stageBadgeClass(stage: string | null | undefined): string {
  if (stage === "active") return "bg-green-600 text-white no-default-hover-elevate no-default-active-elevate";
  if (stage === "negotiation") return "bg-amber-500 text-white no-default-hover-elevate no-default-active-elevate";
  return "";
}

const newClientSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
  fullName: z.string().min(1),
  company: z.string().optional(),
  phone: z.string().optional(),
  clientStage: z.enum(["potential", "negotiation", "active"]).default("potential"),
});

const newProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  domain: z.string().optional(),
  status: z.string().default("in-progress"),
});

const newInvoiceSchema = z.object({
  amount: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

const newAnalyticsSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  visitors: z.string().min(1),
  pageViews: z.string().min(1),
  bounceRate: z.string().optional(),
  avgSessionDuration: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

function ListView() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"] });

  const form = useForm<z.infer<typeof newClientSchema>>({
    resolver: zodResolver(newClientSchema),
    defaultValues: { username: "", password: "", email: "", fullName: "", company: "", phone: "", clientStage: "potential" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newClientSchema>) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setOpen(false);
      form.reset();
      toast({ title: "Client created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create client", description: err.message, variant: "destructive" });
    },
  });

  const filtered = clients?.filter(c => {
    const matchesSearch = !search ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company?.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === "all" || (c.clientStage || "potential") === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stageCounts = {
    all: clients?.length || 0,
    potential: clients?.filter(c => (c.clientStage || "potential") === "potential").length || 0,
    negotiation: clients?.filter(c => c.clientStage === "negotiation").length || 0,
    active: clients?.filter(c => c.clientStage === "active").length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your client accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-client"><Plus className="w-4 h-4 mr-2" />Add Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} data-testid="input-client-name" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} data-testid="input-client-username" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" data-testid="input-client-email" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Password</FormLabel><FormControl><Input {...field} type="password" data-testid="input-client-password" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} data-testid="input-client-company" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} data-testid="input-client-phone" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="clientStage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client-stage">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="potential">Potential</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-client">
                  {createMutation.isPending ? "Creating..." : "Create Client"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STAGES.map(stage => (
          <Button
            key={stage}
            variant={stageFilter === stage ? "default" : "outline"}
            onClick={() => setStageFilter(stage)}
            data-testid={`button-filter-${stage}`}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
            <Badge variant="secondary" className="ml-2">{stageCounts[stage]}</Badge>
          </Button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-clients" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover-elevate"
              onClick={() => navigate(`/clients/${client.id}`)}
              data-testid={`card-client-${client.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0" data-testid={`avatar-client-${client.id}`}>
                    {client.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate" data-testid={`text-client-name-${client.id}`}>{client.fullName}</p>
                      <Badge
                        variant={stageBadgeVariant(client.clientStage)}
                        className={stageBadgeClass(client.clientStage)}
                        data-testid={`badge-stage-${client.id}`}
                      >
                        {(client.clientStage || "potential").charAt(0).toUpperCase() + (client.clientStage || "potential").slice(1)}
                      </Badge>
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building2 className="w-3 h-3" /><span data-testid={`text-client-company-${client.id}`}>{client.company}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" /><span className="truncate" data-testid={`text-client-email-${client.id}`}>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /><span data-testid={`text-client-phone-${client.id}`}>{client.phone}</span>
                    </div>
                  )}
                  {client.websiteUrl && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <a
                        href={client.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate underline"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`link-client-website-${client.id}`}
                      >
                        {client.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground" data-testid={`text-client-joined-${client.id}`}>
                    Joined {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground" data-testid="text-no-clients">No clients found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileView({ clientId }: { clientId: string }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [editStage, setEditStage] = useState<string>("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedAnalyticsProject, setSelectedAnalyticsProject] = useState<string | null>(null);

  const { data: client, isLoading } = useQuery<ClientProfile>({
    queryKey: ["/api/clients", clientId],
  });

  useEffect(() => {
    if (client && !profileInitialized) {
      setEditStage(client.clientStage || "potential");
      setEditWebsite(client.websiteUrl || "");
      setEditNotes(client.notes || "");
      setProfileInitialized(true);
    }
  }, [client, profileInitialized]);

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", clientId],
    enabled: activeTab === "messages",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      await apiRequest("PATCH", `/api/clients/${clientId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Client updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update client", description: err.message, variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", { receiverId: clientId, content, projectId: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", clientId] });
      setMessageContent("");
      toast({ title: "Message sent" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to send message", description: err.message, variant: "destructive" });
    },
  });

  const projectForm = useForm<z.infer<typeof newProjectSchema>>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: { name: "", description: "", domain: "", status: "in-progress" },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newProjectSchema>) => {
      await apiRequest("POST", "/api/projects", { ...data, clientId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });
      setProjectDialogOpen(false);
      projectForm.reset();
      toast({ title: "Project created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create project", description: err.message, variant: "destructive" });
    },
  });

  const invoiceForm = useForm<z.infer<typeof newInvoiceSchema>>({
    resolver: zodResolver(newInvoiceSchema),
    defaultValues: { amount: "", description: "", dueDate: "" },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newInvoiceSchema>) => {
      await apiRequest("POST", "/api/invoices", {
        clientId,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });
      setInvoiceDialogOpen(false);
      invoiceForm.reset();
      toast({ title: "Invoice created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create invoice", description: err.message, variant: "destructive" });
    },
  });

  const { data: analyticsData } = useQuery<AnalyticsSnapshot[]>({
    queryKey: [`/api/analytics/${selectedAnalyticsProject}`],
    enabled: activeTab === "analytics" && !!selectedAnalyticsProject,
  });

  const analyticsForm = useForm<z.infer<typeof newAnalyticsSchema>>({
    resolver: zodResolver(newAnalyticsSchema),
    defaultValues: { projectId: "", visitors: "", pageViews: "", bounceRate: "", avgSessionDuration: "", date: "" },
  });

  const createAnalyticsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newAnalyticsSchema>) => {
      await apiRequest("POST", "/api/analytics", {
        projectId: data.projectId,
        visitors: parseInt(data.visitors),
        pageViews: parseInt(data.pageViews),
        bounceRate: data.bounceRate || null,
        avgSessionDuration: data.avgSessionDuration ? parseInt(data.avgSessionDuration) : null,
        date: data.date,
      });
    },
    onSuccess: (_data, variables) => {
      setSelectedAnalyticsProject(variables.projectId);
      queryClient.invalidateQueries({ queryKey: [`/api/analytics/${variables.projectId}`] });
      setAnalyticsDialogOpen(false);
      analyticsForm.reset();
      toast({ title: "Analytics snapshot added" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add analytics", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate("/clients")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <p className="text-muted-foreground mt-4" data-testid="text-client-not-found">Client not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/clients")} data-testid="button-back">
        <ArrowLeft className="w-4 h-4 mr-2" />Back to Clients
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0" data-testid="avatar-client-profile">
              {client.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold" data-testid="text-profile-name">{client.fullName}</h1>
                <Badge
                  variant={stageBadgeVariant(client.clientStage)}
                  className={stageBadgeClass(client.clientStage)}
                  data-testid="badge-profile-stage"
                >
                  {(client.clientStage || "potential").charAt(0).toUpperCase() + (client.clientStage || "potential").slice(1)}
                </Badge>
              </div>
              {client.company && <p className="text-sm text-muted-foreground mt-1" data-testid="text-profile-company">{client.company}</p>}
              <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-muted-foreground">
                <span className="flex items-center gap-1" data-testid="text-profile-email"><Mail className="w-4 h-4" />{client.email}</span>
                {client.phone && <span className="flex items-center gap-1" data-testid="text-profile-phone"><Phone className="w-4 h-4" />{client.phone}</span>}
                {client.websiteUrl && (
                  <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline" data-testid="link-profile-website">
                    <Globe className="w-4 h-4" />{client.websiteUrl}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={() => { setActiveTab("messages"); }} data-testid="button-send-message">
                <MessageSquare className="w-4 h-4 mr-2" />Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-profile">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">Projects</TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Client Stage</label>
                <Select value={editStage} onValueChange={setEditStage}>
                  <SelectTrigger data-testid="select-edit-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="potential">Potential</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Website URL</label>
                <Input value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://example.com" data-testid="input-edit-website" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add notes about this client..." data-testid="input-edit-notes" />
              </div>
              <Button
                onClick={() => updateMutation.mutate({ clientStage: editStage, websiteUrl: editWebsite || null, notes: editNotes || null })}
                disabled={updateMutation.isPending}
                data-testid="button-save-details"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {client.projectRequests && client.projectRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.projectRequests.map((req) => {
                    const statusColor = req.status === "approved" ? "bg-chart-2/10 text-chart-2" : req.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-chart-4/10 text-chart-4";
                    return (
                      <div key={req.id} className="p-3 rounded-md bg-muted/50" data-testid={`request-${req.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{req.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>
                            {req.budget && <p className="text-xs text-muted-foreground mt-1">Budget: {req.budget}</p>}
                            {req.timeline && <p className="text-xs text-muted-foreground">Timeline: {req.timeline}</p>}
                          </div>
                          <Badge variant="secondary" className={statusColor}>{req.status}</Badge>
                        </div>
                        {req.status === "pending" && (
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                apiRequest("PATCH", `/api/project-requests/${req.id}`, { status: "approved" }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });
                                  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
                                  queryClient.invalidateQueries({ queryKey: ["/api/project-requests"] });
                                  toast({ title: "Request approved — project created" });
                                });
                              }}
                              data-testid={`button-approve-${req.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                apiRequest("PATCH", `/api/project-requests/${req.id}`, { status: "rejected" }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ["/api/clients", clientId] });
                                  toast({ title: "Request rejected" });
                                });
                              }}
                              data-testid={`button-reject-${req.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Projects</CardTitle>
              <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-project"><Plus className="w-4 h-4 mr-2" />Add Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                  </DialogHeader>
                  <Form {...projectForm}>
                    <form onSubmit={projectForm.handleSubmit((d) => createProjectMutation.mutate(d))} className="space-y-4">
                      <FormField control={projectForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} data-testid="input-project-name" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={projectForm.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} data-testid="input-project-description" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={projectForm.control} name="domain" render={({ field }) => (
                        <FormItem><FormLabel>Domain</FormLabel><FormControl><Input {...field} placeholder="example.com" data-testid="input-project-domain" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={projectForm.control} name="status" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-project-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {client.projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-projects">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50" data-testid={`project-${project.id}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium" data-testid={`text-project-name-${project.id}`}>{project.name}</p>
                        {project.description && <p className="text-xs text-muted-foreground truncate">{project.description}</p>}
                        {project.domain && (
                          <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline flex items-center gap-1 mt-1" data-testid={`link-project-domain-${project.id}`}>
                            <ExternalLink className="w-3 h-3" />{project.domain}
                          </a>
                        )}
                      </div>
                      <Badge variant={project.status === "completed" ? "default" : "secondary"} data-testid={`badge-project-status-${project.id}`}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 mb-4">
                {!messages || messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground" data-testid="text-no-messages">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === clientId ? "justify-start" : "justify-end"}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-md text-sm ${msg.senderId === clientId ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                          <p data-testid={`text-message-content-${msg.id}`}>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${msg.senderId === clientId ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex items-center gap-2">
                <Input
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && messageContent.trim()) {
                      sendMessageMutation.mutate(messageContent.trim());
                    }
                  }}
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  onClick={() => { if (messageContent.trim()) sendMessageMutation.mutate(messageContent.trim()); }}
                  disabled={sendMessageMutation.isPending || !messageContent.trim()}
                  data-testid="button-send-message-submit"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Invoices</CardTitle>
              <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-invoice"><Plus className="w-4 h-4 mr-2" />Create Invoice</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                  </DialogHeader>
                  <Form {...invoiceForm}>
                    <form onSubmit={invoiceForm.handleSubmit((d) => createInvoiceMutation.mutate(d))} className="space-y-4">
                      <FormField control={invoiceForm.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>Amount</FormLabel><FormControl><Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-invoice-amount" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={invoiceForm.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} data-testid="input-invoice-description" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={invoiceForm.control} name="dueDate" render={({ field }) => (
                        <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input {...field} type="date" data-testid="input-invoice-due-date" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" className="w-full" disabled={createInvoiceMutation.isPending} data-testid="button-submit-invoice">
                        {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-invoices">No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50" data-testid={`invoice-${invoice.id}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium" data-testid={`text-invoice-amount-${invoice.id}`}>${Number(invoice.amount).toFixed(2)}</p>
                        {invoice.description && <p className="text-xs text-muted-foreground truncate">{invoice.description}</p>}
                        {invoice.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "secondary"}
                        className={invoice.status === "paid" ? "bg-green-600 text-white no-default-hover-elevate no-default-active-elevate" : ""}
                        data-testid={`badge-invoice-status-${invoice.id}`}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Analytics</CardTitle>
              <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-analytics" disabled={!client.projects.length}>
                    <Plus className="w-4 h-4 mr-2" />Add Snapshot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Analytics Snapshot</DialogTitle>
                  </DialogHeader>
                  <Form {...analyticsForm}>
                    <form onSubmit={analyticsForm.handleSubmit((d) => createAnalyticsMutation.mutate(d))} className="space-y-4">
                      <FormField control={analyticsForm.control} name="projectId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-analytics-project">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {client.projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={analyticsForm.control} name="date" render={({ field }) => (
                        <FormItem><FormLabel>Date</FormLabel><FormControl><Input {...field} type="date" data-testid="input-analytics-date" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={analyticsForm.control} name="visitors" render={({ field }) => (
                          <FormItem><FormLabel>Visitors</FormLabel><FormControl><Input {...field} type="number" data-testid="input-analytics-visitors" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={analyticsForm.control} name="pageViews" render={({ field }) => (
                          <FormItem><FormLabel>Page Views</FormLabel><FormControl><Input {...field} type="number" data-testid="input-analytics-pageviews" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={analyticsForm.control} name="bounceRate" render={({ field }) => (
                          <FormItem><FormLabel>Bounce Rate (%)</FormLabel><FormControl><Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-analytics-bounce" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={analyticsForm.control} name="avgSessionDuration" render={({ field }) => (
                          <FormItem><FormLabel>Avg Session (s)</FormLabel><FormControl><Input {...field} type="number" placeholder="0" data-testid="input-analytics-duration" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <Button type="submit" className="w-full" disabled={createAnalyticsMutation.isPending} data-testid="button-submit-analytics">
                        {createAnalyticsMutation.isPending ? "Adding..." : "Add Snapshot"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {client.projects.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-analytics">Add projects first to track analytics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {client.projects.map(p => (
                      <Button
                        key={p.id}
                        variant={selectedAnalyticsProject === p.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedAnalyticsProject(p.id)}
                        data-testid={`button-analytics-project-${p.id}`}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                  {selectedAnalyticsProject ? (
                    analyticsData && analyticsData.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 rounded-md bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">Total Visitors</p>
                            <p className="text-lg font-bold mt-1" data-testid="text-total-visitors">
                              {analyticsData.reduce((s, a) => s + a.visitors, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 rounded-md bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">Total Page Views</p>
                            <p className="text-lg font-bold mt-1" data-testid="text-total-pageviews">
                              {analyticsData.reduce((s, a) => s + a.pageViews, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 rounded-md bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">Avg Bounce Rate</p>
                            <p className="text-lg font-bold mt-1" data-testid="text-avg-bounce">
                              {(analyticsData.filter(a => a.bounceRate).reduce((s, a) => s + parseFloat(a.bounceRate || "0"), 0) / (analyticsData.filter(a => a.bounceRate).length || 1)).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-3 rounded-md bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">Avg Session</p>
                            <p className="text-lg font-bold mt-1" data-testid="text-avg-session">
                              {Math.round(analyticsData.filter(a => a.avgSessionDuration).reduce((s, a) => s + (a.avgSessionDuration || 0), 0) / (analyticsData.filter(a => a.avgSessionDuration).length || 1))}s
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {analyticsData.map((snap) => (
                            <div key={snap.id} className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50" data-testid={`analytics-${snap.id}`}>
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
                        <p className="text-sm text-muted-foreground" data-testid="text-no-snapshots">No analytics data yet. Add a snapshot to get started.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground" data-testid="text-select-project">Select a project above to view analytics</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ClientsPage() {
  const [match, params] = useRoute("/clients/:id");

  if (match && params?.id) {
    return <ProfileView clientId={params.id} />;
  }

  return <ListView />;
}
