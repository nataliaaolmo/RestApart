import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Favorites from '../favorites';
import api from '../api';
import StudentsInMyAccommodations from '../students-in-my-accommodations';
import AdminData from '../admin-data';
import storage from '../../utils/storage';

export default function FavoritesOrStudents() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await storage.getItem('jwt');
        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await api.get('/users/auth/current-user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data?.user) {
          throw new Error("No se pudieron cargar los datos del usuario");
        }

        const userRole = response.data.user.role;
        setRole(userRole);
        await storage.setItem('role', userRole);
      } catch (error: any) {
        console.error('Error al obtener el perfil:', error);
        if (error.response?.status === 401) {
          await storage.removeItem('jwt');
          router.replace('/login');
        } else {
          Alert.alert('Error', 'No se pudieron cargar los datos. Por favor, intenta de nuevo.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#415A77" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === 'STUDENT' && <Favorites />}
      {role === 'OWNER' && <StudentsInMyAccommodations />}
      {role === 'ADMIN' && <AdminData />}
      {!['STUDENT', 'OWNER', 'ADMIN'].includes(role) && (
        <Text style={styles.errorText}>Rol no reconocido</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#E0E1DD',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E0E1DD',
    marginHorizontal: 20,
  }
});
