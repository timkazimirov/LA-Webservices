import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Receipt, Search, CreditCard, CheckCircle2, DollarSign, Clock, AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { StripePaymentDialog } from "@/components/stripe-payment";
import type { Invoice, Project, User } from "@shared/schema";

type SafeUser = Omit<User, "password">;

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  contractId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  status: z.string().default("pending"),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.string().optional(),
});

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20", icon: Clock },
  paid: { color: "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20", icon: CheckCircle2 },
  overdue: { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  cancelled: { color: "bg-muted text-muted-foreground", icon: Receipt },
};

export default function InvoicesPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: invoicesList, isLoading } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"] });
  const { data: clients } = useQuery<SafeUser[]>({ queryKey: ["/api/clients"], enabled: isAdmin });
  const { data: projectsList } = useQuery<Project[]>({ queryKey: ["/api/projects"], enabled: isAdmin });

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { clientId: "", projectId: "", contractId: "", amount: "", status: "pending", dueDate: "", description: "", isRecurring: false, recurringInterval: "monthly" },
  });

  const isRecurring = form.watch("isRecurring");

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof invoiceSchema>) => {
      const payload: Record<string, any> = {
        ...data,
        projectId: data.projectId || null,
        contractId: data.contractId || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      if (!data.isRecurring) {
        payload.isRecurring = false;
        delete payload.recurringInterval;
      }
      const res = await apiRequest("POST", "/api/invoices", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setOpen(false);
      form.reset();
      toast({ title: "Invoice created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create invoice", description: err.message, variant: "destructive" });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await apiRequest("PATCH", `/api/invoices/${invoiceId}`, {
        status: "paid",
        paidAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice marked as paid" });
    },
  });

  const generateRecurringMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/invoices/generate-recurring");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: `Generated ${data.generated} recurring invoice(s)` });
    },
    onError: (err: any) => {
      toast({ title: "Failed to generate recurring invoices", description: err.message, variant: "destructive" });
    },
  });

  const filtered = invoicesList?.filter(inv => {
    const matchesSearch = (inv.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = invoicesList?.filter(i => i.status === "pending").reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0;
  const totalPaid = invoicesList?.filter(i => i.status === "paid").reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0;
  const recurringCount = invoicesList?.filter(i => i.isRecurring).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">{isAdmin ? "Manage invoices and payments" : "View and pay your invoices"}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => generateRecurringMutation.mutate()}
              disabled={generateRecurringMutation.isPending}
              data-testid="button-generate-recurring"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {generateRecurringMutation.isPending ? "Generating..." : "Generate Recurring"}
            </Button>
          )}
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-invoice"><Plus className="w-4 h-4 mr-2" />New Invoice</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pb-2">
                      <FormField control={form.control} name="clientId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger data-testid="select-invoice-client"><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
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
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="e.g. Monthly Website Maintenance" data-testid="input-invoice-description" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name="amount" render={({ field }) => (
                          <FormItem><FormLabel>Amount ($)</FormLabel><FormControl><Input {...field} type="number" step="0.01" data-testid="input-invoice-amount" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dueDate" render={({ field }) => (
                          <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input {...field} type="date" data-testid="input-invoice-date" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>

                      <div className="border rounded-lg p-4 space-y-3">
                        <FormField control={form.control} name="isRecurring" render={({ field }) => (
                          <FormItem className="flex items-center justify-between gap-2">
                            <div>
                              <FormLabel className="text-sm font-medium">Recurring Invoice</FormLabel>
                              <p className="text-xs text-muted-foreground">Automatically generate new invoices on schedule</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-recurring" />
                            </FormControl>
                          </FormItem>
                        )} />
                        {isRecurring && (
                          <FormField control={form.control} name="recurringInterval" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Interval</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "monthly"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-recurring-interval">
                                    <SelectValue placeholder="Select interval" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly (every 3 months)</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-invoice">
                        {createMutation.isPending ? "Creating..." : isRecurring ? "Create Recurring Invoice" : "Create Invoice"}
                      </Button>
                    </form>
                  </Form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
              <p className="text-lg font-bold" data-testid="text-total-invoices">{invoicesList?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold" data-testid="text-pending-amount">${totalPending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold" data-testid="text-paid-amount">${totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recurring</p>
              <p className="text-lg font-bold" data-testid="text-recurring-count">{recurringCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-invoices" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-invoice-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((invoice) => {
            const config = statusConfig[invoice.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={invoice.id} data-testid={`card-invoice-${invoice.id}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                        <StatusIcon className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{invoice.description || "Invoice"}</p>
                          {invoice.isRecurring && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0" data-testid={`badge-recurring-${invoice.id}`}>
                              <RefreshCw className="w-2.5 h-2.5 mr-1" />
                              {invoice.recurringInterval}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {invoice.dueDate && <span>Due {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                          {invoice.paidAt && <span>Paid {new Date(invoice.paidAt).toLocaleDateString()}</span>}
                          {invoice.isRecurring && invoice.nextBillingDate && (
                            <span>Next billing: {new Date(invoice.nextBillingDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold" data-testid={`text-amount-${invoice.id}`}>${parseFloat(invoice.amount).toLocaleString()}</span>
                      <Badge variant="secondary" className={config.color} data-testid={`badge-status-${invoice.id}`}>{invoice.status}</Badge>
                      {invoice.status === "pending" && !isAdmin && (
                        <Button
                          size="sm"
                          onClick={() => setPayingInvoice(invoice)}
                          data-testid={`button-pay-${invoice.id}`}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />Pay Now
                        </Button>
                      )}
                      {invoice.status === "pending" && isAdmin && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markPaidMutation.mutate(invoice.id)}
                          disabled={markPaidMutation.isPending}
                          data-testid={`button-mark-paid-${invoice.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered?.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No invoices found</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!payingInvoice} onOpenChange={(v) => !v && setPayingInvoice(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Pay Invoice</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {payingInvoice && (
              <StripePaymentDialog
                invoiceId={payingInvoice.id}
                amount={payingInvoice.amount}
                description={payingInvoice.description || "Invoice Payment"}
                onSuccess={() => setPayingInvoice(null)}
                onCancel={() => setPayingInvoice(null)}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
