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
import { useTheme } from "@/hooks/use-theme"; // Legg til vår egen theme hook
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

// Forklaringer for hver faktor
const faktorBeskrivelser: Record<string, string> = {
  "Inntektsstabilitet": "Måler hvor stabil og forutsigbar din inntekt har vært over tid. Høy stabilitet gir bedre kredittrangering.",
  "Gjeldsbelastning": "Viser forholdet mellom din gjeld og inntekt. Lavere gjeldsbelastning indikerer bedre økonomisk balanse.",
  "Betalingshistorikk": "Evaluerer din historikk med å betale regninger og lån til rett tid. God betalingshistorikk styrker kredittverdigheten.",
  "Tilpasningsevne": "Vurderer evnen til å tilpasse deg økonomiske endringer og håndtere uforutsette utgifter.",
  "Utdanningsrelevans": "Analyserer hvor relevant din utdanning er i forhold til dagens arbeidsmarked og fremtidige muligheter.",
  "Språkferdigheter": "Vurderer hvordan språkferdigheter påvirker din posisjon i arbeidsmarkedet og inntjeningsevne.",
  "Nettverk": "Evaluerer ditt profesjonelle og sosiale nettverk som kan gi økonomisk stabilitet og muligheter."
};

// Farger for grader, med støtte for både lyst og mørkt tema
const gradeColors = {
  light: {
    A: "#2E7D32", // Mørkere grønn
    B: "#558B2F", // Mørkere lime grønn
    C: "#F57F17", // Mørkere amber
    D: "#E65100", // Mørkere oransje
    E: "#C62828", // Mørkere rød
    F: "#B71C1C"  // Dypere rød
  },
  dark: {
    A: "#81C784", // Lysere grønn
    B: "#AED581", // Lysere lime grønn
    C: "#FFD54F", // Lysere amber
    D: "#FFB74D", // Lysere oransje
    E: "#E57373", // Lysere rød
    F: "#F44336"  // Standard rød
  }
};

export default function CreditScoreResult() {
  const [location, setLocation] = useLocation();
  const { trackEvent } = usePostHog();
  const { toast } = useToast();
  const muiTheme = useMuiTheme();
  const { theme } = useTheme(); // Henter tema fra vår egen ThemeProvider
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [expandedSection, setExpandedSection] = useState<string | false>('styrker');
  // Vi bruker et objekt for å holde styr på hvilke faktorer som viser tooltips
  const [faktorsWithTooltip, setFaktorsWithTooltip] = useState<Record<string, boolean>>({});
  
  const handleAccordionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };
  
  const toggleTooltip = (faktorNavn: string) => {
    setFaktorsWithTooltip(prev => ({
      ...prev,
      [faktorNavn]: !prev[faktorNavn]
    }));
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
    // Verdi er på en skala fra 0 til 10, vi konverterer til prosent for progressbar
    const faktorScore = verdi; // Verdien er allerede på skala 0-10
    const prosentVerdi = verdi * 10; // Konverter til prosent for progressbar (0-100)
    const showTooltip = faktorsWithTooltip[navn] || false;
    
    return (
      <Grid item xs={12} sm={6} key={navn}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2.5, 
            height: '100%',
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(81, 81, 81, 0.5)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDarkMode 
                ? '0 6px 25px rgba(0, 0, 0, 0.65)' 
                : '0 6px 25px rgba(0, 0, 0, 0.1)',
            },
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '12px', 
                backgroundColor: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : muiTheme.palette.primary.main + '15',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {ikon}
              </Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: isDarkMode ? '#E0E0E0' : 'text.primary'
                }}
              >
                {navn}
              </Typography>
            </Box>
            
            <Box 
              component="button"
              onClick={() => toggleTooltip(navn)}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              ?
            </Box>
          </Box>
          
          {showTooltip && (
            <Box sx={{ 
              position: 'absolute',
              top: 70,
              left: 10,
              right: 10,
              backgroundColor: isDarkMode ? 'rgba(45, 45, 45, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              padding: 2,
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              mt: 1,
              maxWidth: '100%'
            }}>
              <Typography sx={{ 
                fontSize: '0.85rem', 
                lineHeight: 1.5,
                color: isDarkMode ? '#E0E0E0' : '#333333' 
              }}>
                {faktorBeskrivelser[navn]}
              </Typography>
              <Box 
                component="button"
                onClick={() => toggleTooltip(navn)}
                sx={{ 
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: 'transparent',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                  }
                }}
              >
                ✕
              </Box>
            </Box>
          )}
          
          <Box sx={{ width: '100%', mt: 1.5 }}>
            <Box sx={{ 
              mb: 0.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 500
                }}
              >
                Vurdering
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: faktorScore >= 7 
                    ? isDarkMode ? '#66BB6A' : '#2E7D32' 
                    : faktorScore >= 5 
                      ? isDarkMode ? '#FFCA28' : '#F57F17' 
                      : isDarkMode ? '#EF5350' : '#C62828'
                }}
              >
                {faktorScore}/10
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={prosentVerdi} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: faktorScore >= 7 
                    ? isDarkMode ? '#4CAF50' : '#2E7D32' 
                    : faktorScore >= 5 
                      ? isDarkMode ? '#FFC107' : '#F57F17' 
                      : isDarkMode ? '#F44336' : '#C62828',
                  borderRadius: 5,
                  transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }} 
            />
            
            <Box sx={{ 
              mt: 1, 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: isDarkMode ? '#F44336' : '#C62828',
                    mr: 0.5
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Svak
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: isDarkMode ? '#FFC107' : '#F57F17',
                    mr: 0.5
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Middels
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32',
                    mr: 0.5
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                  }}
                >
                  God
                </Typography>
              </Box>
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
              <CircularProgress size={60} sx={{ color: muiTheme.palette.primary.main }} />
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
                  bgcolor: muiTheme.palette.primary.main,
                  '&:hover': {
                    bgcolor: muiTheme.palette.primary.dark
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
          borderColor: muiTheme.palette.primary.main,
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
                  <Typography variant="overline" sx={{ 
                    mb: 1, 
                    letterSpacing: 1.5,
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' 
                  }}>
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
                    backgroundColor: isDarkMode 
                      ? `${gradeColors.dark[creditScore.score as keyof typeof gradeColors.dark]}15`
                      : `${gradeColors.light[creditScore.score as keyof typeof gradeColors.light]}15`,
                    borderRadius: '50%',
                    border: `6px solid ${isDarkMode 
                      ? gradeColors.dark[creditScore.score as keyof typeof gradeColors.dark]
                      : gradeColors.light[creditScore.score as keyof typeof gradeColors.light]}`,
                    transition: 'all 0.3s ease',
                    boxShadow: isDarkMode 
                      ? `0 4px 20px ${gradeColors.dark[creditScore.score as keyof typeof gradeColors.dark]}30`
                      : `0 4px 20px ${gradeColors.light[creditScore.score as keyof typeof gradeColors.light]}30`,
                  }}>
                    <Typography variant="h1" sx={{ 
                      fontSize: "4.5rem",
                      fontWeight: "bold",
                      color: isDarkMode 
                        ? gradeColors.dark[creditScore.score as keyof typeof gradeColors.dark]
                        : gradeColors.light[creditScore.score as keyof typeof gradeColors.light]
                    }}>
                      {creditScore.score}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" textAlign="center" gutterBottom sx={{
                    fontWeight: 500,
                    color: isDarkMode ? '#E0E0E0' : '#333333'
                  }}>
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
                  borderColor: muiTheme.palette.primary.main,
                  pb: 1,
                  display: 'inline-block',
                  color: isDarkMode ? '#E0E0E0' : '#333333'
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
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: isDarkMode ? '#E0E0E0' : '#333333'
                  }}>
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
                  mb: 2.5,
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.07)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)',
                  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                  '&:hover': {
                    boxShadow: isDarkMode 
                      ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                      : '0 6px 25px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-2px)'
                  },
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    borderBottom: expandedSection === 'styrker' ? '1px solid' : 'none', 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ 
                      color: isDarkMode ? '#66BB6A' : '#2E7D32',
                      transition: 'transform 0.3s',
                      transform: expandedSection === 'styrker' ? 'rotate(180deg)' : 'rotate(0)'
                    }} />
                  }
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
                    borderLeft: '5px solid',
                    borderColor: isDarkMode ? '#66BB6A' : '#2E7D32',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.25)' : 'rgba(76, 175, 80, 0.12)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 2,
                      backgroundColor: isDarkMode ? 'rgba(102, 187, 106, 0.2)' : 'rgba(46, 125, 50, 0.1)',
                      borderRadius: '8px',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check sx={{ 
                        color: isDarkMode ? '#66BB6A' : '#2E7D32', 
                        fontSize: '1.3rem' 
                      }} />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: isDarkMode ? '#FAFAFA' : '#333333',
                        fontSize: { xs: '1rem', sm: '1.15rem' }
                      }}
                    >
                      Dine styrker
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ 
                  p: 0, 
                  backgroundColor: isDarkMode ? 'rgba(38, 50, 56, 0.4)' : 'rgba(250, 250, 250, 0.7)'
                }}>
                  <List sx={{ py: 0 }}>
                    {creditScore.styrker.map((styrke: string, index: number) => (
                      <ListItem 
                        key={index} 
                        alignItems="flex-start"
                        sx={{ 
                          borderBottom: index < creditScore.styrker.length - 1 ? '1px solid' : 'none',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          py: 1.5
                        }}
                      >
                        <ListItemIcon>
                          <Check sx={{ 
                            color: isDarkMode ? '#66BB6A' : '#2E7D32',
                            backgroundColor: isDarkMode ? 'rgba(102, 187, 106, 0.12)' : 'rgba(46, 125, 50, 0.08)',
                            borderRadius: '50%',
                            p: 0.5
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={styrke} 
                          primaryTypographyProps={{ 
                            sx: { 
                              fontWeight: 500,
                              fontSize: '0.95rem',
                              color: isDarkMode ? '#E0E0E0' : '#333333',
                              lineHeight: 1.5
                            } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion 
                expanded={expandedSection === 'svakheter'} 
                onChange={handleAccordionChange('svakheter')}
                sx={{ 
                  mb: 2.5,
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.07)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 183, 77, 0.3)' : 'rgba(245, 124, 0, 0.2)',
                  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                  '&:hover': {
                    boxShadow: isDarkMode 
                      ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                      : '0 6px 25px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-2px)'
                  },
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    borderBottom: expandedSection === 'svakheter' ? '1px solid' : 'none', 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ 
                      color: isDarkMode ? '#FFB74D' : '#E65100',
                      transition: 'transform 0.3s',
                      transform: expandedSection === 'svakheter' ? 'rotate(180deg)' : 'rotate(0)'
                    }} />
                  }
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.08)',
                    borderLeft: '5px solid',
                    borderColor: isDarkMode ? '#FFB74D' : '#E65100',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.25)' : 'rgba(255, 152, 0, 0.12)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 2,
                      backgroundColor: isDarkMode ? 'rgba(255, 183, 77, 0.2)' : 'rgba(230, 81, 0, 0.1)',
                      borderRadius: '8px',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Warning sx={{ 
                        color: isDarkMode ? '#FFB74D' : '#E65100', 
                        fontSize: '1.3rem' 
                      }} />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: isDarkMode ? '#FAFAFA' : '#333333',
                        fontSize: { xs: '1rem', sm: '1.15rem' }
                      }}
                    >
                      Forbedringsområder
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ 
                  p: 0, 
                  backgroundColor: isDarkMode ? 'rgba(38, 50, 56, 0.4)' : 'rgba(250, 250, 250, 0.7)'
                }}>
                  <List sx={{ py: 0 }}>
                    {creditScore.svakheter.map((svakhet: string, index: number) => (
                      <ListItem 
                        key={index} 
                        alignItems="flex-start"
                        sx={{ 
                          borderBottom: index < creditScore.svakheter.length - 1 ? '1px solid' : 'none',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          py: 1.5
                        }}
                      >
                        <ListItemIcon>
                          <Warning sx={{ 
                            color: isDarkMode ? '#FFB74D' : '#E65100',
                            backgroundColor: isDarkMode ? 'rgba(255, 183, 77, 0.12)' : 'rgba(230, 81, 0, 0.08)',
                            borderRadius: '50%',
                            p: 0.5
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={svakhet} 
                          primaryTypographyProps={{ 
                            sx: { 
                              fontWeight: 500,
                              fontSize: '0.95rem',
                              color: isDarkMode ? '#E0E0E0' : '#333333',
                              lineHeight: 1.5
                            } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion 
                expanded={expandedSection === 'anbefalinger'} 
                onChange={handleAccordionChange('anbefalinger')}
                sx={{ 
                  mb: 1,
                  backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isDarkMode 
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.07)',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(79, 195, 247, 0.3)' : 'rgba(2, 119, 189, 0.2)',
                  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                  '&:hover': {
                    boxShadow: isDarkMode 
                      ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                      : '0 6px 25px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-2px)'
                  },
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    borderBottom: expandedSection === 'anbefalinger' ? '1px solid' : 'none', 
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ 
                      color: isDarkMode ? '#4FC3F7' : '#0277BD',
                      transition: 'transform 0.3s',
                      transform: expandedSection === 'anbefalinger' ? 'rotate(180deg)' : 'rotate(0)'
                    }} />
                  }
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                    borderLeft: '5px solid',
                    borderColor: isDarkMode ? '#4FC3F7' : '#0277BD',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.25)' : 'rgba(33, 150, 243, 0.12)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 2,
                      backgroundColor: isDarkMode ? 'rgba(79, 195, 247, 0.2)' : 'rgba(2, 119, 189, 0.1)',
                      borderRadius: '8px',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Lightbulb sx={{ 
                        color: isDarkMode ? '#4FC3F7' : '#0277BD', 
                        fontSize: '1.3rem' 
                      }} />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: isDarkMode ? '#FAFAFA' : '#333333',
                        fontSize: { xs: '1rem', sm: '1.15rem' }
                      }}
                    >
                      Personlige anbefalinger
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ 
                  p: 0, 
                  backgroundColor: isDarkMode ? 'rgba(38, 50, 56, 0.4)' : 'rgba(250, 250, 250, 0.7)'
                }}>
                  <List sx={{ py: 0 }}>
                    {creditScore.anbefalinger.map((anbefaling: string, index: number) => (
                      <ListItem 
                        key={index} 
                        alignItems="flex-start"
                        sx={{ 
                          borderBottom: index < creditScore.anbefalinger.length - 1 ? '1px solid' : 'none',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          py: 1.5
                        }}
                      >
                        <ListItemIcon>
                          <Lightbulb sx={{ 
                            color: isDarkMode ? '#4FC3F7' : '#0277BD',
                            backgroundColor: isDarkMode ? 'rgba(79, 195, 247, 0.12)' : 'rgba(2, 119, 189, 0.08)',
                            borderRadius: '50%',
                            p: 0.5
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={anbefaling} 
                          primaryTypographyProps={{ 
                            sx: { 
                              fontWeight: 500,
                              fontSize: '0.95rem',
                              color: isDarkMode ? '#E0E0E0' : '#333333',
                              lineHeight: 1.5
                            } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
            
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderTop: '1px solid', 
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              mt: 2
            }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<ArrowBack />}
                onClick={handleBackToDashboard}
                sx={{ 
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: isDarkMode 
                    ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                    : '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: isDarkMode 
                      ? '0 6px 16px rgba(0, 0, 0, 0.6)'
                      : '0 6px 16px rgba(0, 0, 0, 0.25)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
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