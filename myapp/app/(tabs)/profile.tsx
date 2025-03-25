import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import api from '../../app/api';

export default function ProfileScreen() {
  interface UserData {
    role: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
    gender: string;
    dateOfBirth: string;
    description: string;
    email: string;
    telephone: string;
    isSmoker: boolean;
    academicCareer: string;
    hobbies: string;
    experienceYears?: number;
  }

  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await api.get('/users/auth/current-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error al obtener el perfil:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!userData) {
    return <Text style={styles.loadingText}>Cargando perfil...</Text>;
  }

  const isStudent = userData.role === 'STUDENT';
  const fullName = `${userData.firstName} ${userData.lastName}`;

  return (
    <ScrollView style={styles.container}>
        <Image
        source={{ uri: `http://localhost:8080/images/${userData.profilePicture}` }}
        style={styles.profileImage}
        />
      <Text style={styles.name}>{fullName} - <Text style={styles.username}>@{userData.username}</Text></Text>
      {isStudent ? (
        <>
          <Text style={styles.detail}>{userData.gender === 'WOMAN' ? 'Mujer' : 'Hombre'} - {new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear()} años</Text>
          <Text style={styles.description}>{userData.description}</Text>
          <View style={styles.contactBox}>
            <Text style={styles.sectionTitle}>Datos de contacto</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.text}>{userData.email}</Text>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.text}>{userData.telephone}</Text>
          </View>
          <View style={styles.moreInfoBox}>
            <Text style={styles.sectionTitle}>Más información</Text>
            <Text style={styles.text}>{userData.isSmoker ? 'Fumador/a' : 'No fumador/a'}</Text>
            <Text style={styles.label}>Qué estudio</Text>
            <Text style={styles.text}>{userData.academicCareer}</Text>
            <Text style={styles.label}>Aficiones</Text>
            {typeof userData.hobbies === 'string' &&
            userData.hobbies.split(',').map((hobby, index) => (
                <Text key={index} style={styles.text}>{hobby.trim()}</Text>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.detail}>{userData.experienceYears} años de experiencia</Text>
          <Text style={styles.rating}>4,3 ⭐</Text>
          <View style={styles.buttonBox}>
            <Text style={styles.messageButton}>Enviar mensaje</Text>
          </View>
          <View style={styles.commentBox}>
            <Text style={styles.commentRating}>4⭐</Text>
            <Text style={styles.commentText}>Hugo siempre te ayuda cuando tienes problemas pero a veces tarda en responder</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A', padding: 20 },
  profileImage: { width: '100%', height: 250, borderRadius: 10, marginBottom: 20 },
  name: { color: '#E0E1DD', fontSize: 18, fontWeight: 'bold' },
  username: { color: '#AFC1D6' },
  detail: { color: '#AFC1D6', marginVertical: 5 },
  description: { color: '#E0E1DD', marginTop: 10, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  contactBox: { marginTop: 20 },
  moreInfoBox: { marginTop: 30 },
  sectionTitle: { color: '#E0E1DD', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  label: { color: '#AFC1D6', marginTop: 10 },
  text: { color: '#E0E1DD' },
  rating: { color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
  buttonBox: { marginTop: 20, alignItems: 'center' },
  messageButton: { backgroundColor: '#AFC1D6', color: '#000', padding: 10, borderRadius: 10, fontWeight: 'bold' },
  commentBox: { backgroundColor: '#E0E1DD', padding: 15, borderRadius: 10, marginTop: 20 },
  commentRating: { fontWeight: 'bold', fontSize: 16 },
  commentText: { marginTop: 5, color: '#000' },
  loadingText: { color: '#E0E1DD', textAlign: 'center', marginTop: 50 },
});