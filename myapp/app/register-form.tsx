import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../components/firebaseConfig'; 

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

  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }  

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

    const handleChange = (name: string, value: string | boolean) => {
      setForm({ ...form, [name]: value });
    };

    const handlePhoneVerification = async () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, '+34' + form.telephone, appVerifier);
      const code = prompt('Introduce el código SMS recibido');
      if (code) {
        await confirmation.confirm(code);
        setIsPhoneVerified(true);
        showMessage('Éxito', 'Teléfono verificado correctamente');
      }

    } catch (error) {
      console.error('Error verificando teléfono:', error);
      showMessage('Error', 'No se pudo verificar el número');
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(''); 
    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.email || !form.telephone || !form.dateOfBirth) {
      showMessage('Error', 'Todos los campos obligatorios deben estar completos.');
      return;
    }

    if (form.username.length > 20) {
      showMessage('Error',`El nombre de usuario no puede superar los 50 caracteres`)
      return
    }

    if (form.firstName.length > 50) {
      showMessage('Error',`El primer nombre no puede tener más de 50 caracteres`)
      return
    }

    if (form.password.length < 8) {
      showMessage('Error',`La contraseña debe tener al menos 8 caracteres`)
      return
    }

    if (form.lastName.length > 50) {
      showMessage('Error',`El apellido no puede tener más de 50 caracteres`)
      return
    }
  
    const isOnlyLetters = (value: string) => {
      return /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value);
    };  

    if (!isOnlyLetters(form.firstName)) {
      showMessage('Error','El nombre solo debe contener letras');
      return;
    }
    
    if (!isOnlyLetters(form.lastName)) {
      showMessage('Error','El apellido solo debe contener letras');
      return;
    }
    
    if (!/^[A-Za-z0-9_]+$/.test(form.username)) {
      showMessage('Error','El nombre de usuario solo puede contener letras, números y guiones bajos');
      return;
    }  

    if (!acceptedTerms) {
      showMessage('Error','Debes aceptar los términos y condiciones para continuar');
      return;
    }

    if (!isPhoneVerified) {
      showMessage('Recomendación', 'Se recomienda verificar tu teléfono para generar más confianza.');
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

    if (!isValidDate(form.dateOfBirth)) {
      showMessage('Error','La fecha debe tener formato DD-MM-YYYY y ser mayor de 18 años');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email)) {
      showMessage('Error',"El correo electrónico no es válido")
      return
    }

    const telephonePattern = /^[0-9]{9}$/
    if (!telephonePattern.test(form.telephone)) {
      showMessage('Error',"El teléfono debe tener 9 numeros.")
      return
    }

    const requestData: any = {
      username: form.username,
      password: form.password,
      role: role,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      telephone: form.telephone,
      gender: form.gender,
      dateOfBirth: convertToBackendFormat(form.dateOfBirth),
      description: form.description,
      profilePicture: form.profilePicture,
      isVerified: isPhoneVerified,
    };

    if (role === 'OWNER') {
      requestData.experienceYears = form.experienceYears || 0;
    } else if (role === 'STUDENT') {
      requestData.isSmoker = form.isSmoker;
      requestData.academicCareer = form.academicCareer;
      requestData.hobbies = form.hobbies;
    }

    console.log('Request Data:', requestData);

    try {
      const response = await api.post('/users/auth/register', requestData);
      console.log('Response:', response.data);
      if (response.data.error && response.data.error !== '') {
        showMessage('Error',response.data.error);
        return;
      }

      if (Platform.OS === 'web') {
        setErrorMessage('');
      } else {
        showMessage('Registro exitoso', 'Usuario registrado correctamente');
      }

      const loginResponse = await api.post('/users/auth/login', {
        username: form.username,
        password: form.password
      });
      
      const jwt = loginResponse.data.token;
      localStorage.setItem('jwt', jwt);

      router.push({
        pathname: '/(tabs)/welcome-screen',
        params: {
          name: form.firstName,
          role: role,
        },
      });

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
    
        if (typeof errorData === 'string') {
          if (errorData.includes('username')) {
            setErrorMessage('El nombre de usuario ya está en uso.');
          } else if (errorData.includes('correo') || errorData.includes('email')) {
            setErrorMessage('El correo electrónico ya está registrado.');
          } else if (errorData.includes('teléfono')) {
            setErrorMessage('El teléfono ya está en uso.');
          } else {
            setErrorMessage(errorData); 
          }
    
        } else if (Array.isArray(errorData.errors)) {
          const formattedErrors = errorData.errors.map((err: any) => `• ${err}`).join('\n');
          setErrorMessage(formattedErrors);
        } else if (typeof errorData.error === 'string') {
          setErrorMessage(errorData.error);
        } else {
          setErrorMessage('Error desconocido del servidor.');
        }
      }
    }
    
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro - {role === 'STUDENT' ? 'Estudiante' : 'Propietario'}</Text>

      {Platform.OS === 'web' && errorMessage !== '' && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
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
      <View style={styles.inputWrapper}>
        <Icon name="transgender" size={20} color="#E0E1DD" style={styles.inputIcon} />
        {Platform.OS === 'web' ? (
          <select
            value={form.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            style={{
              flex: 1,
              backgroundColor: '#162A40',
              color: '#E0E1DD',
              borderWidth: 0,
              fontSize: 16,
              padding: 12,
              borderRadius: 5,
            }}
          >
            <option value="">Selecciona tu género</option>
            <option value="MAN">Hombre</option>
            <option value="WOMAN">Mujer</option>
            <option value="OTHER">Otro</option>
          </select> 
        ) : (
          <Picker
            selectedValue={form.gender}
            onValueChange={(value) => handleChange('gender', value)}
            style={styles.picker}
            dropdownIconColor="#E0E1DD"
          >
            <Picker.Item label="Selecciona tu género" value="" />
            <Picker.Item label="Hombre" value="MAN" />
            <Picker.Item label="Mujer" value="WOMAN" />
            <Picker.Item label="Otro" value="OTHER" />
          </Picker>
        )}
      </View>

      <CustomInput
        icon="calendar"
        placeholder="Fecha de nacimiento (DD-MM-YYYY)*"
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
          <View style={styles.switchWrapper}>
            <Icon name="fire" size={20} color="#E0E1DD" style={{ marginRight: 10 }} />
            <Text style={styles.switchLabel}>¿Eres fumador?</Text>
            <Switch
              value={form.isSmoker}
              onValueChange={(val) => handleChange('isSmoker', val)}
              thumbColor={form.isSmoker ? '#E0E1DD' : '#ccc'}
              trackColor={{ false: '#415A77', true: '#E0E1DD' }}
            />
          </View>
        </>
      )}

      {role === 'OWNER' && (
        <>
          <Text style={styles.section}>Detalles académicos / profesionales</Text>
          <CustomInput icon="briefcase" placeholder="Años de experiencia*" keyboardType="numeric" onChangeText={(v: string) => handleChange('experienceYears', v)} />
        </>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1B9AAA' }]}
        onPress={handlePhoneVerification}
      >
        <Text style={styles.buttonText}>Verificar número por SMS</Text>
      </TouchableOpacity>

      {Platform.OS === 'web' && <div id="recaptcha-container" />}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Switch
          value={acceptedTerms}
          onValueChange={setAcceptedTerms}
          trackColor={{ true: '#A8DADC', false: '#ccc' }}
        />
        <Text style={{ color: '#E0E1DD', marginLeft: 10 }}>
          Acepto los{' '}
          <Text
            style={{ textDecorationLine: 'underline' }}
            onPress={() => window.open('/terminos-condiciones.pdf', '_blank')}
          >
            Términos y Condiciones
          </Text>
        </Text>
      </View>

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
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    flex: 1,
    color: '#E0E1DD',
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162A40',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  errorText: {
    color: 'tomato',
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162A40',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  picker: {
    flex: 1,
    color: '#E0E1DD',
  },
  selectWeb: {
    flex: 1,
    backgroundColor: '#162A40',
    color: '#E0E1DD',
    borderWidth: 0,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
    ...(Platform.OS === 'web' ? { appearance: 'none' } : {}),
  },
});
