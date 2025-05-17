const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function buildApk() {
  console.log('Iniciando proceso de generación de APK para RestApart...');
  console.log('Este script automatizará la generación de una APK para desarrollo/pruebas.');

  try {
    // Verificar que EAS CLI está instalado
    console.log('Verificando instalación de EAS CLI...');
    try {
      execSync('npx eas-cli --version', { stdio: 'inherit' });
    } catch (error) {
      console.log('Instalando EAS CLI...');
      execSync('npm install -g eas-cli', { stdio: 'inherit' });
    }

    // Verificar que el usuario está logueado en Expo
    console.log('Verificando estado de login en Expo...');
    try {
      execSync('npx eas whoami', { stdio: 'inherit' });
    } catch (error) {
      console.log('Por favor, inicia sesión en tu cuenta de Expo:');
      execSync('npx eas login', { stdio: 'inherit' });
    }

    console.log('Generando archivo APK con EAS Build...');
    console.log('Este proceso puede tardar varios minutos...');
    
    // Ejecutar el comando para generar la APK
    execSync('npx eas build -p android --profile preview', { stdio: 'inherit' });

    console.log('\n🎉 ¡Proceso de generación de APK iniciado con éxito!');
    console.log('Una vez completado, podrás descargar la APK desde el dashboard de Expo.');
    console.log('También recibirás un correo electrónico con el enlace de descarga.');

  } catch (error) {
    console.error('❌ Error durante la generación de la APK:', error);
    process.exit(1);
  }
}

buildApk(); 