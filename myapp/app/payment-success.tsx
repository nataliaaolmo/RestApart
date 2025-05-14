import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import api from './api';
import { useSearchParams } from 'expo-router/build/hooks';

export default function PaypalSuccessScreen() {
  const router = useRouter();

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
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const orderId = params.get('token'); // PayPal te manda esto como token
  const id = params.get('id');
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');

  if (!orderId) {
    showFilterError('No se recibió el token del pago.');
    setLoading(false);
    return;
  }
  console.log(id, startDate, endDate);
    if (id && startDate && endDate) {
      finalizeBooking(orderId, id, startDate, endDate);
    }
  }, []);

const finalizeBooking = async (orderId: string, id: string, startDate: string, endDate: string) => {
  try {
    const jwt = localStorage.getItem('jwt');
    console.log("Confirmando pago con", { orderId, id, startDate, endDate });

    await api.post('/payments/paypal/confirm', null, {
      params: {
        orderId,
        accommodationId: id,
        startDate,
        endDate,
      },
      headers: { Authorization: `Bearer ${jwt}` },
    });

    showSuccessMessage('Tu reserva ha sido completada correctamente.');
    setStatusMessage('Reserva completada correctamente. Redirigiendo...');
    setTimeout(() => router.replace(`/welcome-screen`), 2500);
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
