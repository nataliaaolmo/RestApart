import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import axios, { AxiosError } from 'axios';

export default function RegisterFormScreen() {
  const { role } = useLocalSearchParams(); // Obtiene el rol desde la pantalla anterior
  const router = useRouter();
  console.log("Pantalla de registro cargada con role:", role);
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    gender: '',
    dateOfBirth: '',
    description: '',
    profilePicture: '',
    isSmoker: false,
    academicCareer: '',
    hobbies: '',
    experienceYears: '',
  });

  // Función para actualizar los campos del formulario
  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // Función para enviar los datos al backend
  const handleSubmit = async () => {
    // Validar que todos los campos obligatorios estén llenos
    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.email || !form.telephone || !form.gender || !form.dateOfBirth) {
      Alert.alert('Error', 'Todos los campos obligatorios deben estar completos.');
      return;
    }

    // Convertir "gender" a "MAN" o "WOMAN"
    const formattedGender = form.gender.toUpperCase() === 'MAN' ? 'MAN' : 'WOMAN';

    // Construir el objeto con los datos correctos según el rol
    const requestData: any = {
      username: form.username,
      password: form.password,
      role: role,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      telephone: form.telephone,
      gender: formattedGender,
      dateOfBirth: form.dateOfBirth,
      description: form.description,
      profilePicture: form.profilePicture,
    };

    // Agregar campos específicos para OWNER o STUDENT
    if (role === 'OWNER') {
      requestData.experienceYears = form.experienceYears || 0;
    } else if (role === 'STUDENT') {
      requestData.isSmoker = form.isSmoker;
      requestData.academicCareer = form.academicCareer;
      requestData.hobbies = form.hobbies;
    }

    // Enviar la solicitud al backend
    try {
      const response = await api.post('/users/auth/register', requestData);

      if (response.data.error) {
        Alert.alert('Error', response.data.error);
        return;
      }

      Alert.alert('Registro exitoso', 'Usuario registrado correctamente');
      router.push({
        pathname: '/welcome-screen',
        params: {
          name: form.firstName,
          role: role
        }
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error en el registro:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.error || 'No se pudo completar el registro.');
      } else if (error instanceof Error) {
        console.error('Error inesperado:', error.message);
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      } else {
        console.error('Error desconocido:', error);
        Alert.alert('Error', 'Error desconocido.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro - {role === 'STUDENT' ? 'Estudiante' : 'Propietario'}</Text>

      <TextInput style={styles.input} placeholder="Nombre de usuario" onChangeText={(value) => handleChange('username', value)} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry onChangeText={(value) => handleChange('password', value)} />
      <TextInput style={styles.input} placeholder="Nombre" onChangeText={(value) => handleChange('firstName', value)} />
      <TextInput style={styles.input} placeholder="Apellido" onChangeText={(value) => handleChange('lastName', value)} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" onChangeText={(value) => handleChange('email', value)} />
      <TextInput style={styles.input} placeholder="Teléfono" keyboardType="phone-pad" onChangeText={(value) => handleChange('telephone', value)} />
      <TextInput style={styles.input} placeholder="Género (MAN/WOMAN)" onChangeText={(value) => handleChange('gender', value)} />
      <TextInput style={styles.input} placeholder="Fecha de nacimiento (YYYY-MM-DD)" onChangeText={(value) => handleChange('dateOfBirth', value)} />
      <TextInput style={styles.input} placeholder="Descripción" onChangeText={(value) => handleChange('description', value)} />
      <TextInput style={styles.input} placeholder="URL de foto de perfil" onChangeText={(value) => handleChange('profilePicture', value)} />

      {role === 'STUDENT' && (
        <>
          <TextInput style={styles.input} placeholder="Carrera académica" onChangeText={(value) => handleChange('academicCareer', value)} />
          <TextInput style={styles.input} placeholder="Hobbies" onChangeText={(value) => handleChange('hobbies', value)} />
          <TextInput style={styles.input} placeholder="¿Es fumador? (true/false)" onChangeText={(value) => handleChange('isSmoker', (value === 'true').toString())} />
        </>
      )}

      {role === 'OWNER' && (
        <TextInput style={styles.input} placeholder="Años de experiencia" keyboardType="numeric" onChangeText={(value) => handleChange('experienceYears', (parseInt(value) || 0).toString())} />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#162A40',
    color: '#E0E1DD',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#415A77',
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
});
