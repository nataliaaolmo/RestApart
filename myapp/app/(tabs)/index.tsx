import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* Logo */}
      <Image source={require('@/assets/images/logo-restapart.png')} style={styles.logo} />

      {/* Texto de bienvenida */}
      <Text style={styles.welcomeText}>Bienvenido a Rentapart</Text>

      {/* Botón para comenzar */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/role-selection')}>
        <Text style={styles.buttonText}>EMPEZAR</Text>
      </TouchableOpacity>
    </ThemedView>
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
});
