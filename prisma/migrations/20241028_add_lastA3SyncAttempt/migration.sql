-- AddLastA3SyncAttempt
-- Añade campo para rastrear el último intento de sincronización con A3

ALTER TABLE `Coches` ADD COLUMN `lastA3SyncAttempt` DATETIME(3) NULL;

