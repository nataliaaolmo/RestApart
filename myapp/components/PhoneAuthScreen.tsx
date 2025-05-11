import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, Text, Platform } from 'react-native';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { app } from './firebaseConfig'; 
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const PhoneAuthScreen = () => {
  const auth = getAuth(app);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const recaptchaContainerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha resuelto');
          },
        }
      );
    }
  }, []);

  const handleSendCode = async () => {
    try {
      const verifier = Platform.OS === 'web'
        ? window.recaptchaVerifier
        : undefined; // En móvil puedes usar expo-firebase-recaptcha si lo necesitas

      const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(confirmationResult);
    } catch (error) {
      console.error('Error enviando SMS:', error);
    }
  };

  const handleConfirmCode = async () => {
    try {
      if (confirmation) {
        await confirmation.confirm(code);
        alert('Teléfono verificado correctamente');

        // Aquí haces la petición al backend:
        // await api.patch(`/users/${userId}/verify-phone`);
      }
    } catch (error) {
      console.error('Error al confirmar código:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Introduce tu número de teléfono:</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="+34..." style={{ marginVertical: 10 }} />
      <Button title="Enviar código" onPress={handleSendCode} />
      <TextInput value={code} onChangeText={setCode} placeholder="Código recibido" style={{ marginVertical: 10 }} />
      <Button title="Verificar código" onPress={handleConfirmCode} />

      {Platform.OS === 'web' && (
        <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      )}
    </View>
  );
};

export default PhoneAuthScreen;
