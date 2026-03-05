import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Search, Clock, CheckCircle2, XCircle, DollarSign, Calendar, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProjectRequest, User as UserType } from "@shared/schema";

type SafeUser = Omit<UserType, "password">;

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "bg-chart-4/10 text-chart-4", icon: Clock, label: "Pending Review" },
  approved: { color: "bg-chart-2/10 text-chart-2", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-destructive/10 text-destructive", icon: XCircle, label: "Rejected" },
};

export default function ProjectRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<(ProjectRequest & { clientName?: string }) | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<ProjectRequest[]>({ queryKey: ["/api/project-requests"] });
  const { data: clients } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"] });

  const clientMap = new Map(clients?.map(c => [c.id, c]) || []);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const body: Record<string, string> = { status };
      if (adminNotes) body.adminNotes = adminNotes;
      const res = await apiRequest("PATCH", `/api/project-requests/${id}`, body);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedRequest(null);
      setAdminNotes("");
      toast({ title: variables.status === "approved" ? "Request approved — project created" : "Request updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const filtered = requests?.filter(req => {
    const client = clientMap.get(req.clientId);
    const matchesSearch =
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.description.toLowerCase().includes(search.toLowerCase()) ||
      (client?.fullName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: requests?.length || 0,
    pending: requests?.filter(r => r.status === "pending").length || 0,
    approved: requests?.filter(r => r.status === "approved").length || 0,
    rejected: requests?.filter(r => r.status === "rejected").length || 0,
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-page-title">Project Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage incoming project requests from clients</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {(["all", "pending", "approved", "rejected"] as const).map(key => {
          const config = key === "all"
            ? { color: "bg-primary/10 text-primary", icon: ClipboardList, label: "All Requests" }
            : statusConfig[key];
          const Icon = config.icon;
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${statusFilter === key ? "ring-2 ring-primary" : ""}`}
              onClick={() => setStatusFilter(key)}
              data-testid={`filter-${key}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                  <p className="text-lg font-bold">{counts[key]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, description, or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-requests"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((req) => {
            const client = clientMap.get(req.clientId);
            const config = statusConfig[req.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card
                key={req.id}
                className="cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => {
                  setSelectedRequest({ ...req, clientName: client?.fullName });
                  setAdminNotes(req.adminNotes || "");
                }}
                data-testid={`card-request-${req.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{req.title}</h3>
                        <Badge variant="secondary" className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />{req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />{client?.fullName || "Unknown Client"}
                        </span>
                        {req.budget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />{req.budget}
                          </span>
                        )}
                        {req.timeline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{req.timeline}
                          </span>
                        )}
                        {req.createdAt && (
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMutation.mutate({ id: req.id, status: "approved" });
                          }}
                          disabled={updateMutation.isPending}
                          data-testid={`button-approve-${req.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMutation.mutate({ id: req.id, status: "rejected" });
                          }}
                          disabled={updateMutation.isPending}
                          data-testid={`button-reject-${req.id}`}
                        >
                          <XCircle className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered?.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No project requests found</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={(v) => !v && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                <Badge variant="secondary" className={(statusConfig[selectedRequest.status] || statusConfig.pending).color + " mt-1"}>
                  {selectedRequest.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedRequest.clientName || "Unknown"}</span>
                </div>
                {selectedRequest.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedRequest.budget}</span>
                  </div>
                )}
                {selectedRequest.timeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedRequest.timeline}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">{selectedRequest.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Admin Notes
                </p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                  rows={3}
                  data-testid="input-admin-notes"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                {selectedRequest.status === "pending" && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => updateMutation.mutate({ id: selectedRequest.id, status: "approved", adminNotes })}
                      disabled={updateMutation.isPending}
                      data-testid="button-detail-approve"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateMutation.mutate({ id: selectedRequest.id, status: "rejected", adminNotes })}
                      disabled={updateMutation.isPending}
                      data-testid="button-detail-reject"
                    >
                      <XCircle className="w-4 h-4 mr-2" />Reject
                    </Button>
                  </>
                )}
                {selectedRequest.status !== "pending" && adminNotes !== (selectedRequest.adminNotes || "") && (
                  <Button
                    onClick={() => updateMutation.mutate({ id: selectedRequest.id, status: selectedRequest.status, adminNotes })}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-notes"
                  >
                    Save Notes
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
