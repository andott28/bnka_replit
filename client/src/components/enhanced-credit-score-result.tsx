import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  Grid, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import { 
  Check, 
  Warning, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  School, 
  Work, 
  Language, 
  People, 
  AccessTime, 
  Home, 
  AccountBalance,
  ExpandMore
} from '@mui/icons-material';

interface EnhancedCreditScoreResultProps {
  creditScoreData: {
    score: string;
    numerisk_score: number;
    forklaring: string;
    styrker: string[];
    svakheter: string[];
    anbefalinger: string[];
    faktorer: {
      inntektsstabilitet: number;
      gjeldsbelastning: number;
      betalingshistorikk: number;
      tilpasningsevne: number;
      utdanningsrelevans: number;
      språkferdigheter: number;
      nettverk: number;
    };
  } | null;
  isLoading: boolean;
  error: Error | null;
}

export function EnhancedCreditScoreResult({ 
  creditScoreData, 
  isLoading, 
  error 
}: EnhancedCreditScoreResultProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [expandedSection, setExpandedSection] = useState<string | false>('styrker');

  const handleAccordionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  // Hjelpefunksjon for å konvertere bokstavkarakter til farge
  const getGradeColor = (grade: string) => {
    const gradeColors = {
      A: "#4CAF50",
      B: "#8BC34A",
      C: "#FFC107",
      D: "#FF9800",
      E: "#FF5722",
      F: "#F44336"
    };
    return gradeColors[grade as keyof typeof gradeColors] || "#757575";
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
              <Typography variant="body2" color="textSecondary">
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
              <Typography variant="body2" color="textSecondary">
                10
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    );
  };

  if (isLoading) {
    return (
      <Card sx={{ maxWidth: '100%', mb: 3 }}>
        <CardHeader title="Laster kredittvurdering..." />
        <CardContent>
          <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
            <LinearProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Vennligst vent mens vi henter din detaljerte kredittvurdering...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error || !creditScoreData) {
    return (
      <Card sx={{ maxWidth: '100%', mb: 3 }}>
        <CardHeader 
          title="Kunne ikke hente kredittvurdering" 
          sx={{ 
            backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
            color: '#F44336'
          }}
        />
        <CardContent>
          <Typography color="error" variant="body1">
            {error ? error.message : "Kredittdata ikke tilgjengelig"}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ maxWidth: '100%', mb: 4, boxShadow: 3 }}>
        <CardHeader 
          title="Din kredittvurdering for innvandrere" 
          subheader="Basert på din personlige finansielle situasjon og innvandrerrelaterte faktorer"
          sx={{ 
            backgroundColor: isDarkMode ? '#1E1E1E' : '#f8f9fa',
            borderBottom: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 3,
                backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.6)' : 'rgba(248, 249, 250, 0.8)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="overline" color="textSecondary">
                  Din kredittscore
                </Typography>
                <Box sx={{ 
                  position: 'relative', 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${getGradeColor(creditScoreData.score)}20`,
                  borderRadius: '50%',
                  border: `4px solid ${getGradeColor(creditScoreData.score)}`
                }}>
                  <Typography variant="h2" color={getGradeColor(creditScoreData.score)} fontWeight="bold">
                    {creditScoreData.score}
                  </Typography>
                </Box>
                <Typography variant="h6" textAlign="center" gutterBottom>
                  {creditScoreData.numerisk_score}/100 poeng
                </Typography>
                <Chip
                  label={
                    creditScoreData.score === 'A' || creditScoreData.score === 'B' 
                      ? 'Utmerket kredittverdighet' 
                      : creditScoreData.score === 'C' 
                        ? 'God kredittverdighet' 
                        : creditScoreData.score === 'D' 
                          ? 'Middels kredittverdighet' 
                          : 'Lav kredittverdighet'
                  }
                  color={
                    creditScoreData.score === 'A' || creditScoreData.score === 'B' 
                      ? 'success' 
                      : creditScoreData.score === 'C' 
                        ? 'info' 
                        : creditScoreData.score === 'D' 
                          ? 'warning' 
                          : 'error'
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Kredittanalyse
                </Typography>
                <Typography variant="body1" paragraph>
                  {creditScoreData.forklaring}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Nøkkelfaktorer i din score
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {renderFaktor("Inntektsstabilitet", creditScoreData.faktorer.inntektsstabilitet, <AccountBalance fontSize="small" color="primary" />)}
                  {renderFaktor("Gjeldsbelastning", creditScoreData.faktorer.gjeldsbelastning, <TrendingDown fontSize="small" color={creditScoreData.faktorer.gjeldsbelastning >= 5 ? "primary" : "error"} />)}
                  {renderFaktor("Betalingshistorikk", creditScoreData.faktorer.betalingshistorikk, <AccessTime fontSize="small" color="primary" />)}
                  {renderFaktor("Tilpasningsevne", creditScoreData.faktorer.tilpasningsevne, <TrendingUp fontSize="small" color="primary" />)}
                  {renderFaktor("Utdanningsrelevans", creditScoreData.faktorer.utdanningsrelevans, <School fontSize="small" color="primary" />)}
                  {renderFaktor("Språkferdigheter", creditScoreData.faktorer.språkferdigheter, <Language fontSize="small" color="primary" />)}
                  {renderFaktor("Nettverk i Norge", creditScoreData.faktorer.nettverk, <People fontSize="small" color="primary" />)}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Accordion 
          expanded={expandedSection === 'styrker'} 
          onChange={handleAccordionChange('styrker')}
          sx={{ 
            mb: 2,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#ffffff',
            boxShadow: 2
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              borderLeft: '4px solid #4CAF50'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Check sx={{ color: '#4CAF50', mr: 1 }} />
              <Typography variant="h6">Dine styrker</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {creditScoreData.styrker.map((styrke, index) => (
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
            boxShadow: 2
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ 
              backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              borderLeft: '4px solid #FF9800'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ color: '#FF9800', mr: 1 }} />
              <Typography variant="h6">Forbedringsområder</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {creditScoreData.svakheter.map((svakhet, index) => (
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
            boxShadow: 2
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ 
              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
              borderLeft: '4px solid #2196F3'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Lightbulb sx={{ color: '#2196F3', mr: 1 }} />
              <Typography variant="h6">Personlige anbefalinger</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {creditScoreData.anbefalinger.map((anbefaling, index) => (
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
    </Box>
  );
}