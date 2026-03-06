import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import LandingPage from "@/pages/landing";
import CallPage from "@/pages/call";
import SiteTrafficPage from "@/pages/site-traffic";
import Dashboard from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import ProjectsPage from "@/pages/projects";
import ContractsPage from "@/pages/contracts";
import InvoicesPage from "@/pages/invoices";
import MessagesPage from "@/pages/messages";
import AnalyticsPage from "@/pages/analytics";
import ProjectRequestsPage from "@/pages/project-requests";

function AuthenticatedLayout() {
  const { isAdmin } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 p-2 border-b border-border h-14 shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/login">{() => <Redirect to="/dashboard" />}</Route>
              {isAdmin && <Route path="/clients" component={ClientsPage} />}
              {isAdmin && <Route path="/clients/:id" component={ClientsPage} />}
              {isAdmin && <Route path="/requests" component={ProjectRequestsPage} />}
              {isAdmin && <Route path="/traffic" component={SiteTrafficPage} />}
              <Route path="/projects" component={ProjectsPage} />
              <Route path="/contracts" component={ContractsPage} />
              <Route path="/invoices" component={InvoicesPage} />
              <Route path="/messages" component={MessagesPage} />
              {!isAdmin && <Route path="/analytics" component={AnalyticsPage} />}
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppRouter() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/home" component={LandingPage} />
        <Route path="/call" component={CallPage} />
        <Route path="/login" component={LoginPage} />
        <Route>{() => <Redirect to="/" />}</Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/home" component={LandingPage} />
      <Route path="/call" component={CallPage} />
      <Route><AuthenticatedLayout /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
