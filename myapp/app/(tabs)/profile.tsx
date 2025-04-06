import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../app/api';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useLayoutEffect } from 'react';


export default function ProfileScreen() {
  interface UserData {
    id: number;
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
    password?: string;
    isVerified?: boolean;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  type ProfileRouteProp = RouteProp<{ Profile: { id: string } }, 'Profile'>;
  const route = useRoute<ProfileRouteProp>();
  const { id } = route.params || {};
  const userId = id ? parseInt(id, 10) : undefined;
  const navigation = useNavigation();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const url = userId
        ? `/users/${userId}`
        : '/users/auth/current-user';
  
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const user = userId ? response.data : response.data.user;
      setUserData(user);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };  

  useEffect(() => {
    fetchProfile();
  }, []);

  useLayoutEffect(() => {
    if (userData) {
      const fullName = `${userData.firstName} ${userData.lastName}`;
      const screenTitle = userId ? `Perfil de ${fullName}` : 'Tu perfil';
      navigation.setOptions({ title: screenTitle });
    }
  }, [userData]);
  

  const handleImagePick = async () => {
    if (!editing) return;
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });
  
    console.log('ImagePicker result:', result);
  
    if (!result.canceled && result.assets.length > 0) {
      const imageAsset = result.assets[0];
  
      const formData = new FormData();
  
      if (imageAsset.file) {
        console.log('Using imageAsset.file directly');
        formData.append('file', imageAsset.file);
      } else {
        const localUri = imageAsset.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
  
        console.log('Using imageAsset.uri:', localUri);
  
        formData.append('file', {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }
  
      try {
        const token = localStorage.getItem('jwt');
  
        const uploadResponse = await fetch('http://localhost:8080/api/users/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // ⚠️ No pongas Content-Type
          },
          body: formData,
        });
  
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Error al subir foto de perfil:', errorText);
          Alert.alert('Error', 'No se pudo subir la foto de perfil');
          return;
        }
  
        const filename = await uploadResponse.text();
        setUserData(prev => prev ? { ...prev, profilePicture: filename } : null);
        Alert.alert('Foto de perfil actualizada');
  
      } catch (err) {
        console.error('Excepción al subir foto:', err);
        Alert.alert('Error', 'No se pudo subir la foto');
      }
    }
  };  

  const saveChanges = async () => {
    if (!userData) return;
    try {
      const token = localStorage.getItem('jwt');
  
      const updatedUser = {
        username: userData.username,
        password: userData.password || 'Temp1234*',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        telephone: userData.telephone,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        description: userData.description,
        profilePicture: userData.profilePicture, 
        role: userData.role,
        isVerified: userData.isVerified,
  
        // Propiedades específicas del rol
        experienceYears: userData.role === 'OWNER' ? userData.experienceYears : null,
        academicCareer: userData.role === 'STUDENT' ? userData.academicCareer : null,
        hobbies: userData.role === 'STUDENT' ? userData.hobbies : null,
        isSmoker: userData.role === 'STUDENT' ? userData.isSmoker : null,
      };
      console.log('Updated user data:', updatedUser);
      const res = await api.put(`/users/${userData.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setUserData(res.data);
      setEditing(false);
      fetchProfile();
      Alert.alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error al actualizar perfil');
    }
  };  


  if (!userData) return <Text style={styles.loadingText}>Cargando perfil...</Text>;

  const isStudent = userData.role === 'STUDENT';
  const fullName = `${userData.firstName} ${userData.lastName}`;
  const screenTitle = userId ? `Perfil de ${fullName}` : 'Tu perfil';

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity disabled={!editing} onPress={handleImagePick}>
        <Image
          source={{ uri: `http://localhost:8080/images/${userData.profilePicture}` }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.screenTitle}>{screenTitle}</Text>

      {editing && !userId ?  (
        <>
          <TextInput style={styles.input} value={userData.firstName} onChangeText={(text) => setUserData(prev => prev ? { ...prev, firstName: text } : null)} placeholder="Nombre" />
          <TextInput style={styles.input} value={userData.lastName} onChangeText={(text) => setUserData(prev => prev ? { ...prev, lastName: text } : null)} placeholder="Apellido" />
          <TextInput style={styles.input} value={userData.username} onChangeText={(text) => setUserData(prev => prev ? { ...prev, username: text } : null)} placeholder="Usuario" />
          <TextInput style={styles.input} value={userData.email} onChangeText={(text) => setUserData(prev => prev ? { ...prev, email: text } : null)} placeholder="Email" />
          <TextInput style={styles.input} value={userData.telephone} onChangeText={(text) => setUserData(prev => prev ? { ...prev, telephone: text } : null)} placeholder="Teléfono" />
          <TextInput style={styles.input} value={userData.dateOfBirth} onChangeText={(text) => setUserData(prev => prev ? { ...prev, dateOfBirth: text } : null)} placeholder="Fecha de nacimiento (YYYY-MM-DD)" />
          <TextInput style={styles.input} value={userData.gender} onChangeText={(text) => setUserData(prev => prev ? { ...prev, gender: text } : null)} placeholder="Género (MAN/WOMAN)" />
          <TextInput style={styles.input} value={userData.description} onChangeText={(text) => setUserData(prev => prev ? { ...prev, description: text } : null)} placeholder="Descripción" />

          {isStudent ? (
            <>
              <TextInput style={styles.input} value={userData.academicCareer} onChangeText={(text) => setUserData(prev => prev ? { ...prev, academicCareer: text } : null)} placeholder="Carrera" />
              <TextInput style={styles.input} value={userData.hobbies} onChangeText={(text) => setUserData(prev => prev ? { ...prev, hobbies: text } : null)} placeholder="Aficiones" />
              <TextInput style={styles.input} value={userData.isSmoker ? 'true' : 'false'} onChangeText={(text) => setUserData(prev => prev ? { ...prev, isSmoker: text === 'true' } : null)} placeholder="¿Fumador? (true/false)" />
            </>
          ) : (
            <TextInput style={styles.input} value={userData.experienceYears?.toString()} onChangeText={(text) => setUserData(prev => prev ? { ...prev, experienceYears: parseInt(text) } : null)} placeholder="Años de experiencia" />
          )}

          {!userId && (
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
           </TouchableOpacity>
          )}

        </>
      ) : (
        <>
          <Text style={styles.name}>{fullName} - <Text style={styles.username}>@{userData.username}</Text></Text>
          {userId && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#AFC1D6', marginTop: 10 }]}
            onPress={() => router.push({ pathname: '/private-chat', params: { id: userData?.id } })}
          >
            <Text style={[styles.saveButtonText, { color: '#0D1B2A' }]}>Enviar mensaje</Text>
          </TouchableOpacity>
        )}

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
              {userId && (
                <View style={styles.buttonBox}>
                  <Text
                    style={styles.messageButton}
                    onPress={() => router.push({ pathname: '/private-chat', params: { id: userData?.id } })}
                  >
                    Enviar mensaje
                  </Text>
                </View>
              )}

              <View style={styles.commentBox}>
                <Text style={styles.commentRating}>4⭐</Text>
                <Text style={styles.commentText}>Hugo siempre te ayuda cuando tienes problemas pero a veces tarda en responder</Text>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={() => setEditing(true)}>
            <Text style={styles.saveButtonText}>Editar perfil</Text>
          </TouchableOpacity>
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
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    textAlign: 'center',
    marginBottom: 20,
  },
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
  input: { backgroundColor: '#E0E1DD', color: '#000', marginBottom: 10, padding: 10, borderRadius: 10 },
  saveButton: { backgroundColor: '#E0E1DD', padding: 15, borderRadius: 10, marginTop: 20 },
  saveButtonText: { color: '#0D1B2A', fontWeight: 'bold', textAlign: 'center' },
});
