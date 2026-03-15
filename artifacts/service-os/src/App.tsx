import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MockAuthProvider, MockSignedIn, MockSignedOut, RoleTierSwitcher } from "@/lib/mock-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Customers from "@/pages/customers";
import Jobs from "@/pages/jobs";
import DispatchBoard from "@/pages/dispatch";
import SMSHub from "@/pages/sms";
import Financials from "@/pages/financials";
import Reviews from "@/pages/reviews";
import Referrals from "@/pages/referrals";
import Analytics from "@/pages/analytics";
import GPS from "@/pages/gps";
import DemoScheduler from "@/pages/settings/demo-scheduler";
import LandingPages from "@/pages/settings/landing-pages";
import Locations from "@/pages/settings/locations";
import ApiKeys from "@/pages/settings/api-keys";
import PublicReview from "@/pages/public-review";

const queryClient = new QueryClient();

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
      <Route path="/review/:token" component={PublicReview} />
      
      <Route path="/:rest*">
        <MockSignedIn>
          <DashboardLayout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />

              <Route path="/leads">
                <ProtectedRoute minRole="admin">
                  <Leads />
                </ProtectedRoute>
              </Route>

              <Route path="/customers">
                <ProtectedRoute minRole="admin">
                  <Customers />
                </ProtectedRoute>
              </Route>

              <Route path="/jobs" component={Jobs} />

              <Route path="/dispatch">
                <ProtectedRoute minRole="admin">
                  <DispatchBoard />
                </ProtectedRoute>
              </Route>

              <Route path="/sms">
                <ProtectedRoute requiredFeature="manual_sms">
                  <SMSHub />
                </ProtectedRoute>
              </Route>

              <Route path="/financials">
                <ProtectedRoute requiredFeature="basic_financials">
                  <Financials />
                </ProtectedRoute>
              </Route>

              <Route path="/gps">
                <ProtectedRoute requiredFeature="gps_tracking">
                  <GPS />
                </ProtectedRoute>
              </Route>

              <Route path="/reviews">
                <ProtectedRoute requiredFeature="referral_network">
                  <Reviews />
                </ProtectedRoute>
              </Route>

              <Route path="/referrals">
                <ProtectedRoute requiredFeature="referral_network">
                  <Referrals />
                </ProtectedRoute>
              </Route>

              <Route path="/analytics">
                <ProtectedRoute requiredFeature="full_analytics">
                  <Analytics />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/demo-scheduler">
                <ProtectedRoute minRole="owner">
                  <DemoScheduler />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/landing-pages">
                <ProtectedRoute requiredFeature="landing_pages" minRole="owner">
                  <LandingPages />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/locations">
                <ProtectedRoute requiredFeature="multi_location" minRole="owner">
                  <Locations />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/api-keys">
                <ProtectedRoute requiredFeature="custom_api_access" minRole="owner">
                  <ApiKeys />
                </ProtectedRoute>
              </Route>

              <Route path="/settings">
                <PlaceholderPage title="Settings" />
              </Route>

              <Route>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                </div>
              </Route>
            </Switch>
          </DashboardLayout>
          <RoleTierSwitcher />
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
