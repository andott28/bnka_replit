import { NavHeader } from '@/components/nav-header';
import { Footer } from '@/components/footer';
import { Box, Container, Typography, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Brukervilkår
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Sist oppdatert: 15. mars 2025
          </Typography>
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            1. Innledning
          </Typography>
          <Typography paragraph>
            Disse brukervilkårene ("Vilkårene") regulerer din bruk av nettstedet bnka.no og tjenestene som 
            tilbys av BNKA ("vi", "oss", eller "vår"). Ved å bruke nettstedet vårt eller våre tjenester, 
            aksepterer du disse Vilkårene i sin helhet. Hvis du ikke aksepterer disse Vilkårene, må du ikke 
            bruke nettstedet eller tjenestene våre.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Definisjoner
          </Typography>
          <Typography paragraph>
            <strong>"Tjenestene"</strong> refererer til alle produkter, tjenester, innhold, funksjoner, teknologier eller funksjoner 
            som tilbys av BNKA på nettsiden vår.
          </Typography>
          <Typography paragraph>
            <strong>"Bruker"</strong> refererer til en person som har registrert seg på nettsiden vår og opprettet en konto.
          </Typography>
          <Typography paragraph>
            <strong>"Innhold"</strong> refererer til alt materiale som finnes på nettsiden vår, inkludert tekst, bilder, lyd, 
            videoer, grafikk, ikoner og programvare.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Kontoregistrering og sikkerhet
          </Typography>
          <Typography paragraph>
            For å få tilgang til enkelte funksjoner på nettsiden vår, må du registrere en konto. Du er ansvarlig for:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Nøyaktig informasjon" 
                secondary="Å gi nøyaktig, aktuell og fullstendig informasjon under registreringsprosessen."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Kontovedlikehold" 
                secondary="Å holde din kontoinformasjon oppdatert til enhver tid."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Kontosikkerhet" 
                secondary="Å holde ditt passord og andre sikkerhetsinformasjon konfidensielt, og å ikke gi din kontoinformasjon til noen tredjepart."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Aktivitet" 
                secondary="All aktivitet som foregår under din konto, enten du har autorisert denne aktiviteten eller ikke."
              />
            </ListItem>
          </List>
          <Typography paragraph>
            Vi forbeholder oss retten til å deaktivere enhver brukerkonto hvis vi mener at du har brutt noen av 
            bestemmelsene i disse Vilkårene.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Låneavtaler og finansielle tjenester
          </Typography>
          <Typography paragraph>
            Når du søker om eller inngår en låneavtale gjennom vår plattform:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Lånevilkår" 
                secondary="Alle låneavtaler er underlagt egne spesifikke vilkår og betingelser som vil bli presentert for deg før du inngår avtalen."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Kredittvurdering" 
                secondary="Du samtykker til at vi kan utføre kredittsjekk og hente inn finansiell informasjon om deg for å vurdere lånesøknaden din."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Informasjonsnøyaktighet" 
                secondary="Du er ansvarlig for å gi nøyaktig og riktig økonomisk informasjon i lånesøknadsprosessen."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Dokumentasjon" 
                secondary="Du må fremlegge all nødvendig dokumentasjon når dette kreves for å verifisere informasjonen i lånesøknaden."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            5. Bruk av tjenestene
          </Typography>
          <Typography paragraph>
            Ved bruk av våre tjenester samtykker du til å ikke:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Ulovlig bruk" 
                secondary="Bruke tjenestene til ulovlige formål eller på måter som strider mot lover og forskrifter."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Falsk informasjon" 
                secondary="Gi falsk eller villedende informasjon i lånesøknader eller under kontoregistrering."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Skadelig aktivitet" 
                secondary="Forsøke å forstyrre eller skade våre tjenester, servere eller nettverk."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Uautorisert tilgang" 
                secondary="Forsøke å få uautorisert tilgang til deler av tjenestene, andre kontoer eller datasystemer."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            6. Immaterielle rettigheter
          </Typography>
          <Typography paragraph>
            Alt innhold på nettsiden vår, inkludert, men ikke begrenset til tekst, grafikk, logoer, ikoner, 
            bilder, lydklipp, digitale nedlastinger og programvare, eies av BNKA eller våre innholdsleverandører 
            og er beskyttet av norsk og internasjonal opphavsrett og varemerkelovgivning. Dette innholdet kan 
            ikke kopieres, reproduseres, modifiseres, publiseres, lastes opp, postes, overføres eller distribueres 
            på noen måte uten vårt uttrykkelige skriftlige samtykke.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Ansvarsfraskrivelse
          </Typography>
          <Typography paragraph>
            Våre tjenester leveres "som de er" og "som tilgjengelige" uten noen garantier, verken uttrykte eller 
            underforståtte. Vi påtar oss ikke ansvar for nøyaktigheten, påliteligheten eller tilgjengeligheten 
            av innholdet på nettsiden vår. I den grad det er tillatt av loven, fraskriver BNKA seg alle garantier, 
            inkludert, men ikke begrenset til, underforståtte garantier om salgbarhet, egnethet for et bestemt formål 
            og ikke-krenkelse.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Ansvarsbegrensning
          </Typography>
          <Typography paragraph>
            BNKA og våre ledere, direktører, ansatte og agenter vil ikke være ansvarlige for indirekte, tilfeldige, 
            spesielle, følge- eller straffbare skader, inkludert, men ikke begrenset til tap av profitt, data, bruk, 
            goodwill eller andre immaterielle tap som følge av din tilgang til eller bruk av, eller manglende evne 
            til å få tilgang til eller bruke tjenestene.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Skadesløsholdelse
          </Typography>
          <Typography paragraph>
            Du samtykker i å holde BNKA og våre ledere, direktører, ansatte og agenter skadesløse for eventuelle krav, 
            forpliktelser, skader, tap og utgifter, inkludert, uten begrensning, rimelige advokathonorarer og kostnader, 
            som oppstår som følge av din bruk av tjenestene, ditt brudd på disse Vilkårene eller ditt brudd på 
            tredjeparts rettigheter.
          </Typography>

          <Typography variant="h6" gutterBottom>
            10. Endringer i vilkårene
          </Typography>
          <Typography paragraph>
            Vi forbeholder oss retten til å endre eller erstatte disse Vilkårene når som helst etter eget skjønn. 
            Hvis en revisjon er vesentlig, vil vi forsøke å gi minst 30 dagers varsel før nye vilkår trer i kraft. 
            Hva som utgjør en vesentlig endring vil bli bestemt etter vårt eget skjønn.
          </Typography>

          <Typography variant="h6" gutterBottom>
            11. Oppsigelse
          </Typography>
          <Typography paragraph>
            Vi kan avslutte eller suspendere din tilgang til tjenestene umiddelbart, uten forhåndsvarsel eller ansvar, 
            av enhver grunn, inkludert, uten begrensning, hvis du bryter disse Vilkårene. Ved oppsigelse vil din rett 
            til å bruke tjenestene opphøre umiddelbart.
          </Typography>

          <Typography variant="h6" gutterBottom>
            12. Gjeldende lov
          </Typography>
          <Typography paragraph>
            Disse Vilkårene skal være underlagt og tolkes i samsvar med lovene i Norge, uten hensyn til 
            lovkonfliktsprinsipper. Alle tvister som oppstår i forbindelse med eller relatert til disse Vilkårene 
            eller tjenestene skal løses ved de ordinære norske domstoler, med Oslo tingrett som verneting.
          </Typography>

          <Typography variant="h6" gutterBottom>
            13. Kontaktinformasjon
          </Typography>
          <Typography paragraph>
            Hvis du har spørsmål om disse Vilkårene, kan du kontakte oss på:
          </Typography>
          <Typography paragraph>
            BNKA<br />
            Storgata 1<br />
            0151 Oslo<br />
            E-post: support@bnka.no<br />
            Telefon: +47 22 12 34 56
          </Typography>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} BNKA | Alle rettigheter forbeholdt
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
}