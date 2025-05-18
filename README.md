# RestApart

<p align="center">
    <img src="myapp/assets/images/logo-restapart.png" width="225" height="225">
</p>

## Introducción
RestApart es una plataforma que permite el alquiler de pisos compartidos de estudiantes. Destaca por poder conocer quiénes son las personas con las que vas a convivir en el piso antes de comenzar el curso. Tienes la oportunidad de ver su perfil y poder comunicarte con ellos a través de la aplicación. También te permite una búsqueda por afinidad con los posibles inquilinos a través de un filtrado basándose en el estilo de vida de los estudiantes.

## Guía de instalación y arranque del sistema

### Pasos previos

Como configurar el proyecto.

1. Instalar [PostgreSQL](https://www.postgresql.org/).
2. Instalar [Java 17](https://www.oracle.com/es/java/technologies/downloads/#java17).
3. Configurar variable de entorno (JAVA_HOME) con la ruta donde esté el jdk17.
4. Configurar PostgreSQL, se recomienda DBeaver como herramienta de gestión de bases de datos
5. En el proyecto buscar el archivo *application.properties* y *application-postgres.properties*, ambos en la (ruta: src/main/resources/)
6. Cambiar en ese archivo las variables de configuración
7. Realizar los siguientes comandos:

### Arranque del sistema

#### ***Backend***
```
    ./mvnw clean install
    ./mvnw spring-boot:run
```
#### ***Frontend***
```
    cd myapp
    npm install
    npx expo start
```

Con las siguientes credenciales deberías poder acceder al sistema correctamente:
#### ***Propietario***
```
    - user: alice123
    - pass: 1234
```

#### ***Estudiante***
```
    - user: charlie789
    - pass: 1234
```

¡Ya puedes empezar a realizar cambios!
