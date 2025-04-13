import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
  es: {
    title: 'Crear una nueva cuenta',
    student: 'Estudiante',
    owner: 'Propietario',
    studentDesc: 'Soy estudiante y busco alojamiento',
    ownerDesc: 'Tengo un piso para alquilar',
    next: 'Siguiente',
    loginQuestion: '¿Ya tienes una cuenta?',
    loginHere: 'Inicia sesión aquí',
  },
  en: {
    title: 'Create a new account',
    student: 'Student',
    owner: 'Owner',
    studentDesc: 'I am a student looking for a room',
    ownerDesc: 'I have a flat to rent',
    next: 'Next',
    loginQuestion: 'Already have an account?',
    loginHere: 'Login here',
  },
});

i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  const fadeAnimStudent = useRef(new Animated.Value(0)).current;
  const fadeAnimOwner = useRef(new Animated.Value(0)).current;  

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnimStudent, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimOwner, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (selectedRole) {
      router.push({ pathname: '/register-form', params: { role: selectedRole } });
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('title')}</Text>

      <Animated.View
        style={[
          { width: '100%', marginBottom: 15 },
          {
            opacity: fadeAnimStudent,
            transform: [{ translateY: fadeAnimStudent.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.option, selectedRole === 'STUDENT' && styles.selected]}
          onPress={() => setSelectedRole('STUDENT')}
        >
          <Text style={styles.optionText}>{i18n.t('student')}</Text>
          <Text style={styles.optionDesc}>{i18n.t('studentDesc')}</Text>
        </TouchableOpacity>
      </Animated.View>


      <Animated.View
      style={[
        { width: '100%', marginBottom: 15 },
        {
          opacity: fadeAnimOwner,
          transform: [{ translateY: fadeAnimOwner.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.option, selectedRole === 'OWNER' && styles.selected]}
        onPress={() => setSelectedRole('OWNER')}
      >
        <Text style={styles.optionText}>{i18n.t('owner')}</Text>
        <Text style={styles.optionDesc}>{i18n.t('ownerDesc')}</Text>
      </TouchableOpacity>
    </Animated.View>


      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={!selectedRole}>
        <Text style={styles.buttonText}>{i18n.t('next')}</Text>
      </TouchableOpacity>

      <Text style={styles.loginText}>
        {i18n.t('loginQuestion')}{' '}
        <Text style={styles.link} onPress={handleLogin}>
          {i18n.t('loginHere')}
        </Text>
      </Text>
    </View>
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
    fontWeight: 'bold',
  },
  optionDesc: {
    fontSize: 13,
    color: '#AFC1D6',
    marginTop: 5,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
    opacity: 1,
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
