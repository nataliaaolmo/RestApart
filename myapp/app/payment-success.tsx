import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import api from './api';
import { useSearchParams } from 'expo-router/build/hooks';
import storage from '../utils/storage';

export default function PaypalSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [statusMessage, setStatusMessage] = useState('');
  const [filterError, setFilterError] = useState('');
  const [loading, setLoading] = useState(true);

  const showFilterError = (msg: string) => {
    if (Platform.OS === 'web') {
      setFilterError(msg);
    } else {
      // @ts-ignore
      import('react-native').then(({ Alert }) => Alert.alert('Error', msg));
    }
  };

  const showSuccessMessage = (msg: string) => {
    if (Platform.OS === 'web') {
      setStatusMessage(msg);
    } else {
      // @ts-ignore
      import('react-native').then(({ Alert }) => Alert.alert('Reserva confirmada', msg));
    }
  };

  useEffect(() => {
    // Función para obtener los parámetros de forma compatible con web y nativo
    const getParams = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        return {
          token: searchParams.get('token'),
          id: searchParams.get('id'),
          startDate: searchParams.get('startDate'),
          endDate: searchParams.get('endDate'),
        };
      } else {
        // En nativo usamos los params que vienen de expo-router
        return {
          token: params.token as string,
          id: params.id as string,
          startDate: params.startDate as string,
          endDate: params.endDate as string,
        };
      }
    };

    const urlParams = getParams();
    const { token: orderId, id, startDate, endDate } = urlParams;

  if (!orderId) {
    showFilterError('No se recibió el token del pago.');
    setLoading(false);
    return;
  }
  console.log(id, startDate, endDate);
    if (id && startDate && endDate) {
      finalizeBooking(orderId as string, id as string, startDate as string, endDate as string);
    } else {
      showFilterError('Faltan parámetros necesarios para completar la reserva.');
      setLoading(false);
    }
  }, []);

const finalizeBooking = async (orderId: string, id: string, startDate: string, endDate: string) => {
  try {
    console.log("Confirmando pago con", { orderId, id, startDate, endDate });

    await api.post('/payments/paypal/confirm', null, {
      params: {
        orderId,
        accommodationId: id,
        startDate,
        endDate,
        }
    });

    showSuccessMessage('Tu reserva ha sido completada correctamente.');
    setStatusMessage('Reserva completada correctamente. Redirigiendo...');
      setTimeout(() => router.replace('/(tabs)/welcome-screen'), 2500);
  } catch (error: any) {
    console.error('Error al confirmar la reserva:', error);
    if (error?.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    showFilterError('No se pudo confirmar la reserva. Contacta con soporte.');
    setTimeout(() => router.replace('/'), 3000);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      {loading && (
        <>
          <ActivityIndicator size="large" color="#A8DADC" />
          <Text style={styles.loadingText}>Confirmando reserva...</Text>
        </>
      )}

    {filterError !== '' && (
        <>
          <Text style={styles.errorText}>{filterError}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </>
      )}

      {statusMessage !== '' && (
        <Text style={styles.successText}>{statusMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#E0E1DD',
    marginTop: 20,
    fontSize: 16,
  },
  successText: {
    color: '#A8DADC',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#A8DADC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
