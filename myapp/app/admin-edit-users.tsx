import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, Switch, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import storage from '../utils/storage';

export default function AdminEditUser() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<{
    lastName: string | undefined;
    firstName: string | undefined;
    dateOfBirth: string; username?: string; email?: string; telephone?: string 
}>({
  lastName: undefined,
  firstName: undefined,
  dateOfBirth: '',
  username: undefined,
  email: undefined,
  telephone: undefined,
});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  } 
  
  function formatToSpanish(dateStr: string): string {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data;
      userData.dateOfBirth = formatToSpanish(userData.dateOfBirth); 
      setUser(userData);
      setIsVerified(userData.isVerified);
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      Alert.alert('Error', 'No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  
    const showMessage = (title: string, message: string) => {
      if (Platform.OS === 'web') {
        alert(`${title}: ${message}`);
      } else {
        Alert.alert(title, message);
      }
    };


  const handleSave = async () => {
    setSaving(true);
    if (!user.username || !user.firstName || !user.lastName || !user.email || !user.telephone || !user.dateOfBirth) {
      showMessage('Error', 'Todos los campos obligatorios deben estar completos.');
      return;
    }

    if (user.username.length > 20) {
      showMessage('Error',`El nombre de usuario no puede superar los 50 caracteres`)
      return
    }

    if (user.firstName.length > 50) {
      showMessage('Error',`El primer nombre no puede tener más de 50 caracteres`)
      return
    }

    if (user.lastName.length > 50) {
      showMessage('Error',`El apellido no puede tener más de 50 caracteres`)
      return
    }
  
    const isOnlyLetters = (value: string) => {
      return /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value);
    };  

    if (!isOnlyLetters(user.firstName)) {
      showMessage('Error','El nombre solo debe contener letras');
      return;
    }
    
    if (!isOnlyLetters(user.lastName)) {
      showMessage('Error','El apellido solo debe contener letras');
      return;
    }
    
    if (!/^[A-Za-z0-9_]+$/.test(user.username)) {
      showMessage('Error','El nombre de usuario solo puede contener letras, números y guiones bajos');
      return;
    } 

      const isValidDate = (dateString: string): boolean => {
      const regex = /^\d{2}-\d{2}-\d{4}$/;
      if (!regex.test(dateString)) return false;

      const [day, month, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();

      const isOver18 =
      age > 18 || (age === 18 && (m > 0 || (m === 0 && today.getDate() >= day)));

      return (
      !isNaN(date.getTime()) &&
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year &&
      isOver18
      );
    };

    if (!isValidDate(user.dateOfBirth)) {
      showMessage('Error','La fecha debe tener userato DD-MM-YYYY y ser mayor de 18 años');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(user.email)) {
      showMessage('Error',"El correo electrónico no es válido")
      return
    }

    const telephonePattern = /^[0-9]{9}$/
    if (!telephonePattern.test(user.telephone)) {
      showMessage('Error',"El teléfono debe tener 9 numeros.")
      return
    }

    const userToSave = { ...user, dateOfBirth: convertToBackendFormat(user.dateOfBirth) };
    try {
      const token = await storage.getItem('jwt');
      await api.put(`/users/${id}`, userToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      router.back();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      Alert.alert('Error', 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  if (loading || !user) {
    return <ActivityIndicator style={{ marginTop: 50 }} color="#E0E1DD" size="large" />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Editar Usuario</Text>

          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            value={user.username}
            onChangeText={(text) => handleChange('username', text)}
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={user.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            value={user.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email || ''}
            onChangeText={(text) => handleChange('email', text)}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={user.telephone || ''}
            onChangeText={(text) => handleChange('telephone', text)}
          />

          <Text style={styles.label}>Fecha de nacimiento (DD-MM-YYYY)</Text>
          <TextInput
            style={styles.input}
            value={user.dateOfBirth || ''}
            onChangeText={(text) => handleChange('dateOfBirth', text)}
          />
          
          <Text style={styles.label}>Está verificado?</Text>
          <Switch
            value={isVerified}
            onValueChange={setIsVerified}
            trackColor={{ true: '#A8DADC', false: '#ccc' }}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              setSaving(true);
              handleSave().finally(() => setSaving(false));
            }}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: '#0D1B2A',
    padding: 20,
    paddingBottom: 40, // Añadir padding extra al final
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#E0E1DD',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1B263B',
    color: '#E0E1DD',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#A8DADC',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#0D1B2A',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
