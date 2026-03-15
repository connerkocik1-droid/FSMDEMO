import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MockAuthProvider, MockSignedIn, MockSignedOut, RoleTierSwitcher } from "@/lib/mock-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEO } from "@/components/SEO";

import Landing from "@/pages/landing";
import LoginPage from "@/pages/login";
import Demo from "@/pages/demo";
import DemoAccess from "@/pages/demo-access";
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
import CompanySettings from "@/pages/settings/company";
import UsersDirectory from "@/pages/settings/users-directory";
import UserProfile from "@/pages/settings/profile";
import BillingPage from "@/pages/settings/billing";
import AuditLogPage from "@/pages/settings/audit";
import PublicReview from "@/pages/public-review";
import NotFound from "@/pages/not-found";

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
      
      <Route path="/login">
        <MockSignedOut>
          <LoginPage />
        </MockSignedOut>
        <MockSignedIn>
          <Redirect to="/dashboard" />
        </MockSignedIn>
      </Route>

      <Route path="/demo" component={Demo} />
      <Route path="/demo-access/:token" component={DemoAccess} />
      <Route path="/review/:token" component={PublicReview} />
      
      <Route path="/:rest*">
        <MockSignedIn>
          <SEO noIndex={true} />
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
                <ProtectedRoute requiredFeature="gps_tracking" minRole="admin">
                  <GPS />
                </ProtectedRoute>
              </Route>

              <Route path="/reviews">
                <ProtectedRoute requiredFeature="referral_network" minRole="admin">
                  <Reviews />
                </ProtectedRoute>
              </Route>

              <Route path="/referrals">
                <ProtectedRoute requiredFeature="referral_network" minRole="admin">
                  <Referrals />
                </ProtectedRoute>
              </Route>

              <Route path="/analytics">
                <ProtectedRoute requiredFeature="full_analytics" minRole="admin">
                  <Analytics />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/profile">
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/company">
                <ProtectedRoute minRole="admin">
                  <CompanySettings />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/users">
                <ProtectedRoute minRole="admin">
                  <UsersDirectory />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/billing">
                <ProtectedRoute minRole="owner">
                  <BillingPage />
                </ProtectedRoute>
              </Route>

              <Route path="/settings/audit">
                <ProtectedRoute minRole="admin">
                  <AuditLogPage />
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
                <NotFound />
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
        </MockAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
