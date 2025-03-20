import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

export default function WelcomeScreen() {
  const { name, role } = useLocalSearchParams(); // Recibe los parámetros de la pantalla anterior
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* Logo o imagen de bienvenida */}
      <Image source={require('@/assets/images/logo-restapart.png')} style={styles.logo} />

      {/* Mensaje de bienvenida */}
      <Text style={styles.welcomeText}>¡Bienvenido, {name}!</Text>

      {/* Botón para ir al inicio o dashboard */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)')}>
        <Text style={styles.buttonText}>Ir al inicio</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 16,
    color: '#AFC1D6',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B2A',
  },
});
