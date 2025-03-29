#!/bin/bash

function show_help() {
  echo "Docker kommandoer for Krivo-applikasjonen"
  echo ""
  echo "Bruk: $0 [kommando]"
  echo ""
  echo "Kommandoer:"
  echo "  up        - Start Docker-containeren i bakgrunnen"
  echo "  down      - Stopp Docker-containeren"
  echo "  logs      - Vis logger fra Docker-containeren"
  echo "  use-docker     - Bytt til Docker-database"
  echo "  use-production - Bytt til produksjonsdatabase"
  echo "  help      - Vis denne hjelpeteksten"
}

case "$1" in
  up)
    echo "Starter Docker-containeren..."
    docker-compose up -d
    ;;
  down)
    echo "Stopper Docker-containeren..."
    docker-compose down
    ;;
  logs)
    echo "Viser Docker-logger..."
    docker-compose logs -f
    ;;
  use-docker)
    ./scripts/toggle-db.sh docker
    ;;
  use-production)
    ./scripts/toggle-db.sh production
    ;;
  help|*)
    show_help
    ;;
esac