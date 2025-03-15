import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Button, Alert, CircularProgress } from "@mui/material";
import { Check, Warning, TrendingUp, TrendingDown, Lightbulb, ArrowBack } from "@mui/icons-material";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { usePostHog } from "@/lib/posthog-provider";
import { AnalyticsEvents } from "@/lib/posthog-provider";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const gradeColors = {
  A: "#4CAF50",
  B: "#8BC34A",
  C: "#FFC107",
  D: "#FF9800",
  E: "#FF5722",
  F: "#F44336"
};

export default function CreditScoreResult() {
  const [location, setLocation] = useLocation();
  const { trackEvent } = usePostHog();
  const { toast } = useToast();
  
  const { data: creditScore, isLoading, error, isError } = useQuery({
    queryKey: ["/api/loans/latest-credit-score"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/loans/latest-credit-score");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Kunne ikke hente kredittscore");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching credit score:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    // Track page view
    trackEvent(AnalyticsEvents.PAGE_VIEW, {
      page: "credit-score-result"
    });
    
    // If we have credit score data, track the event with grade info
    if (creditScore) {
      trackEvent(AnalyticsEvents.LOAN_APPLICATION_COMPLETE, {
        creditGrade: creditScore.grade,
        hasRecommendations: creditScore.recommendations?.length > 0
      });
    }
  }, [creditScore, trackEvent]);

  const handleBackToDashboard = () => {
    trackEvent(AnalyticsEvents.BUTTON_CLICK, {
      button: "back_to_dashboard",
      from: "credit_score_result"
    });
    setLocation("/dashboard");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Henter din kredittvurdering...
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !creditScore) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          <Card sx={{ maxWidth: 800, margin: "0 auto" }}>
            <CardHeader 
              title="Kunne ikke hente kredittvurdering"
              subheader="Det oppsto en feil ved henting av din kredittvurdering"
            />
            <CardContent>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error instanceof Error ? error.message : "En ukjent feil oppsto. Vennligst prøv igjen senere."}
              </Alert>
              <Button 
                variant="contained" 
                startIcon={<ArrowBack />}
                onClick={handleBackToDashboard}
              >
                Tilbake til dashbord
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Card sx={{ maxWidth: 800, margin: "0 auto" }}>
          <CardHeader 
            title="Din Kredittvurdering"
            subheader="Basert på din lånesøknad og økonomiske situasjon"
          />
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Typography variant="h1" sx={{ 
                fontSize: "4rem",
                fontWeight: "bold",
                color: gradeColors[creditScore.grade as keyof typeof gradeColors]
              }}>
                {creditScore.grade}
              </Typography>
              <Box sx={{ ml: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {creditScore.explanation}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Dine styrker</Typography>
              <List>
                {creditScore.strengths?.map((strength: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Check color="success" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Områder for forbedring</Typography>
              <List>
                {creditScore.weaknesses?.map((weakness: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={weakness} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Anbefalinger</Typography>
              <List>
                {creditScore.recommendations?.map((recommendation: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="info" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                startIcon={<ArrowBack />}
                onClick={handleBackToDashboard}
              >
                Tilbake til dashbord
              </Button>
            </Box>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
