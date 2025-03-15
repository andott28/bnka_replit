import { useState, useEffect } from 'react';
import { usePostHog } from '@/lib/posthog-provider';
import { Box, Button, Typography, Paper } from '@mui/material';
import { X } from 'lucide-react';
import { Link } from 'wouter';

export function ConsentDialog() {
  const { consentStatus, acceptConsent, rejectConsent } = usePostHog();
  const [open, setOpen] = useState(false);

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
          onClick={() => setOpen(false)}
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
          <Link href="/privacy-policy">
            <span style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>
              personvernerklæring
            </span>
          </Link>
          .
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              rejectConsent();
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