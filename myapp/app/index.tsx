import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
  en: {
    welcome: 'Welcome to RestApart',
    start: 'START',
    slogans: [
      'Find your perfect place',
      'Your next shared home is waiting',
      'Affordable rooms for students',
    ],
  },
  es: {
    welcome: 'Bienvenido a RestApart',
    start: 'EMPEZAR',
    slogans: [
      'Encuentra tu piso ideal',
      'Tu próximo hogar compartido te espera',
      'Habitaciones asequibles para estudiantes',
    ],
  },
});

i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default function HomeScreen() {
  const router = useRouter();
  const [sloganIndex, setSloganIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setSloganIndex(prev => (prev + 1) % i18n.t('slogans').length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    router.push('/role-selection');
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/logo-restapart.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
      />

      <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
        {i18n.t('welcome')}
      </Animated.Text>

      <Animated.Text style={[styles.slogan, { opacity: fadeAnim }]}>
        {i18n.t('slogans')[sloganIndex]}
      </Animated.Text>

      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleStart}>
        <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
          <Text style={styles.buttonText}>
            {i18n.t('start')}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1B2A', // Azul oscuro para el fondo
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E1DD', // Color claro para el texto
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#415A77', // Azul más claro para el botón
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E1DD',
  },
  slogan: {
    fontSize: 16,
    color: '#415A77',
    marginBottom: 30,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
