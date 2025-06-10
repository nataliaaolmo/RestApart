package com.eventbride.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;

@Component
public class ImageMigration implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(ImageMigration.class);

    @Override
    public void run(String... args) throws Exception {
        // Crear el directorio de destino si no existe
        Path destDir = Paths.get("uploads/images");
        if (!Files.exists(destDir)) {
            Files.createDirectories(destDir);
            logger.info("Directorio de imágenes creado: {}", destDir.toAbsolutePath());
        }

        // Directorio de origen
        Path sourceDir = Paths.get("src/main/resources/static/images");

        // Mover todas las imágenes del directorio de origen al de destino
        if (Files.exists(sourceDir)) {
            Files.walk(sourceDir)
                .filter(Files::isRegularFile)
                .forEach(sourcePath -> {
                    try {
                        Path destPath = destDir.resolve(sourcePath.getFileName());
                        Files.copy(sourcePath, destPath, StandardCopyOption.REPLACE_EXISTING);
                        logger.info("Imagen migrada: {} -> {}", sourcePath.getFileName(), destPath);
                        
                        // Asegurar que el archivo tenga permisos de lectura
                        File file = destPath.toFile();
                        file.setReadable(true, false);
                        file.setExecutable(true, false);
                    } catch (Exception e) {
                        logger.error("Error migrando {}: {}", sourcePath.getFileName(), e.getMessage());
                    }
                });
        } else {
            logger.warn("El directorio de origen no existe: {}", sourceDir.toAbsolutePath());
        }
    }
} 