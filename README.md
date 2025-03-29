# Krivo - Finansiell inkludering

En banebrytende kredittscoringsplattform som gir alle tilgang til finansielle tjenester gjennom en alternativ kredittvurderingsmodell.

## Tekniske komponenter

- React.js frontend med responsivt design
- AI-integrert kredittscore (Google Gemini)
- Material Design v3 styling
- Norsk lokalisering
- Sikker rollebasert autentisering
- Dynamisk lånesøknadsprosess
- PostHog analytics integrasjon
- Mobiloptimalisert grensesnitt med avansert finansanalyse

## Installasjon og kjøring

### Forutsetninger

- Node.js versjon 20 eller nyere
- Docker og Docker Compose (for lokal databaseutvikling)

### Installasjon

1. Klon repositoriet
2. Installer avhengigheter med `npm install`
3. Kopier `.env.example` til `.env` og fyll inn nødvendige verdier

### Utvikling

Du kan velge mellom å bruke en lokal Docker PostgreSQL-database eller en ekstern produksjonsdatabase:

#### Bruk Docker-database (lokal utvikling)

```bash
# Start Docker-containeren
./scripts/docker-commands.sh up

# Konfigurer miljøet til å bruke Docker-databasen
./scripts/toggle-db.sh docker

# Starter applikasjonen
npm run dev
```

#### Bruk produksjonsdatabase

```bash
# Konfigurer miljøet til å bruke produksjonsdatabasen
./scripts/toggle-db.sh production

# Starter applikasjonen
npm run dev
```

## Database-håndtering

Prosjektet bruker Drizzle ORM for å håndtere databasen. For å oppdatere databaseskjemaet:

1. Gjør endringer i `shared/schema.ts`
2. Kjør `npm run db:push` for å oppdatere databaseskjemaet

## Brukere og testing

Testbrukere for lokal utvikling:

- Admin: 
  - Brukernavn: `admin`
  - Passord: `password123`

- Testbruker:
  - Brukernavn: `testbruker`
  - Passord: `password123`

## Docker-kommandoer

Prosjektet inkluderer et script for å håndtere Docker-containeren:

```bash
./scripts/docker-commands.sh [kommando]
```

Tilgjengelige kommandoer:
- `up` - Start Docker-containeren i bakgrunnen
- `down` - Stopp Docker-containeren
- `logs` - Vis logger fra Docker-containeren
- `use-docker` - Bytt til Docker-database
- `use-production` - Bytt til produksjonsdatabase
- `help` - Vis hjelpetekst

## Lisens

Copyright (c) 2025 Krivo AS