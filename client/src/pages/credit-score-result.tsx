import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Button, Alert, CircularProgress, Container, Paper, Chip, Divider } from "@mui/material";
import { Check, Warning, TrendingUp, TrendingDown, Lightbulb, ArrowBack, School, AccountBalance, Language, People, AccessTime } from "@mui/icons-material";
import { useLocation } from "wouter";
import { NavHeader } from "@/components/nav-header";
import { usePostHog } from "@/lib/posthog-provider";
import { AnalyticsEvents } from "@/lib/posthog-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { LinearProgress, Grid, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Definere kredittscore-datatypen
interface CreditScoreData {
  score: string;
  numerisk_score: number;
  forklaring: string;
  styrker: string[];
  svakheter: string[];
  anbefalinger: string[];
  faktorer?: {
    inntektsstabilitet: number;
    gjeldsbelastning: number;
    betalingshistorikk: number;
    tilpasningsevne: number;
    utdanningsrelevans: number;
    språkferdigheter: number;
    nettverk: number;
  };
}

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
  const theme = useMuiTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [expandedSection, setExpandedSection] = useState<string | false>('styrker');
  
  const handleAccordionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };
  
  const { data: creditScore, isLoading, error, isError } = useQuery<CreditScoreData>({
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
        creditGrade: creditScore.score,
        hasRecommendations: creditScore.anbefalinger?.length > 0
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

  // Hjelpefunksjon for å vise faktorer med passende ikon
  const renderFaktor = (navn: string, verdi: number, ikon: JSX.Element) => {
    const faktorScore = Math.round(verdi * 10); // Konverterer 0-10 skala til prosent
    return (
      <Grid item xs={12} sm={6} md={4} key={navn}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            height: '100%',
            backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '50%', 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              mr: 1.5
            }}>
              {ikon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {navn}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={faktorScore * 10} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: faktorScore >= 7 ? '#4CAF50' : 
                                  faktorScore >= 5 ? '#FFC107' : '#F44336',
                  borderRadius: 4
                }
              }} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                0
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: faktorScore >= 7 ? '#4CAF50' : 
                        faktorScore >= 5 ? '#FFC107' : '#F44336'
                }}
              >
                {faktorScore}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                10
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className="min-h-screen bg-background" sx={{ bgcolor: isDarkMode ? '#121212' : '#f5f7fa' }}>
        <NavHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <Card sx={{ 
              p: 4, 
              textAlign: 'center',
              width: '100%',
              maxWidth: 600,
              bgcolor: isDarkMode ? '#1E1E1E' : undefined,
              boxShadow: 3
            }}>
              <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
                Henter din kredittvurdering...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Vennligst vent mens vi analyserer dine finansielle data
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>
    );
  }

  // Error state
  if (isError || !creditScore) {
    return (
      <Box className="min-h-screen" sx={{ bgcolor: isDarkMode ? '#121212' : '#f5f7fa' }}>
        <NavHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Card sx={{ 
            maxWidth: 800, 
            margin: "0 auto",
            bgcolor: isDarkMode ? '#1E1E1E' : undefined,
            borderColor: isDarkMode ? '#333333' : undefined,
            boxShadow: 3
          }}>
            <CardHeader 
              title="Kunne ikke hente kredittvurdering"
              titleTypographyProps={{ 
                sx: { 
                  color: isDarkMode ? '#FFFFFF' : undefined,
                  fontWeight: 600
                }
              }}
              subheader="Det oppsto en feil ved henting av din kredittvurdering"
              subheaderTypographyProps={{ 
                sx: { color: isDarkMode ? '#AAAAAA' : undefined }
              }}
            />
            <CardContent>
              <Alert severity="error" sx={{ 
                mb: 3,
                bgcolor: isDarkMode ? 'rgba(211, 47, 47, 0.15)' : undefined,
                color: isDarkMode ? '#f5f5f5' : undefined,
                '& .MuiAlert-icon': {
                  color: isDarkMode ? '#f44336' : undefined
                }
              }}>
                {error instanceof Error ? error.message : "En ukjent feil oppsto. Vennligst prøv igjen senere."}
              </Alert>
              <Button 
                variant="contained" 
                startIcon={<ArrowBack />}
                onClick={handleBackToDashboard}
                sx={{ 
                  mt: 2,
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                Tilbake til dashbord
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Generate mock data for factors if they don't exist
  const faktorer = {
    inntektsstabilitet: 7,
    gjeldsbelastning: creditScore.score === "F" ? 3 : 6,
    betalingshistorikk: 8,
    tilpasningsevne: 7,
    utdanningsrelevans: 5,
    språkferdigheter: 6,
    nettverk: 7
  };

  return (
    <Box className="min-h-screen" sx={{ bgcolor: isDarkMode ? '#121212' : '#f5f7fa' }}>
      <NavHeader />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ 
          mb: 4, 
          fontWeight: 600,
          color: isDarkMode ? '#FAFAFA' : '#333333',
          borderBottom: '4px solid',
          borderColor: theme.palette.primary.main,
          pb: 1,
          display: 'inline-block'
        }}>
          Din Kredittvurdering
        </Typography>
        
        <Card sx={{ 
          width: '100%',
          mb: 4,
          boxShadow: 3,
          borderRadius: '16px',
          overflow: 'hidden',
          bgcolor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        }}>
          <CardHeader 
            title="Kredittvurderingsrapport" 
            titleTypographyProps={{ 
              variant: 'h5',
              sx: { 
                fontWeight: 600,
                color: isDarkMode ? '#FFFFFF' : undefined 
              }
            }}
            subheader="Basert på din økonomiske situasjon og finansielle data"
            subheaderTypographyProps={{ 
              sx: { color: isDarkMode ? '#AAAAAA' : undefined }
            }}
            sx={{
              bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
              borderBottom: '1px solid',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
          />
          
          <CardContent sx={{ p: 0 }}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={4} sx={{ 
                p: 3, 
                borderRight: {md: '1px solid'},
                borderBottom: {xs: '1px solid', md: 'none'},
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <Typography variant="overline" color="text.secondary" sx={{ mb: 1, letterSpacing: 1.5 }}>
                    KREDITTSCORE
                  </Typography>
                  
                  <Box sx={{ 
                    position: 'relative', 
                    width: 160, 
                    height: 160, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${gradeColors[creditScore.score as keyof typeof gradeColors]}15`,
                    borderRadius: '50%',
                    border: `6px solid ${gradeColors[creditScore.score as keyof typeof gradeColors]}`
                  }}>
                    <Typography variant="h1" sx={{ 
                      fontSize: "4.5rem",
                      fontWeight: "bold",
                      color: gradeColors[creditScore.score as keyof typeof gradeColors]
                    }}>
                      {creditScore.score}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" textAlign="center" gutterBottom fontWeight="500">
                    {creditScore.numerisk_score}/100 poeng
                  </Typography>
                  
                  <Chip
                    label={
                      creditScore.score === 'A' ? 'Utmerket kredittverdighet' : 
                      creditScore.score === 'B' ? 'Veldig god kredittverdighet' : 
                      creditScore.score === 'C' ? 'God kredittverdighet' : 
                      creditScore.score === 'D' ? 'Middels kredittverdighet' : 
                      creditScore.score === 'E' ? 'Svak kredittverdighet' : 
                      'Lav kredittverdighet'
                    }
                    color={
                      creditScore.score === 'A' || creditScore.score === 'B' 
                        ? 'success' 
                        : creditScore.score === 'C' 
                          ? 'info' 
                          : creditScore.score === 'D' 
                            ? 'warning' 
                            : 'error'
                    }
                    sx={{ 
                      mt: 2,
                      fontWeight: 500,
                      py: 1,
                      px: 2,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 600,
                  borderBottom: '2px solid',
                  borderColor: theme.palette.primary.main,
                  pb: 1,
                  display: 'inline-block'
                }}>
                  Kredittanalyse
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ 
                  mt: 2,
                  lineHeight: 1.7,
                  color: isDarkMode ? '#E0E0E0' : '#333333'
                }}>
                  {creditScore.forklaring}
                </Typography>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Nøkkelfaktorer
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {renderFaktor("Inntektsstabilitet", faktorer.inntektsstabilitet, 
                      <AccountBalance fontSize="small" color="primary" />)}
                    {renderFaktor("Gjeldsbelastning", faktorer.gjeldsbelastning, 
                      <TrendingDown fontSize="small" color={faktorer.gjeldsbelastning >= 5 ? "primary" : "error"} />)}
                    {renderFaktor("Betalingshistorikk", faktorer.betalingshistorikk, 
                      <AccessTime fontSize="small" color="primary" />)}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
            
            <Divider />
            
            <Box sx={{ p: 3 }}>
              <Accordion 
                expanded={expandedSection === 'styrker'} 
                onChange={handleAccordionChange('styrker')}
                sx={{ 
                  mb: 2,
                  backgroundColor: isDarkMode ? '#1E1E1E' : '#ffffff',
                  boxShadow: 1,
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                    borderLeft: '4px solid #4CAF50'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Check sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>Dine styrker</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {creditScore.styrker.map((styrke: string, index: number) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Check sx={{ color: '#4CAF50' }} />
                        </ListItemIcon>
                        <ListItemText primary={styrke} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion 
                expanded={expandedSection === 'svakheter'} 
                onChange={handleAccordionChange('svakheter')}
                sx={{ 
                  mb: 2,
                  backgroundColor: isDarkMode ? '#1E1E1E' : '#ffffff',
                  boxShadow: 1,
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
                    borderLeft: '4px solid #FF9800'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ color: '#FF9800', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>Forbedringsområder</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {creditScore.svakheter.map((svakhet: string, index: number) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Warning sx={{ color: '#FF9800' }} />
                        </ListItemIcon>
                        <ListItemText primary={svakhet} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion 
                expanded={expandedSection === 'anbefalinger'} 
                onChange={handleAccordionChange('anbefalinger')}
                sx={{ 
                  backgroundColor: isDarkMode ? '#1E1E1E' : '#ffffff',
                  boxShadow: 1,
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
                    borderLeft: '4px solid #2196F3'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ color: '#2196F3', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>Personlige anbefalinger</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {creditScore.anbefalinger.map((anbefaling: string, index: number) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Lightbulb sx={{ color: '#2196F3' }} />
                        </ListItemIcon>
                        <ListItemText primary={anbefaling} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
            
            <Box sx={{ p: 3, textAlign: 'center', borderTop: '1px solid', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<ArrowBack />}
                onClick={handleBackToDashboard}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Tilbake til dashbord
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}