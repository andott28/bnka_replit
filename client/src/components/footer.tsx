import { Link as RouterLink } from 'wouter';
import { Box, Container, Typography, Link, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { usePostHog } from '@/lib/posthog-provider';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function Footer() {
  const { consentStatus, acceptConsent, rejectConsent } = usePostHog();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAuth();

  const openPrivacySettings = () => {
    setIsSettingsOpen(true);
  };

  const closePrivacySettings = () => {
    setIsSettingsOpen(false);
  };

  const handleAcceptConsent = () => {
    acceptConsent();
    closePrivacySettings();
  };

  const handleRejectConsent = () => {
    rejectConsent();
    closePrivacySettings();
  };

  return (
    <>
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
              <Link component={RouterLink} to="/terms-of-service" color="inherit" display="block" sx={{ mb: 1 }}>
                Brukervilkår
              </Link>
              <Button
                startIcon={<Settings size={16} />}
                onClick={openPrivacySettings}
                size="small"
                sx={{ mt: 1, fontSize: '0.875rem', textTransform: 'none', color: 'text.secondary' }}
              >
                Personverninnstillinger
              </Button>
            </Grid>
          </Grid>
          
          <Box mt={5}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} BNKA | 
              <Link component={RouterLink} to="/terms-of-service" color="inherit" sx={{ mx: 0.5 }}>
                Brukervilkår
              </Link> | 
              <Link component={RouterLink} to="/privacy-policy" color="inherit" sx={{ mx: 0.5 }}>
                Personvernerklæring og informasjonskapsler
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Dialog for personverninnstillinger */}
      <Dialog 
        open={isSettingsOpen}
        onClose={closePrivacySettings}
        aria-labelledby="privacy-settings-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="privacy-settings-dialog-title">
          Personverninnstillinger
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Vi bruker informasjonskapsler for å analysere hvordan nettsiden brukes og forbedre 
            brukeropplevelsen. I henhold til norsk lov og GDPR, trenger vi ditt samtykke for å samle inn 
            anonymiserte data om din bruk av nettsiden.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Du kan når som helst endre dine valg for informasjonskapsler. For mer informasjon, les vår{' '}
            <Link component={RouterLink} to="/privacy-policy" onClick={closePrivacySettings}>
              personvernerklæring
            </Link>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectConsent} color="inherit">
            Avslå alle
          </Button>
          <Button onClick={handleAcceptConsent} variant="contained" color="primary">
            Aksepter alle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}