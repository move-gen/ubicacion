-- Renombrar columna actualizadoA3 a pendienteA3
-- La lógica se mantiene: false = sincronizado con A3, true = pendiente de sincronización
ALTER TABLE `Coches` CHANGE COLUMN `actualizadoA3` `pendienteA3` BOOLEAN NOT NULL DEFAULT false;


