# Changelog: Correcciones de Sincronización A3

## Fecha: Octubre 2024

### Resumen Ejecutivo

Se han implementado correcciones críticas y mejoras al sistema de sincronización con A3 para resolver problemas de conectividad, prevenir sobrecarga del servidor A3, y mejorar la confiabilidad del sistema.

---

## Cambios Implementados

### 1. 🚨 **CRÍTICO: Bug CSV Upload** [FIXED]

**Archivo**: `src/app/api/procesar-csv/route.js`

**Problema**: Los vehículos cargados vía CSV se marcaban como `pendienteA3: false`, lo que significaba que **nunca se sincronizaban con A3**.

**Solución**:
- Líneas 151 y 164: Cambiado `pendienteA3: false` → `pendienteA3: true`
- Ahora todos los vehículos cargados por CSV se añaden a la cola de sincronización

**Impacto**: Corrección de bug crítico que impedía la sincronización de vehículos masivos.

---

### 2. ⏱️ **Reducción de Timeouts**

**Archivo**: `src/lib/api-utils.js`

**Cambios**:
```javascript
// ANTES
export const A3_TIMEOUT = 25000; // 25 segundos
export const A3_MAX_RETRIES = 3;

// DESPUÉS
export const A3_TIMEOUT = 10000; // ✅ 10 segundos
export const A3_MAX_RETRIES = 2;  // ✅ 2 intentos
```

**Beneficios**:
- Reduce tiempo de bloqueo en requests lentos
- Evita que requests problemáticos consuman recursos excesivos
- Mejora tiempo de respuesta general del sistema

---

### 3. 📈 **Exponential Backoff**

**Archivo**: `src/lib/api-utils.js`

**Problema**: Los reintentos usaban delay fijo de 2 segundos, pudiendo sobrecargar A3 en casos de fallo.

**Solución**: Implementación de exponential backoff
```javascript
// Delay progresivo: 2s, 4s, 8s...
const delay = A3_RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
```

**Beneficios**:
- Reduce presión sobre A3 en momentos de alto tráfico
- Permite recuperación gradual del servicio
- Mejora tasa de éxito en reintentos

---

### 4. 🛡️ **Prevención de Reintentos Rápidos**

**Archivos**: 
- `prisma/schema.prisma` - Nuevo campo `lastA3SyncAttempt`
- `src/lib/a3-sync.js` - Validación de intervalo mínimo

**Implementación**:
```javascript
const MIN_RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

// Validar antes de sincronizar
if (timeSinceLastAttempt < MIN_RETRY_INTERVAL_MS) {
  return { success: false, skipped: true };
}
```

**Beneficios**:
- Previene "retry storms" que pueden colapsar A3
- Protege contra operaciones duplicadas concurrentes
- Reduce carga innecesaria en el sistema

---

### 5. 🚦 **Rate Limiting Mejorado**

**Archivos**:
- `src/app/api/admin-a3/actualizar-ubicaciones/route.js`
- `src/app/api/admin-a3/sincronizar-nombres/route.js`

**Cambios**:
```javascript
// ANTES
await new Promise(resolve => setTimeout(resolve, 500));  // actualizar
await new Promise(resolve => setTimeout(resolve, 200));  // sincronizar

// DESPUÉS
await new Promise(resolve => setTimeout(resolve, 1500)); // ✅ actualizar
await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ sincronizar
```

**Beneficios**:
- Reduce carga sobre A3 en operaciones por lotes
- Previene throttling por parte del servidor A3
- Mejora estabilidad en sincronizaciones masivas

---

### 6. 🔄 **Tracking de Intentos de Sincronización**

**Archivos actualizados** (todos ahora usan `lastA3SyncAttempt`):
- `src/app/api/cron-update/route.js`
- `src/app/(aplicacion)/dashboard/actions/forceA3UpdateAction.js`
- `src/app/(aplicacion)/dashboard/actions/syncAllA3Action.js`
- `src/app/api/admin-a3/actualizar-ubicaciones/route.js`
- `src/app/api/debug/force-a3-update/route.js`

**Mejoras**:
- Actualización de timestamp antes de cada intento
- Validación de intervalo mínimo (excepto en forzados manuales)
- Manejo del estado `skipped` cuando el reintento es demasiado pronto

---

### 7. 📋 **Nuevo Campo en Base de Datos**

**Archivo**: `prisma/schema.prisma`

**Cambio**:
```prisma
model Coches {
  // ... campos existentes
  lastA3SyncAttempt DateTime? // ✅ NUEVO
}
```

**Nota**: Requiere migración de base de datos (ver sección de Deployment)

---

## Comportamiento del Sistema Actualizado

### Flujo de Sincronización

```
┌─────────────────────────────────────┐
│  Evento de cambio de ubicación      │
│  (QR, CSV, manual)                   │
└──────────────┬──────────────────────┘
               │
               ▼
       pendienteA3 = true
               │
               ▼
    ¿Último intento < 5 min?
      │              │
      ▼ SI          ▼ NO
   SKIP         Intentar sync
                     │
            ┌────────┴────────┐
            │                 │
         ÉXITO            ERROR
            │                 │
     pendienteA3=false   numeroReintentosA3++
     lastA3SyncAttempt   lastA3SyncAttempt
         =now                =now
            │                 │
            └────────┬────────┘
                     │
            Reintentará en 5+ min
```

### Timeouts y Reintentos

| Operación | Timeout | Reintentos | Delay entre reintentos |
|-----------|---------|------------|----------------------|
| **Sincronización A3** | 10s | 2 | 2s, 4s (exponencial) |
| **Intervalo mínimo** | - | - | 5 minutos |
| **Lotes Admin** | 10s | 2 | 1.5s entre vehículos |
| **Sincronizar Nombres** | 10s | 0 | 1s entre vehículos |

---

## Despliegue (Deployment)

### Paso 1: Migración de Base de Datos

**IMPORTANTE**: Este cambio requiere una migración de base de datos.

```bash
# Generar migración
npx prisma migrate dev --name add_lastA3SyncAttempt

# O en producción
npx prisma migrate deploy
```

**La migración añadirá**:
- Campo `lastA3SyncAttempt` de tipo `DateTime` nullable
- No afecta datos existentes (campo nullable)

### Paso 2: Despliegue del Código

El código es retrocompatible. Los vehículos sin `lastA3SyncAttempt` (null) serán procesados normalmente.

### Paso 3: Verificación Post-Despliegue

1. **Verificar logs del cron**:
   ```bash
   # Ver logs de Vercel para confirmar sincronización
   vercel logs --follow
   ```

2. **Probar sincronización manual**:
   - Dashboard → Forzar actualización en un vehículo
   - Verificar que se actualiza `lastA3SyncAttempt`

3. **Probar CSV upload**:
   - Subir CSV con vehículos
   - Verificar que se marcan como `pendienteA3: true`
   - Confirmar que el cron los procesa

---

## Monitoreo y Logs

### Nuevos Mensajes de Log

```javascript
// Reintento omitido por intervalo mínimo
"[CRON_A3] Vehículo ABC123: último intento hace 2min. Esperando 3min más."

// Exponential backoff
"[syncVehicleToA3] Esperando 4000ms antes del siguiente reintento..."

// Vehículo omitido
"[SYNC_ALL_A3] Coche ABC123 omitido: Reintento demasiado pronto."
```

### Métricas a Monitorear

1. **Tasa de éxito de sincronización**: Debería aumentar
2. **Tiempo promedio de sincronización**: Debería reducirse
3. **Errores de timeout**: Deberían disminuir
4. **Vehículos con `numeroReintentosA3 > 3`**: Requieren atención manual

---

## Preguntas Pendientes de Clarificación

Antes de implementar mejoras adicionales, se necesita clarificar:

1. **Límites de API A3**: ¿Cuál es el rate limit real del servidor A3?
   - Opción a) Desconocido - seguir conservador
   - Opción b) Sin límites formales
   - Opción c) X requests por Y segundos

2. **Sistema de Colas**: ¿Preferencia de infraestructura?
   - Opción a) Solo soluciones nativas de Vercel
   - Opción b) Servicios externos OK (Upstash, AWS SQS)
   - Opción c) Mantener enfoque simple actual

3. **Comportamiento CSV**: ¿Cómo deben sincronizarse los uploads masivos?
   - Opción a) Esperar cron (actual)
   - Opción b) Sync inmediata después de CSV
   - Opción c) Usuario elige por upload

---

## Mejoras Futuras (Roadmap)

### Corto Plazo
- [ ] Agregar dashboard de monitoreo de sincronización
- [ ] Alertas automáticas para vehículos con errores persistentes
- [ ] Exportar logs de sincronización

### Medio Plazo
- [ ] Implementar sistema de colas robusto
- [ ] Priorización de vehículos críticos
- [ ] API de webhooks para notificaciones

### Largo Plazo
- [ ] Sincronización bidireccional automática
- [ ] Integración con sistema de notificaciones
- [ ] Dashboard analítico de performance A3

---

## Testing

### Tests Manuales Recomendados

1. **CSV Upload**:
   ```
   ✓ Subir CSV con 10 vehículos
   ✓ Verificar pendienteA3 = true
   ✓ Esperar cron (o forzar)
   ✓ Confirmar sincronización exitosa
   ```

2. **Reintentos Rápidos**:
   ```
   ✓ Forzar sync de un vehículo
   ✓ Intentar sync manual inmediatamente
   ✓ Confirmar que se omite (skipped)
   ✓ Esperar 5+ minutos
   ✓ Confirmar que ahora sí procesa
   ```

3. **Exponential Backoff**:
   ```
   ✓ Desactivar temporalmente A3 (o usar matrícula inválida)
   ✓ Intentar sincronización
   ✓ Verificar en logs: delay de 2s, luego 4s
   ```

---

## Contacto y Soporte

Para preguntas sobre estos cambios:
- Revisar logs con prefijos: `[CRON_A3]`, `[SYNC_ALL_A3]`, `[ACTUALIZAR_UBICACIONES]`
- Consultar `README-A3-SYNC.md` para arquitectura completa
- Verificar estado en Admin A3 panel

---

**Versión**: 1.0  
**Última actualización**: Octubre 2024  
**Estado**: ✅ Implementado - Pendiente de deployment

