#!/bin/bash

# Script para aplicar migraciones de Prisma con manejo de baseline automático

echo "🔍 Intentando aplicar migraciones..."

# Intentar aplicar migraciones
if ! npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.txt; then
  # Si falla, revisar si es error P3005 (necesita baseline)
  if grep -q "P3005" /tmp/migrate_output.txt; then
    echo "⚠️  Base de datos necesita baseline. Marcando migración inicial como aplicada..."
    
    # Marcar la migración inicial como aplicada
    npx prisma migrate resolve --applied "0_init"
    
    echo "✅ Baseline completado. Aplicando migraciones restantes..."
    
    # Intentar aplicar migraciones nuevamente
    npx prisma migrate deploy
  else
    echo "❌ Error al aplicar migraciones"
    exit 1
  fi
fi

echo "✅ Migraciones aplicadas correctamente"

