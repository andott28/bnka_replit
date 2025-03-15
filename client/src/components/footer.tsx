import { Link as RouterLink } from 'wouter';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { useAuth } from '@/hooks/use-auth';

export function Footer() {
  const { user } = useAuth();

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
            </Grid>
          </Grid>
          
          <Box mt={5}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} BNKA
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}