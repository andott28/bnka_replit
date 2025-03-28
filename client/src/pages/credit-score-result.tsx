import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Button, Alert, CircularProgress, FormGroup, FormControlLabel, Checkbox, Tabs, Tab } from "@mui/material";
import { Check, Warning, TrendingUp, TrendingDown, Lightbulb, ArrowBack } from "@mui/icons-material";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { usePostHog } from "@/lib/posthog-provider";
import { AnalyticsEvents } from "@/lib/posthog-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EnhancedCreditScoreResult } from "@/components/enhanced-credit-score-result";

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
  
  const [activeTab, setActiveTab] = useState(0);
  
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    trackEvent(AnalyticsEvents.TOGGLE_PREFERENCE, {
      action: "change_credit_score_view",
      tab: newValue === 0 ? "standard" : "enhanced"
    });
  };
  
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
      <div className="min-h-screen bg-background dark:bg-gray-900">
        <NavHeader />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center" style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ 
              mt: 2,
              color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : undefined
            }}>
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
      <div className="min-h-screen bg-background dark:bg-gray-900">
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          <Card sx={{ 
            maxWidth: 800, 
            margin: "0 auto",
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : undefined,
            borderColor: theme => theme.palette.mode === 'dark' ? '#333333' : undefined
          }}>
            <CardHeader 
              title="Kunne ikke hente kredittvurdering"
              titleTypographyProps={{ 
                sx: { color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : undefined }
              }}
              subheader="Det oppsto en feil ved henting av din kredittvurdering"
              subheaderTypographyProps={{ 
                sx: { color: theme => theme.palette.mode === 'dark' ? '#AAAAAA' : undefined }
              }}
            />
            <CardContent>
              <Alert severity="error" sx={{ 
                mb: 3,
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.15)' : undefined,
                color: theme => theme.palette.mode === 'dark' ? '#f5f5f5' : undefined,
                '& .MuiAlert-icon': {
                  color: theme => theme.palette.mode === 'dark' ? '#f44336' : undefined
                }
              }}>
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

  // Transfrom creditScore data to enhanced format for new component
  const enhancedCreditData = {
    score: creditScore.grade || "C",
    numerisk_score: creditScore.grade === "A" ? 95 : 
                  creditScore.grade === "B" ? 85 :
                  creditScore.grade === "C" ? 75 :
                  creditScore.grade === "D" ? 65 :
                  creditScore.grade === "E" ? 55 : 45,
    forklaring: creditScore.explanation || "Din kredittvurdering er basert på en helhetlig analyse av din økonomiske situasjon.",
    styrker: creditScore.strengths || [],
    svakheter: creditScore.weaknesses || [],
    anbefalinger: creditScore.recommendations || [],
    faktorer: {
      inntektsstabilitet: 7,
      gjeldsbelastning: 6,
      betalingshistorikk: 8,
      tilpasningsevne: 7,
      utdanningsrelevans: 5,
      språkferdigheter: 6,
      nettverk: 7
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Box sx={{ maxWidth: 1000, margin: "0 auto", mb: 4 }}>
          <Card sx={{ 
            width: '100%',
            bgcolor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : undefined,
            borderColor: theme => theme.palette.mode === 'dark' ? '#333333' : undefined
          }}>
            <CardHeader 
              title="Din Kredittvurdering"
              titleTypographyProps={{ 
                sx: { color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : undefined }
              }}
              subheader="Basert på din lånesøknad og økonomiske situasjon"
              subheaderTypographyProps={{ 
                sx: { color: theme => theme.palette.mode === 'dark' ? '#AAAAAA' : undefined }
              }}
            />
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleChangeTab}
                variant="fullWidth" 
                aria-label="Kredittvurdering visningsalternativer"
              >
                <Tab label="Standard visning" />
                <Tab label="Forbedret for innvandrere" />
              </Tabs>
            </Box>
            
            <CardContent>
              {activeTab === 0 ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <Typography variant="h1" sx={{ 
                      fontSize: "4rem",
                      fontWeight: "bold",
                      color: gradeColors[creditScore.grade as keyof typeof gradeColors]
                    }}>
                      {creditScore.grade}
                    </Typography>
                    <Box sx={{ ml: 3 }}>
                      <Typography variant="body1" sx={{ 
                        mb: 1,
                        color: theme => theme.palette.mode === 'dark' ? '#E0E0E0' : undefined
                      }}>
                        {creditScore.explanation}
                      </Typography>
                      
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2,
                          color: theme => theme.palette.mode === 'dark' ? '#E0E0E0' : undefined
                        }}>
                          Økonomisk informasjon
                        </Typography>
                        
                        <FormGroup>
                          <FormControlLabel 
                            control={<Checkbox />}
                            label={
                              <Box>
                                <Typography>Studielån</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Jeg blir å betale ned på studielånet mitt i løpet av denne perioden
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={<Checkbox />}
                            label={
                              <Box>
                                <Typography>Sparepenger</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Sparepenger (NOK)
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <FormControlLabel
                            control={<Checkbox />}
                            label={
                              <Box>
                                <Typography>Eiendeler</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Verdifulle eiendeler som bil, bolig, etc.
                                </Typography>
                              </Box>
                            }
                          />
                        </FormGroup>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : undefined
                    }}>
                      Dine styrker
                    </Typography>
                    <List>
                      {creditScore.strengths?.map((strength: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Check color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={strength} 
                            primaryTypographyProps={{
                              sx: { color: theme => theme.palette.mode === 'dark' ? '#E0E0E0' : undefined }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : undefined
                    }}>
                      Områder for forbedring
                    </Typography>
                    <List>
                      {creditScore.weaknesses?.map((weakness: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Warning color="warning" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={weakness} 
                            primaryTypographyProps={{
                              sx: { color: theme => theme.palette.mode === 'dark' ? '#E0E0E0' : undefined }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2,
                      color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : undefined
                    }}>
                      Anbefalinger
                    </Typography>
                    <List>
                      {creditScore.recommendations?.map((recommendation: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Lightbulb color="info" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={recommendation} 
                            primaryTypographyProps={{
                              sx: { color: theme => theme.palette.mode === 'dark' ? '#E0E0E0' : undefined }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              ) : (
                <EnhancedCreditScoreResult 
                  creditScoreData={enhancedCreditData}
                  isLoading={false}
                  error={null}
                />
              )}
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
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
        </Box>
      </main>
    </div>
  );
}