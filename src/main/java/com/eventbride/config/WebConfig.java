package com.eventbride.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private SystemLockInterceptor lockInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(lockInterceptor)
                .addPathPatterns("/api/**"); 
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar el manejador para las imágenes de perfil
        Path profileImagesDir = Paths.get("src/main/resources/static/images");
        String profileImagesPath = profileImagesDir.toFile().getAbsolutePath();
        
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + profileImagesPath + "/", "file:uploads/images/");
    }
}

