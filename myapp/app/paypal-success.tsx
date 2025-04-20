// app/paypal-success.tsx
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import api from './api';

export default function PaypalSuccessScreen() {
  const { id, startDate, endDate } = useLocalSearchParams();
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
    const finalizeBooking = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const bookingData = {
          stayRange: {
            startDate,
            endDate,
          }
        };

        await api.post(`/bookings/${id}`, bookingData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showSuccessMessage('Tu reserva ha sido completada correctamente.');
        setStatusMessage('Reserva completada correctamente. Redirigiendo...');
        setTimeout(() => router.replace(`/accommodation-details?id=${id}`), 2500);
      } catch (error) {
        console.error('Error al confirmar la reserva:', error);
        showFilterError('No se pudo confirmar la reserva. Contacta con soporte.');
        setTimeout(() => router.replace('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (id && startDate && endDate) {
      finalizeBooking();
    }
  }, [id, startDate, endDate]);

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
