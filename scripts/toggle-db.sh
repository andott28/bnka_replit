#!/bin/bash

# Funksjon for å vise bruksanvisning
function show_help() {
  echo "Bruk: $0 [docker|production]"
  echo ""
  echo "Kommandoer:"
  echo "  docker     - Bytt til lokal Docker PostgreSQL-database"
  echo "  production - Bytt til produksjons PostgreSQL-database"
}

# Sjekk om .env-filen eksisterer
if [ ! -f .env ]; then
  echo "Feil: .env-filen ble ikke funnet."
  exit 1
fi

# Sjekk om backup-filer eksisterer
if [ ! -f .env.backup ]; then
  cp .env .env.backup
  echo "Opprettet backup av opprinnelig .env-fil: .env.backup"
fi

if [ ! -f .env.production.backup ]; then
  if grep -q "neon.tech" .env; then
    cp .env .env.production.backup
    echo "Opprettet backup av produksjons .env-fil: .env.production.backup"
  fi
fi

# Håndter kommandolinje-argumenter
case "$1" in
  docker)
    echo "Bytter til lokal Docker PostgreSQL-database..."
    
    # Oppdater DATABASE_URL i .env-filen
    sed -i 's|^DATABASE_URL=.*$|DATABASE_URL=postgres://postgres:postgres@localhost:5432/krivo|g' .env
    
    echo "Byttet til Docker-database. DATABASE_URL er nå:"
    grep DATABASE_URL .env
    ;;
    
  production)
    echo "Bytter til produksjons PostgreSQL-database..."
    
    if [ -f .env.production.backup ]; then
      # Hent DATABASE_URL fra produksjonsbackup
      PROD_DB_URL=$(grep DATABASE_URL .env.production.backup)
      
      # Oppdater DATABASE_URL i .env-filen
      sed -i "s|^DATABASE_URL=.*$|$PROD_DB_URL|g" .env
      
      echo "Byttet til produksjonsdatabase. DATABASE_URL er nå:"
      grep DATABASE_URL .env
    else
      echo "Feil: Kunne ikke finne produksjonsdatabasens URL. Mangler .env.production.backup-fil."
      exit 1
    fi
    ;;
    
  *)
    show_help
    exit 1
    ;;
esac

echo "Fullført. Du må starte serveren på nytt for at endringene skal tre i kraft."