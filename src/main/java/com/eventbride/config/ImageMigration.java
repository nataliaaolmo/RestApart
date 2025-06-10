package com.eventbride.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Component
public class ImageMigration implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Crear el directorio de destino si no existe
        Path destDir = Paths.get("uploads/images");
        if (!Files.exists(destDir)) {
            Files.createDirectories(destDir);
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
                        System.out.println("Migrated: " + sourcePath.getFileName());
                    } catch (Exception e) {
                        System.err.println("Error migrating " + sourcePath.getFileName() + ": " + e.getMessage());
                    }
                });
        }
    }
} 