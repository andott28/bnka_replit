import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "./hooks/use-theme";
import { PostHogProvider, usePostHog } from "./lib/posthog-provider";
import { ConsentDialog } from "@/components/consent-dialog";
import { useEffect } from "react";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LoanApplication from "@/pages/loan-application";
import AdminDashboard from "@/pages/admin-dashboard";
import HowItWorks from "@/pages/how-it-works";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import CreditScoreResult from "@/pages/credit-score-result";

// Komponent for å spore sidevisninger
function RouteTracker() {
  const [location] = useLocation();
  const { posthog, consentStatus } = usePostHog();
  
  useEffect(() => {
    // Spor sidevisninger kun hvis brukeren har samtykket
    if (consentStatus === 'accepted') {
      // Manuelt send en pageview-hendelse når ruten endres
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        path: location
      });
    }
  }, [location, posthog, consentStatus]);

  return null;
}

function Router() {
  return (
    <>
      <RouteTracker />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/tjenester" component={HowItWorks} />
        <Route path="/kontakt" component={Contact} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/apply" component={LoanApplication} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/credit-score-result" component={CreditScoreResult} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="bnka-theme">
        <PostHogProvider>
          <AuthProvider>
            <Router />
            <Toaster />
            <ConsentDialog />
          </AuthProvider>
        </PostHogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;