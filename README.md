# RestApart

Como configurar el proyecto.

1. Instalar MariaDB (https://mariadb.org/).
2. Instalar Java 17. Configurar variable de entorno (JAVA_HOME) con la ruta donde esté el jdk17.
3. Abrir MYSQL Client y configurar la contraseña que se desee.
4. Poner los siguientes comandos:
```
    create database eventbride; (para crear la database)
    use eventbride; (para meterte en la database)
    show tables; (para ver si se han creado. De primeras saldrá vacio)
```

5. En el proyecto buscar el archivo *application-mysql.properties.example* (ruta: src\main\resources\application-mysql.properties.example).

6. Duplicar ese archivo y renombrar la copia a *application-mysql.properties*

7. Cambiar en el nuevo *application-mysql.properties* el usuario y la contraseña que pusieras en la instalación de MariaDB. El username habitual suele ser *root*:
```
    spring.datasource.username=${MYSQL_USER:TUUSUARIO}
    spring.datasource.password=${MYSQL_PASS:TUCONTRASEÑA}
```
IMPORTANTE, no pongas el user y contraseña entre comillas, sigue la estructura literal, por ejemplo:
```
    spring.datasource.username=${MYSQL_USER:RyanGosling}
    spring.datasource.password=${MYSQL_PASS:lalaland}
```

8. Realizar los siguientes comandos:

*Backend*
```
    ./mvnw clean install
    ./mvnw spring-boot:run
```
*Frontend*
```
    cd frontend
    npm install
    npm run dev
```
Con todo activo te debería salir una pantalla tal que así (o similar dependiendo de la versión que exista en ese momento):

![image](https://github.com/user-attachments/assets/24b833aa-99ee-4176-a1f0-557f567a8c50)

9. User y pass para probar en el navegador:
    - user: alice123
    - pass: 1234

10. Con todo esto hecho, con el comando ```show tables;``` en el CMD de MySQL debería aparecer todo correctamente.

Una vez con todo hecho, deberías ver algo así, pero con todas las entidades existentes en ese momento:

![image](https://github.com/user-attachments/assets/b9c11486-8b60-4856-b040-c45649d071f0)
