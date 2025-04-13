import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function RegisterFormScreen() {
  const { role } = useLocalSearchParams();
  const router = useRouter();
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

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.email || !form.telephone || !form.gender || !form.dateOfBirth) {
      Alert.alert('Error', 'Todos los campos obligatorios deben estar completos.');
      return;
    }

    const formattedGender = form.gender.toUpperCase() === 'MAN' ? 'MAN' : 'WOMAN';

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

    if (role === 'OWNER') {
      requestData.experienceYears = form.experienceYears || 0;
    } else if (role === 'STUDENT') {
      requestData.isSmoker = form.isSmoker;
      requestData.academicCareer = form.academicCareer;
      requestData.hobbies = form.hobbies;
    }

    try {
      const response = await api.post('/users/auth/register', requestData);

      if (response.data.error) {
        Alert.alert('Error', response.data.error);
        return;
      }

      Alert.alert('Registro exitoso', 'Usuario registrado correctamente');
      router.push({
        pathname: '/(tabs)/welcome-screen',
        params: {
          name: form.firstName,
          role: role,
        },
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.error || 'No se pudo completar el registro.');
      } else {
        Alert.alert('Error', 'Error desconocido.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro - {role === 'STUDENT' ? 'Estudiante' : 'Propietario'}</Text>

      <TouchableOpacity style={styles.avatarContainer}>
        <Image
          source={{ uri: form.profilePicture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
          style={styles.avatar}
        />
        <Text style={styles.avatarText}>Foto de perfil</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Datos personales</Text>
      <CustomInput
        icon="user"
        placeholder="Nombre *"
        onChangeText={(v: string) => handleChange('firstName', v)}
      />
      <CustomInput
        icon="user"
        placeholder="Apellido *"
        onChangeText={(v: string) => handleChange('lastName', v)}
      />
      <CustomInput
        icon="transgender"
        placeholder="Género (MAN/WOMAN) *"
        onChangeText={(v: string) => handleChange('gender', v)}
      />
      <CustomInput
        icon="calendar"
        placeholder="Fecha de nacimiento (YYYY-MM-DD) *"
        onChangeText={(v: string) => handleChange('dateOfBirth', v)}
      />

      <Text style={styles.section}>Información de contacto</Text>
      <CustomInput 
        icon="envelope" 
        placeholder="Email *" 
        keyboardType="email-address" 
        onChangeText={(v: string) => handleChange('email', v)} 
      />
      <CustomInput 
        icon="phone" 
        placeholder="Teléfono *" 
        keyboardType="phone-pad" 
        onChangeText={(v: string) => handleChange('telephone', v)} 
      />

      <Text style={styles.section}>Sobre ti</Text>
      <CustomInput
        icon="user-circle"
        placeholder="Nombre de usuario *"
        onChangeText={(v: string) => handleChange('username', v)}
      />
      <CustomInput
        icon="lock"
        placeholder="Contraseña *"
        secureTextEntry
        onChangeText={(v: string) => handleChange('password', v)}
      />
      <CustomInput
        icon="info-circle"
        placeholder="Descripción"
        onChangeText={(v: string) => handleChange('description', v)}
      />
      <CustomInput
        icon="image"
        placeholder="URL de foto de perfil"
        onChangeText={(v: string) => handleChange('profilePicture', v)}
      />

      {role === 'STUDENT' && (
        <>
          <Text style={styles.section}>Detalles académicos / profesionales</Text>
          <CustomInput
            icon="graduation-cap"
            placeholder="Carrera académica"
            onChangeText={(v: string) => handleChange('academicCareer', v)}
          />
          <CustomInput
            icon="smile-o"
            placeholder="Aficiones"
            onChangeText={(v: string) => handleChange('hobbies', v)}
          />
          <CustomInput
            icon="fire"
            placeholder="¿Es fumador? (true/false)"
            onChangeText={(v: string) => handleChange('isSmoker', v === 'true' ? 'true' : 'false')}
          />
        </>
      )}

      {role === 'OWNER' && (
        <>
          <Text style={styles.section}>Detalles académicos / profesionales</Text>
          <CustomInput icon="briefcase" placeholder="Años de experiencia" keyboardType="numeric" onChangeText={(v: string) => handleChange('experienceYears', v)} />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const CustomInput = ({ icon, ...props }: any) => (
  <View style={styles.inputWrapper}>
    <Icon name={icon} size={20} color="#E0E1DD" style={styles.inputIcon} />
    <TextInput style={styles.input} placeholderTextColor="#A0AEC0" {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0D1B2A',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    color: '#E0E1DD',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162A40',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#E0E1DD',
  },
  button: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B2A',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#A0AEC0',
    fontSize: 15,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#E0E1DD',
    marginBottom: 10,
  },
  avatarText: {
    color: '#E0E1DD',
    fontWeight: '600',
  },
});
