# Sistema de Sincronización A3

## Descripción General

Este documento describe el sistema unificado de sincronización con A3 implementado en la aplicación.

## Arquitectura

### Módulo Central: `src/lib/a3-sync.js`

Todas las operaciones de sincronización utilizan este módulo centralizado que proporciona:

#### Funciones Principales

**`syncVehicleToA3(matricula, ubicacionA3, logPrefix)`**
- Sincroniza un vehículo con A3
- Valida que la matrícula y ubicación sean válidas
- Maneja reintentos automáticos
- Retorna objeto con `{success, status, responseBody, error}`

**`getVehicleFromA3(matricula, logPrefix)`**
- Obtiene datos de un vehículo desde A3
- Útil para comparaciones y sincronización de nombres
- Retorna objeto con `{success, data, error}`

### Constantes Configurables (`src/lib/api-utils.js`)

```javascript
export const A3_TIMEOUT = 10000;           // ✅ 10 segundos (reducido de 25s)
export const A3_MAX_RETRIES = 2;           // ✅ 2 intentos (reducido de 3)
export const A3_RETRY_BASE_DELAY = 2000;   // ✅ 2 segundos base para exponential backoff
export const MIN_RETRY_INTERVAL_MS = 300000; // ✅ 5 minutos mínimo entre reintentos
```

## Sistemas de Sincronización

### 1. Actualización Manual Individual

**Ubicación**: `src/app/(aplicacion)/dashboard/actions/forceA3UpdateAction.js`

**Uso**: Desde el dashboard, botón de sincronización en cada vehículo

**Características**:
- Procesa 1 vehículo a la vez
- Revalidación inmediata del path
- Feedback en tiempo real

### 2. Sincronización Masiva Manual

**Ubicación**: `src/app/(aplicacion)/dashboard/actions/syncAllA3Action.js`

**Uso**: Desde el dashboard, botón "Sincronizar Todos"

**Características**:
- Procesa 5 vehículos por lote
- Muestra progreso y errores detallados
- Contador de vehículos pendientes

### 3. Cron Automático

**Ubicación**: `src/app/api/cron-update/route.js`

**Uso**: Ejecutado automáticamente por Vercel Cron

**Características**:
- Procesa 5 vehículos por invocación
- Control de estado para evitar ejecuciones concurrentes
- Reinicio automático después de 24 horas si se queda bloqueado

**Configuración en `vercel.json`**:
```json
{
  "crons": [{
    "path": "/api/cron-update?x-secure-token=<SECRET>",
    "schedule": "*/15 * * * *"
  }]
}
```

### 4. Admin A3 - Actualización por Lotes

**Ubicación**: `src/app/api/admin-a3/actualizar-ubicaciones/route.js`

**Uso**: Desde el panel Admin A3

**Características**:
- Lotes configurables
- Control de pausa/reanudación
- Logs detallados en tiempo real
- Exportación de resultados

## Estados de Sincronización

### Campo `pendienteA3` (Boolean)

- `false` = Vehículo **sincronizado** con A3
- `true` = Vehículo **pendiente** de sincronizar con A3

### Campo `numeroReintentosA3` (Integer)

Contador de intentos de sincronización. Se reinicia a 0 cuando la sincronización es exitosa.

## Flujo de Sincronización

```
┌─────────────────────────────────────────┐
│  Vehículo cambia de ubicación           │
│  (escaneo QR, modificación manual)      │
└────────────────┬────────────────────────┘
                 │
                 ▼
         pendienteA3 = true
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   Cron Automático   Manual/Admin A3
   (cada 15 min)     (cuando se necesite)
        │                 │
        └────────┬────────┘
                 │
                 ▼
    syncVehicleToA3(matricula, ubicacionA3)
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    EXITOSO           ERROR
        │                 │
pendienteA3=false   numeroReintentosA3++
numeroReintentosA3=0    │
                        │
              (Si reintentos >= 3)
                        │
              Requiere atención manual
```

## Manejo de Errores

### Errores Comunes

1. **Ubicación sin nombreA3**
   - El vehículo no se puede sincronizar
   - Se logea el error
   - No se incrementan reintentos (error de configuración)

2. **Timeout de A3**
   - Se reintenta automáticamente (hasta 3 veces)
   - Delay de 2 segundos entre reintentos
   - Se incrementa numeroReintentosA3

3. **Error de API A3 (4xx, 5xx)**
   - Se reintenta automáticamente
   - Se logea el status code y respuesta
   - Se incrementa numeroReintentosA3

### Logs

Todos los sistemas usan prefijos estándar:
- `[FORCE_A3_ACTION]` - Actualización individual
- `[SYNC_ALL_A3]` - Sincronización masiva
- `[CRON_A3]` - Cron automático
- `[ACTUALIZAR_UBICACIONES]` - Admin A3
- `[A3_SYNC]` - Módulo central (default)

## Variables de Entorno

```bash
# URL de la API de A3 (IP externa para Vercel)
A3_API_URL=http://212.64.162.34:8080

# API Key para autenticación en A3
API_KEY=<tu-api-key>

# Secret para el cron job
API_CRON=<tu-secret>
```

**IMPORTANTE**: La IP interna `10.0.64.131` NO funciona desde Vercel (despliegue en la nube). Siempre usar la IP externa `212.64.162.34`.

## Endpoints API

### GET `/api/coches/[matricula]`
Obtiene la ubicación de un vehículo (usado por A3 para consultas)

### POST `/api/admin-a3/actualizar-ubicaciones`
Actualiza ubicaciones de vehículos en lotes

### GET `/api/admin-a3/estado-general`
Obtiene estadísticas de sincronización

### GET `/api/admin-a3/vehiculos-pendientes-ubicacion`
Lista vehículos pendientes de sincronizar

### GET `/api/cron-update?x-secure-token=<SECRET>`
Ejecuta el cron de sincronización automática

## Monitoreo

### Dashboard Principal
- Icono verde: Vehículo sincronizado (`pendienteA3: false`)
- Icono rojo: Vehículo pendiente (`pendienteA3: true`)
- Icono gris: Sin ubicación

### Panel Admin A3
- **Pendientes**: Vehículos con `pendienteA3: true`
- **Sincronizados**: Vehículos con `pendienteA3: false`
- **Errores**: Vehículos con `numeroReintentosA3 >= 3`

## Troubleshooting

### Problema: "Error API A3. Status: 500"
**Solución**: Verificar que A3 esté funcionando correctamente. Revisar logs de A3.

### Problema: "Request timed out"
**Solución**: A3 está respondiendo lento. El sistema reintenta automáticamente. Si persiste, aumentar `A3_TIMEOUT`.

### Problema: "Ubicación sin nombreA3 configurado"
**Solución**: En la tabla `Ubicaciones`, asegurarse de que el campo `nombreA3` esté configurado correctamente.

### Problema: Vehículos con muchos reintentos
**Solución**: Revisar en Admin A3 → Comparar Estado para identificar el problema específico. Puede ser una diferencia de nomenclatura entre la app y A3.

## Mejoras Recientes (Octubre 2024)

### ✅ Implementadas

1. **Timeouts Reducidos**: De 25s a 10s para evitar bloqueos prolongados
2. **Exponential Backoff**: Delays progresivos (2s, 4s, 8s) en reintentos
3. **Prevención de Reintentos Rápidos**: Intervalo mínimo de 5 minutos entre intentos
4. **Rate Limiting Mejorado**: Delays aumentados en operaciones por lotes
5. **Tracking de Intentos**: Nuevo campo `lastA3SyncAttempt` en base de datos
6. **Bug Fix Crítico**: CSV uploads ahora marcan correctamente `pendienteA3: true`

Ver `CHANGELOG-A3-FIXES.md` para detalles completos.

## Mejoras Futuras

- [ ] Dashboard de monitoreo en tiempo real
- [ ] Alertas automáticas para vehículos con errores
- [ ] Sistema de colas robusto (Upstash/SQS)
- [ ] Sincronización bidireccional automática
- [ ] Webhooks desde A3 para actualizaciones instantáneas
- [ ] Cola de prioridad para vehículos críticos


