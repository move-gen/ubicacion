# Archivos de Prueba CSV

Este directorio contiene archivos de prueba para probar la funcionalidad de subir y eliminar coches por CSV.

## Archivos incluidos:

### 1. `coches_prueba.csv`
- **Propósito**: Probar la subida/creación de coches
- **Formato**: matricula,ubicacion
- **Contenido**: 5 coches de prueba con diferentes ubicaciones

### 2. `eliminar_coches_prueba.csv`
- **Propósito**: Probar la eliminación de coches por matrícula
- **Formato**: matricula
- **Contenido**: 
  - 2 matrículas que deberían existir (después de subir el primer CSV)
  - 1 matrícula que no existe (para probar el caso de "no encontrado")

## Cómo usar las pruebas:

1. **Navegar a**: `/subir-csv` en la aplicación web
2. **Primero**: Subir `coches_prueba.csv` en la pestaña "Subir Vehículos"
3. **Segundo**: Usar `eliminar_coches_prueba.csv` en la pestaña "Eliminar Vehículos"
4. **Verificar**: Los resultados en la misma página

## Ubicaciones requeridas:

Para que funcione el CSV de prueba, tu base de datos debe tener estas ubicaciones:
- Taller Central
- Concesionario Norte  
- Almacén Sur
- Taller Este
- Sede Principal

Si no existen, el sistema mostrará errores y no creará los coches.

## Casos de prueba cubiertos:

### CSV de subida:
- ✅ Crear coches nuevos
- ✅ Actualizar ubicación de coches existentes
- ✅ Manejar ubicaciones no existentes (error)
- ✅ Validar formato de CSV

### CSV de eliminación:
- ✅ Eliminar coches existentes
- ✅ Manejar matrículas no encontradas
- ✅ Eliminar registros relacionados (historial, envíos)
- ✅ Validar formato de CSV

## Notas de seguridad:

⚠️ **IMPORTANTE**: La eliminación es irreversible. No uses estos archivos en producción sin antes hacer una copia de seguridad de tu base de datos.
