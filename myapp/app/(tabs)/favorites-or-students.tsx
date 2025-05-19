import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Favorites from '../favorites';
import api from '../api';
import StudentsInMyAccommodations from '../students-in-my-accommodations';
import storage from '../../utils/storage';

export default function FavoritesOrStudents() {
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await storage.getItem('jwt');
        const response = await api.get('/users/auth/current-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.user.role);
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };
    
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      {role === 'STUDENT' && <Favorites />}
      {role === 'OWNER' && <StudentsInMyAccommodations />}
      {role !== 'STUDENT' && role !== 'OWNER' && (
        <Text style={styles.loadingText}>Cargando...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  }
});
