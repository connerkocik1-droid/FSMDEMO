import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MockAuthProvider, MockSignedIn, MockSignedOut } from "@/lib/mock-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Jobs from "@/pages/jobs";
import DispatchBoard from "@/pages/dispatch";
import SMSHub from "@/pages/sms";
import Financials from "@/pages/financials";

const queryClient = new QueryClient();

// Fallbacks for empty pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-secondary rounded-2xl mb-4 flex items-center justify-center text-2xl">🚧</div>
    <h2 className="text-2xl font-bold font-display text-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">This module is under construction.</p>
  </div>
);

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <MockSignedOut>
          <Landing />
        </MockSignedOut>
        <MockSignedIn>
          <Redirect to="/dashboard" />
        </MockSignedIn>
      </Route>
      
      <Route path="/demo" component={Demo} />
      
      <Route path="/:rest*">
        <MockSignedIn>
          <DashboardLayout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/leads" component={Leads} />
              <Route path="/jobs" component={Jobs} />
              <Route path="/dispatch" component={DispatchBoard} />
              <Route path="/sms" component={SMSHub} />
              <Route path="/financials" component={Financials} />
              
              <Route path="/customers" component={() => <PlaceholderPage title="Customers" />} />
              <Route path="/gps" component={() => <PlaceholderPage title="Live GPS" />} />
              <Route path="/reviews" component={() => <PlaceholderPage title="Reviews" />} />
              <Route path="/referrals" component={() => <PlaceholderPage title="Referrals" />} />
              <Route path="/analytics" component={() => <PlaceholderPage title="Analytics" />} />
              <Route path="/settings" component={() => <PlaceholderPage title="Settings" />} />
              
              <Route>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                </div>
              </Route>
            </Switch>
          </DashboardLayout>
        </MockSignedIn>
        <MockSignedOut>
          <Redirect to="/" />
        </MockSignedOut>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
      </MockAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
