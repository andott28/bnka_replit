import { useState, useEffect } from 'react';
import { usePostHog, AnalyticsEvents } from '@/lib/posthog-provider';
import { Box, Button, Typography, Paper } from '@mui/material';
import { X } from 'lucide-react';
import { useLocation } from 'wouter';

export function ConsentDialog() {
  const { consentStatus, acceptConsent, rejectConsent, trackEvent } = usePostHog();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Vis dialogen bare hvis samtykke ikke er avgjort ennå
    if (consentStatus === 'pending') {
      // Kort forsinkelse for å unngå å vise dialogen umiddelbart
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [consentStatus]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          p: 3,
          borderRadius: 2,
          position: 'relative',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Button
          onClick={() => {
            setOpen(false);
            trackEvent(AnalyticsEvents.CLOSE_MODAL, {
              modal_type: 'consent_dialog',
              timestamp: new Date().toISOString()
            });
          }}
          aria-label="Lukk"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            minWidth: 'auto',
            p: '4px',
          }}
        >
          <X size={16} />
        </Button>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Personverninformasjon
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Vi bruker informasjonskapsler for å analysere hvordan nettsiden brukes og forbedre 
          brukeropplevelsen. I henhold til norsk lov og GDPR, trenger vi ditt samtykke for å samle inn 
          anonymiserte data om din bruk av nettsiden.
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Du kan lese mer om hvordan vi behandler personopplysninger i vår{' '}
          <span 
            style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => {
              setOpen(false);
              setLocation('/privacy-policy');
              trackEvent(AnalyticsEvents.LINK_CLICK, {
                link_type: 'privacy_policy',
                from_page: window.location.pathname,
                timestamp: new Date().toISOString()
              });
            }}
          >
            personvernerklæring
          </span>
          .
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              rejectConsent();
              trackEvent(AnalyticsEvents.CONSENT_REJECT, {
                timestamp: new Date().toISOString(),
                page: window.location.pathname
              });
              setOpen(false);
            }}
            sx={{ borderRadius: '8px' }}
          >
            Avslå
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              acceptConsent();
              trackEvent(AnalyticsEvents.CONSENT_ACCEPT, {
                timestamp: new Date().toISOString(),
                page: window.location.pathname
              });
              setOpen(false);
            }}
            sx={{ borderRadius: '8px' }}
          >
            Aksepter
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}