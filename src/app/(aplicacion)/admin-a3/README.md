# Módulo de Administración A3

Este módulo proporciona herramientas avanzadas para la gestión y sincronización de vehículos con el sistema A3.

## Características Principales

### 1. Comparación de Estado
- **Comparación en tiempo real** entre la base de datos local y A3
- **Identificación de diferencias** en ubicaciones y nombres
- **Detección de errores** de sincronización
- **Filtros avanzados** para analizar estados específicos

### 2. Sincronización de Nombres
- **Obtención automática** de nombres desde A3
- **Matching por matrícula** para vehículos cargados por CSV
- **Procesamiento por lotes** configurable
- **Control de pausa/reanudación** para operaciones largas
- **Logs detallados** de cambios realizados

### 3. Actualización de Ubicaciones
- **Envío de ubicaciones** desde la app hacia A3
- **Procesamiento por lotes** con tamaños optimizados
- **Manejo de timeouts** y reintentos automáticos
- **Control granular** de operaciones

### 4. Control de Lotes
- **Configuración flexible** de tamaños de lote
- **Pausas configurables** entre lotes
- **Control de timeouts** y reintentos
- **Estado en tiempo real** de operaciones
- **Historial de operaciones** con estadísticas

### 5. Sistema de Logs
- **Logs en tiempo real** con diferentes niveles
- **Filtros avanzados** por tipo y contenido
- **Exportación a CSV** de logs
- **Auto-scroll** configurable
- **Estadísticas** de logs por tipo

## Configuración

### Tamaños de Lote Recomendados
- **Nombres**: 10-20 vehículos por lote
- **Ubicaciones**: 3-5 vehículos por lote (más crítico)

### Timeouts
- **Consulta A3**: 10-15 segundos
- **Actualización A3**: 15-30 segundos
- **Pausa entre lotes**: 1-2 segundos

## Uso

### Acceso
El módulo está disponible en `/admin-a3` y requiere permisos de `crud:ubicacion_coches`.

### Flujo de Trabajo Recomendado
1. **Comparar Estado** - Identificar diferencias
2. **Sincronizar Nombres** - Actualizar nombres desde A3
3. **Actualizar Ubicaciones** - Enviar ubicaciones a A3
4. **Revisar Logs** - Verificar resultados

### Control de Lotes
- **Iniciar** operaciones desde el panel de control
- **Pausar** si es necesario (mantiene estado)
- **Reanudar** desde donde se pausó
- **Detener** para cancelar operación

## API Endpoints

### Estado General
- `GET /api/admin-a3/estado-general` - Estadísticas generales

### Comparación
- `GET /api/admin-a3/comparar-estado` - Comparar con A3

### Sincronización de Nombres
- `GET /api/admin-a3/vehiculos-sin-nombre` - Listar vehículos sin nombre
- `POST /api/admin-a3/sincronizar-nombres` - Sincronizar nombres

### Actualización de Ubicaciones
- `GET /api/admin-a3/vehiculos-pendientes-ubicacion` - Listar pendientes
- `POST /api/admin-a3/actualizar-ubicaciones` - Actualizar ubicaciones

### Control de Lotes
- `GET /api/admin-a3/configuracion-lotes` - Obtener configuración
- `POST /api/admin-a3/configuracion-lotes` - Guardar configuración
- `POST /api/admin-a3/iniciar-operacion` - Iniciar operación
- `POST /api/admin-a3/pausar-operacion` - Pausar operación
- `POST /api/admin-a3/reanudar-operacion` - Reanudar operación
- `POST /api/admin-a3/detener-operacion` - Detener operación
- `POST /api/admin-a3/limpiar-historial` - Limpiar historial

## Consideraciones Técnicas

### Manejo de Timeouts
- Implementación de `fetchWithTimeout` para control de timeouts
- Reintentos automáticos con backoff exponencial
- Pausas entre lotes para evitar sobrecarga

### Persistencia de Estado
- Configuración guardada en `data/admin-a3-config.json`
- Estado de operaciones persistente
- Historial de operaciones limitado a 100 entradas

### Seguridad
- Autenticación requerida para todos los endpoints
- Validación de permisos en frontend y backend
- Sanitización de inputs

## Solución de Problemas

### Errores Comunes
1. **Timeout en A3**: Reducir tamaño de lote o aumentar timeout
2. **Operación pausada**: Reanudar desde panel de control
3. **Errores de permisos**: Verificar permisos de usuario
4. **Configuración perdida**: Restaurar desde valores por defecto

### Logs de Debug
- Revisar logs en tiempo real en el panel
- Exportar logs para análisis externo
- Verificar estado de operaciones en control de lotes

## Mejoras Futuras
- Notificaciones push para operaciones completadas
- Dashboard de métricas históricas
- Integración con sistema de alertas
- Backup automático de configuraciones
