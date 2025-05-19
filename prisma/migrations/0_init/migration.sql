-- CreateTable
CREATE TABLE `Coches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `enVenta` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `url` VARCHAR(191) NULL,
    `usuarioRegistro` VARCHAR(191) NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NULL,
    `idUbicacion` INTEGER NOT NULL,

    UNIQUE INDEX `Coches_matricula_key`(`matricula`),
    INDEX `Coches_idUbicacion_idx`(`idUbicacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ubicaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `latitud` DOUBLE NOT NULL,
    `longitud` DOUBLE NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `nombreAMostrar` VARCHAR(191) NOT NULL,
    `agenteExterno` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Ubicaciones_nombre_idx`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialUbicaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idCoche` INTEGER NOT NULL,
    `idUbicacion` INTEGER NOT NULL,
    `usuarioRegistro` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `fechaUbicacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `kilometros` INTEGER NOT NULL,

    INDEX `HistorialUbicaciones_idCoche_idx`(`idCoche`),
    INDEX `HistorialUbicaciones_idUbicacion_idx`(`idUbicacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Coches` ADD CONSTRAINT `Coches_idUbicacion_fkey` FOREIGN KEY (`idUbicacion`) REFERENCES `Ubicaciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialUbicaciones` ADD CONSTRAINT `HistorialUbicaciones_idCoche_fkey` FOREIGN KEY (`idCoche`) REFERENCES `Coches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialUbicaciones` ADD CONSTRAINT `HistorialUbicaciones_idUbicacion_fkey` FOREIGN KEY (`idUbicacion`) REFERENCES `Ubicaciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

