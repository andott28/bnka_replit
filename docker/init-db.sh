#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON "session" ("expire");
EOSQL

echo "Database initialisering fullført."