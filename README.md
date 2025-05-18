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
2. Instalar [Maven 3.8+](https://maven.apache.org/install.html).
3. Instalar [Java 17](https://www.oracle.com/es/java/technologies/downloads/#java17).
4. Configurar variable de entorno (JAVA_HOME) con la ruta donde esté el jdk17.
5. Configurar PostgreSQL, se recomienda DBeaver como herramienta de gestión de bases de datos
6. En el proyecto buscar el archivo *application.properties* y *application-postgres.properties*, ambos en la (ruta: src/main/resources/)
7. Cambiar en ese archivo las variables de entorno

### Arranque del sistema

#### ***Backend***
```
    mvn clean package
```
Luego, dirigirse al archivo EventbrideApplication.java y pulsar sobre Run o Debug.

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
