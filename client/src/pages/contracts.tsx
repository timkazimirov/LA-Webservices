import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FileText, Search, Upload, Download, CheckCircle2, Trash2, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Contract, Project, User } from "@shared/schema";

type SafeUser = Omit<User, "password">;

const contractSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  status: z.string().default("draft"),
});

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "signed", label: "Signed" },
  { value: "completed", label: "Completed" },
];

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
  signed: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
  completed: "bg-primary/10 text-primary",
};

export default function ContractsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingContractId, setUploadingContractId] = useState<string | null>(null);

  const { data: contractsList, isLoading } = useQuery<Contract[]>({ queryKey: ["/api/contracts"] });
  const { data: clients } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"], enabled: isAdmin });
  const { data: projectsList } = useQuery<Project[]>({ queryKey: ["/api/projects"], enabled: isAdmin });

  const form = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: { clientId: "", projectId: "", title: "", description: "", amount: "", status: "draft" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contractSchema>) => {
      const payload = { ...data, projectId: data.projectId || null };
      const res = await apiRequest("POST", "/api/contracts", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setOpen(false);
      form.reset();
      toast({ title: "Contract created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create contract", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const data: any = { status };
      if (status === "signed") data.signedAt = new Date().toISOString();
      const res = await apiRequest("PATCH", `/api/contracts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setDeleteTarget(null);
      toast({ title: "Contract deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete contract", description: err.message, variant: "destructive" });
    },
  });

  const uploadPdfMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch(`/api/contracts/${id}/upload-pdf`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setUploadingContractId(null);
      toast({ title: "PDF uploaded and contract sent to client" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to upload PDF", description: err.message, variant: "destructive" });
    },
  });

  const signMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/contracts/${id}/sign`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({ title: "Contract signed successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to sign contract", description: err.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingContractId) {
      uploadPdfMutation.mutate({ id: uploadingContractId, file });
    }
    e.target.value = "";
  };

  const filtered = contractsList?.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={handleFileChange} />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteTarget?.title}"? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} data-testid="button-confirm-delete-contract">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-page-title">Contracts</h1>
          <p className="text-muted-foreground text-sm mt-1">{isAdmin ? "Create and manage client contracts" : "View and sign your contracts"}</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-contract"><Plus className="w-4 h-4 mr-2" />New Contract</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                  <FormField control={form.control} name="clientId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger data-testid="select-contract-client"><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="projectId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Link to project" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {projectsList?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} data-testid="input-contract-title" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="resize-none" data-testid="input-contract-description" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input {...field} type="number" step="0.01" data-testid="input-contract-amount" /></FormControl><FormMessage /></FormItem>
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
                  <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-contract">
                    {createMutation.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-contracts" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((contract) => (
            <Card key={contract.id} data-testid={`card-contract-${contract.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{contract.title}</p>
                      {contract.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{contract.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="font-semibold text-foreground text-sm">${parseFloat(contract.amount).toLocaleString()}</span>
                        {contract.signedByClient && <span className="flex items-center gap-1 text-chart-2"><CheckCircle2 className="w-3 h-3" />Client signed</span>}
                        {contract.signedAt && <span>Signed {new Date(contract.signedAt).toLocaleDateString()}</span>}
                        <span>Created {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : "Recently"}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {contract.pdfUrl && (
                          <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" data-testid={`button-view-pdf-${contract.id}`}>
                              <Download className="w-3 h-3 mr-1.5" />View PDF
                            </Button>
                          </a>
                        )}
                        {isAdmin && !contract.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setUploadingContractId(contract.id); fileInputRef.current?.click(); }}
                            disabled={uploadPdfMutation.isPending}
                            data-testid={`button-upload-pdf-${contract.id}`}
                          >
                            <Upload className="w-3 h-3 mr-1.5" />{uploadPdfMutation.isPending && uploadingContractId === contract.id ? "Uploading..." : "Upload PDF"}
                          </Button>
                        )}
                        {isAdmin && contract.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setUploadingContractId(contract.id); fileInputRef.current?.click(); }}
                            disabled={uploadPdfMutation.isPending}
                            data-testid={`button-replace-pdf-${contract.id}`}
                          >
                            <Upload className="w-3 h-3 mr-1.5" />Replace PDF
                          </Button>
                        )}
                        {!isAdmin && contract.pdfUrl && !contract.signedByClient && (contract.status === "sent" || contract.status === "draft") && (
                          <Button
                            size="sm"
                            onClick={() => signMutation.mutate(contract.id)}
                            disabled={signMutation.isPending}
                            data-testid={`button-sign-contract-${contract.id}`}
                          >
                            <PenLine className="w-3 h-3 mr-1.5" />{signMutation.isPending ? "Signing..." : "Sign Contract"}
                          </Button>
                        )}
                        {!isAdmin && contract.signedByClient && (
                          <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />Signed
                          </Badge>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(contract)}
                            data-testid={`button-delete-contract-${contract.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin ? (
                    <Select value={contract.status} onValueChange={(v) => updateMutation.mutate({ id: contract.id, status: v })}>
                      <SelectTrigger className="w-auto h-auto p-0 border-0 shadow-none">
                        <Badge variant="secondary" className={statusColor[contract.status] || ""}>{contract.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary" className={statusColor[contract.status] || ""}>{contract.status}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No contracts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
