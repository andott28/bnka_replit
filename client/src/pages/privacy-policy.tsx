import { NavHeader } from '@/components/nav-header';
import { Box, Container, Typography, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Personvernerklæring
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Sist oppdatert: 14. mars 2025
          </Typography>
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            1. Innledning
          </Typography>
          <Typography paragraph>
            Denne personvernerklæringen beskriver hvordan BNKA ("vi", "oss" eller "vår") samler inn, bruker og deler
            personopplysninger når du bruker vår nettside bnka.no og våre tjenester. Vi er opptatt av å beskytte ditt
            personvern og behandler dine personopplysninger i samsvar med personvernforordningen (GDPR) og annen
            relevant lovgivning.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Behandlingsansvarlig
          </Typography>
          <Typography paragraph>
            BNKA er behandlingsansvarlig for personopplysningene som samles inn gjennom vår nettside.
            For henvendelser vedrørende personvern, kontakt oss på: privacy@bnka.no
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Hvilke personopplysninger vi samler inn
          </Typography>
          <Typography paragraph>
            Vi samler inn følgende typer personopplysninger:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Kontaktinformasjon" 
                secondary="Navn, e-postadresse, telefonnummer, og adresse når du oppretter en konto eller søker om lån."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Identifikasjons- og finansiell informasjon" 
                secondary="Fødselsdato, personnummer (ved BankID-verifisering), inntektsopplysninger, arbeidsforhold og andre økonomiske opplysninger for å vurdere lånesøknader."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Teknisk informasjon" 
                secondary="IP-adresse, enhetstype, nettlesertype, språkinnstillinger, og hvordan du samhandler med vår nettside."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            4. Hvordan vi bruker informasjonen
          </Typography>
          <Typography paragraph>
            Vi bruker personopplysningene for følgende formål:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Tilby og forbedre tjenestene" 
                secondary="For å levere våre finansielle tjenester, behandle lånesøknader og forbedre funksjonaliteten på nettsiden vår."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Kommunikasjon" 
                secondary="For å kommunisere med deg om dine forespørsler, søknader og tjenester."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Analyse og forbedring" 
                secondary="For å analysere bruken av nettstedet vårt og forbedre brukeropplevelsen."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Juridiske forpliktelser" 
                secondary="For å oppfylle våre juridiske forpliktelser, inkludert anti-hvitvaskingsloven."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            5. Informasjonskapsler (cookies)
          </Typography>
          <Typography paragraph>
            Vi bruker informasjonskapsler for å forbedre din opplevelse på nettsiden vår. Dette inkluderer:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Nødvendige cookies" 
                secondary="Disse er avgjørende for at nettsiden skal fungere og kan ikke deaktiveres."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Analytiske cookies (PostHog)" 
                secondary="Vi bruker PostHog for å samle anonymisert statistikk om bruk av nettsiden. Dette hjelper oss å forbedre nettsiden basert på hvordan den brukes."
              />
            </ListItem>
          </List>
          <Typography paragraph>
            Du kan når som helst endre dine samtykker for informasjonskapsler ved å klikke på "Personverninnstillinger" 
            i bunnteksten på nettsiden vår.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Dine rettigheter
          </Typography>
          <Typography paragraph>
            Under GDPR har du følgende rettigheter:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Innsyn" 
                secondary="Du har rett til å be om innsyn i personopplysningene vi har om deg."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Retting" 
                secondary="Du kan be om at vi retter eller oppdaterer uriktige personopplysninger."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Sletting" 
                secondary="Du har i visse tilfeller rett til å be om at vi sletter dine personopplysninger."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Dataportabilitet" 
                secondary="Du har rett til å motta personopplysningene dine i et strukturert, vanlig og maskinlesbart format."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Innsigelse" 
                secondary="Du har rett til å protestere mot behandling av dine personopplysninger som er basert på vår legitime interesse."
              />
            </ListItem>
          </List>
          <Typography paragraph>
            For å utøve dine rettigheter, send oss en e-post til privacy@bnka.no.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Datalagring
          </Typography>
          <Typography paragraph>
            Vi vil ikke oppbevare personopplysningene dine lenger enn det som er nødvendig for de formålene de ble samlet inn for, 
            inkludert for å oppfylle juridiske, regnskapsmessige eller rapporteringskrav. For lånesøknader og kundeforhold 
            er lovpålagt oppbevaringstid 5 år etter at kundeforholdet er avsluttet, i henhold til bokføringsloven og hvitvaskingsloven.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Endringer i personvernerklæringen
          </Typography>
          <Typography paragraph>
            Vi kan oppdatere denne personvernerklæringen fra tid til annen. Eventuelle endringer vil publiseres på denne siden
            med oppdatert dato. Vi oppfordrer deg til å gjennomgå denne siden jevnlig for å holde deg informert.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Klagerett
          </Typography>
          <Typography paragraph>
            Hvis du mener at vår behandling av dine personopplysninger er i strid med personvernlovgivningen,
            har du rett til å klage til Datatilsynet. Du finner informasjon om hvordan kontakte Datatilsynet 
            på <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">www.datatilsynet.no</a>.
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © BNKA {new Date().getFullYear()} | Alle rettigheter forbeholdt
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}