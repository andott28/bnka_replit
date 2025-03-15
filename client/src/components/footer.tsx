import { Link as RouterLink } from 'wouter';
import { Box, Container, Typography, Link, Grid, Button } from '@mui/material';
import { usePostHog } from '@/lib/posthog-provider';
import { Settings } from 'lucide-react';

export function Footer() {
  const { consentStatus, acceptConsent, rejectConsent } = usePostHog();

  const onPrivacySettingsClick = () => {
    // Re-show consent dialog
    if (consentStatus === 'accepted') {
      rejectConsent();
    }
    acceptConsent();
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: theme => theme.palette.mode === 'light' ? 'grey.100' : 'grey.900'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              BNKA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Din digitale bankpartner med fokus på sikkerhet, brukervennlighet og moderne løsninger.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Kontakt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Storgata 1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              0151 Oslo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              kontakt@bnka.no
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +47 22 12 34 56
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Lenker
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Hjem
            </Link>
            <Link component={RouterLink} to="/hvordan-det-fungerer" color="inherit" display="block" sx={{ mb: 1 }}>
              Hvordan det fungerer
            </Link>
            <Link component={RouterLink} to="/kontakt" color="inherit" display="block" sx={{ mb: 1 }}>
              Kontakt oss
            </Link>
            <Link component={RouterLink} to="/privacy-policy" color="inherit" display="block" sx={{ mb: 1 }}>
              Personvernerklæring
            </Link>
            <Button
              startIcon={<Settings size={16} />}
              onClick={onPrivacySettingsClick}
              size="small"
              sx={{ mt: 1, fontSize: '0.875rem', textTransform: 'none', color: 'text.secondary' }}
            >
              Personverninnstillinger
            </Button>
          </Grid>
        </Grid>
        
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} BNKA. Alle rettigheter forbeholdt.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}