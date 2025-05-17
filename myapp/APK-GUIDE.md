# Guía para generar y probar la APK de RestApart

Esta guía describe los pasos necesarios para generar una APK de la aplicación RestApart y probarla en el emulador de Android Studio.

## Pre-requisitos

1. Una cuenta de Expo (regístrate en [expo.dev](https://expo.dev))
2. Android Studio instalado con al menos un emulador configurado
3. Node.js y npm instalados
4. Expo CLI instalado (`npm install -g expo-cli`)
5. EAS CLI instalado (`npm install -g eas-cli`)

## Paso 1: Generar la APK

Hay dos maneras de generar la APK:

### Opción 1: Usando el script automatizado

1. Abre una terminal en el directorio `myapp`
2. Ejecuta el comando:
   ```
   npm run build-apk
   ```
3. Sigue las instrucciones en pantalla
   - Si es necesario, inicia sesión en tu cuenta de Expo
   - El proceso de construcción iniciará en los servidores de Expo

### Opción 2: Manualmente con EAS Build

1. Abre una terminal en el directorio `myapp`
2. Asegúrate de haber iniciado sesión en Expo:
   ```
   npx eas login
   ```
3. Ejecuta el comando de construcción:
   ```
   npx eas build -p android --profile preview
   ```
4. Sigue las instrucciones en pantalla para completar el proceso

## Paso 2: Descargar la APK

Cuando la construcción se complete (puede tardar unos 15-30 minutos):

1. Recibirás un correo electrónico de Expo con un enlace para descargar la APK
2. También puedes acceder a la APK desde el dashboard de Expo (https://expo.dev)
   - Ve a tu proyecto
   - Accede a la sección "Builds"
   - Descarga la última construcción

## Paso 3: Probar la APK en el emulador de Android Studio

### Configurar el emulador

1. Abre Android Studio
2. Haz clic en "Device Manager" en la barra lateral derecha
3. Selecciona un emulador existente o crea uno nuevo:
   - Haz clic en "Create device"
   - Selecciona un modelo de teléfono (por ejemplo, Pixel 5)
   - Selecciona una imagen de sistema (recomendado: API 33 o superior)
   - Completa la configuración y haz clic en "Finish"

### Instalar y ejecutar la APK en el emulador

#### Método 1: Arrastrar y soltar

1. Inicia el emulador desde Android Studio
2. Una vez que el emulador esté funcionando, simplemente arrastra y suelta el archivo APK descargado sobre la ventana del emulador
3. Confirma la instalación si se solicita
4. La aplicación se instalará y se abrirá automáticamente

#### Método 2: Usando ADB (Android Debug Bridge)

1. Inicia el emulador desde Android Studio
2. Abre una terminal y ejecuta:
   ```
   adb install ruta/a/tu/RestApart.apk
   ```
3. Una vez instalada, busca la aplicación "RestApart" en el menú de aplicaciones del emulador y ábrela

## Notas importantes

- **Adaptaciones Web a Nativo**: Se ha implementado una capa de compatibilidad para reemplazar el `localStorage` del navegador por `AsyncStorage` de React Native.
  
- **Permisos**: La primera vez que ejecutes la aplicación, es posible que necesites aceptar permisos adicionales.

- **Conexión al backend**: Asegúrate de que tu backend esté accesible desde el emulador o modifica los endpoints en la aplicación para apuntar a la URL correcta.

## Solución de problemas

- **La aplicación se cierra inesperadamente**: Verifica los registros en Android Studio para identificar errores específicos.

- **Problemas de autenticación**: Si hay problemas para iniciar sesión, verifica que los endpoints de autenticación estén configurados correctamente para el entorno móvil.

- **Problemas de red**: El emulador tiene su propia configuración de red. Si tu backend está en localhost, deberás usar `10.0.2.2` en lugar de `localhost` en tus URLs de API para acceder desde el emulador. 