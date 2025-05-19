import { Platform, Dimensions, Alert } from 'react-native';

/**
 * Utilidades para ayudar a la compatibilidad entre Web y Nativo
 */

/**
 * Determina si la aplicación se está ejecutando en un entorno web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Determina si la aplicación se está ejecutando en un entorno nativo (Android/iOS)
 */
export const isNative = !isWeb;

/**
 * Obtiene las dimensiones de la pantalla o ventana
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Muestra un mensaje de alerta compatible con web y nativo
 * @param title Título de la alerta
 * @param message Mensaje de la alerta
 * @param onOk Función a ejecutar al hacer clic en OK
 */
export const showAlert = (title: string, message: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}\n${message}`);
      if (onOk) onOk();
    }
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

/**
 * Abre una URL en el navegador
 * @param url URL a abrir
 */
export const openURL = async (url: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  } else {
    // En nativo, usar Linking de React Native
    const { Linking } = require('react-native');
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      showAlert('Error', `No se puede abrir la URL: ${url}`);
    }
  }
};

/**
 * Determina si estamos en un dispositivo con tamaño de pantalla pequeño
 */
export const isSmallScreen = () => {
  const { width } = getScreenDimensions();
  return width < 375; // iPhone SE o similar
};

/**
 * Convierte píxeles a unidades relativas de pantalla
 * @param px Valor en píxeles
 */
export const px2dp = (px: number) => {
  const { width } = getScreenDimensions();
  return px * width / 375; // Basado en iPhone 6/7/8
};

export default {
  isWeb,
  isNative,
  getScreenDimensions,
  showAlert,
  openURL,
  isSmallScreen,
  px2dp
}; 