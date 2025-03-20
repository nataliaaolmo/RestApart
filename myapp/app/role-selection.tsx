import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  const handleNext = () => {
    if (selectedRole) {
      router.push({ pathname: '/register-form', params: { role: selectedRole } });
    }
  };

  const handleLogin = () => {
    router.push('/login'); 
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Crear una nueva cuenta</Text>
      
      <TouchableOpacity 
        style={[styles.option, selectedRole === 'STUDENT' && styles.selected]} 
        onPress={() => setSelectedRole('STUDENT')}>
        <Text style={styles.optionText}>Estudiante</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.option, selectedRole === 'OWNER' && styles.selected]} 
        onPress={() => setSelectedRole('OWNER')}>
        <Text style={styles.optionText}>Propietario</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={!selectedRole}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
      
      <Text style={styles.loginText}>
        ¿Ya tienes una cuenta?{" "}
        <Text style={styles.link} onPress={handleLogin}>
          Inicia sesión aquí
        </Text>
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 30,
  },
  option: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1B263B',
    alignItems: 'center',
    marginBottom: 15,
  },
  selected: {
    backgroundColor: '#415A77',
  },
  optionText: {
    fontSize: 16,
    color: '#E0E1DD',
  },
  button: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B2A',
  },
  loginText: {
    color: '#E0E1DD',
    marginTop: 20,
    fontSize: 14,
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
