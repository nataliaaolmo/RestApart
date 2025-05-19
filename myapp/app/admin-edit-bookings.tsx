import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import storage from '../utils/storage';

export default function AdminEditBooking() {
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [priceInput, setPriceInput] = useState('');

      const showMessage = (title: string, message: string) => {
        if (Platform.OS === 'web') {
          alert(`${title}: ${message}`);
        } else {
          Alert.alert(title, message);
        }
      };

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
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get(`/bookings/${id}/get-booking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingData= response.data;
      bookingData.stayRange.startDate = formatToSpanish(bookingData.stayRange.startDate);
      bookingData.stayRange.endDate = formatToSpanish(bookingData.stayRange.endDate);
      setBooking(bookingData);
      setIsVerified(response.data.isVerified);
      setPriceInput(bookingData.price?.toString() || '');
    } catch (error) {
      console.error('Error al cargar la reserva:', error);
      Alert.alert('Error', 'No se pudo cargar la reserva');
    }
  };

  const handleSave = async () => {
    setSaving(true);

    if (!booking.stayRange.startDate || !booking.stayRange.endDate || !booking.price) {
      showMessage('Error', 'Todos los campos obligatorios deben estar completos.');
      return;
    }
    if (booking.price < 0) {
      showMessage('Error', `El precio de la reserva no puede ser negativo`);
      return;
    }

    const isValidDate = (date: string) => /^\d{2}-\d{2}-\d{4}$/.test(date);

    if (!booking.stayRange.startDate || !booking.stayRange.endDate) {
      showMessage('Error','Debes introducir ambas fechas.');
      return;
    }

    if (!isValidDate(booking.stayRange.startDate) || !isValidDate(booking.stayRange.endDate)) {
      showMessage('Error','Formato de fecha inválido. Usa DD-MM-YYYY.');
      return;
    }

    const [startDay, startMonth, startYear] = booking.stayRange.startDate.split('-').map(Number);
    const [endDay, endMonth, endYear] = booking.stayRange.endDate.split('-').map(Number);

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    if (start >= end) {
      showMessage('Error','La fecha de inicio debe ser anterior a la de fin.');
      return;
    }
    const parsedPrice = parseFloat(priceInput);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      showMessage('Error', 'Introduce un precio válido mayor o igual a 0');
      setSaving(false);
      return;
    }

    const bookingToSave = {
      id: booking.id,
      studentId: booking.student?.id || 0,
      accommodationId: booking.accommodation?.id || 0,
      bookingDate: booking.bookingDate, 
      price: parsedPrice,
      startDate: convertToBackendFormat(booking.stayRange.startDate),
      endDate: convertToBackendFormat(booking.stayRange.endDate),
      isVerified: isVerified
    };

    try {
      const token = await storage.getItem('jwt');
      await api.put(`/bookings/${id}`, bookingToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Éxito', 'Reserva actualizada correctamente');
      router.back();
    } catch (error) {
      console.error('Error al actualizar la reserva:', error);
      Alert.alert('Error', 'No se pudo actualizar la reserva');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
  try {
    const token = await storage.getItem('jwt');
    await api.delete(`/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Alert.alert('Reserva eliminada', 'La reserva ha sido eliminada correctamente.');
    router.back();
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    Alert.alert('Error', 'No se pudo eliminar la reserva');
  }
};

  const handleChange = (field: string, value: number | boolean) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  };

  if (!booking) {
    return <ActivityIndicator style={{ marginTop: 50 }} color="#E0E1DD" size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Reserva</Text>

      <Text style={styles.label}>Fecha inicio (DD-MM-YYYY)</Text>
      <TextInput
        style={styles.input}
        value={booking.stayRange?.startDate || ''}
        onChangeText={(text) =>
          handleChange('stayRange', { ...booking.stayRange, startDate: text })
        }
      />

      <Text style={styles.label}>Fecha fin (DD-MM-YYYY)</Text>
      <TextInput
        style={styles.input}
        value={booking.stayRange?.endDate || ''}
        onChangeText={(text) =>
          handleChange('stayRange', { ...booking.stayRange, endDate: text })
        }
      />

    <Text style={styles.label}>Precio</Text>
    <TextInput
      style={styles.input}
      value={priceInput}
      onChangeText={setPriceInput}
      keyboardType="numeric"
    />

      <Text style={styles.label}>¿Reserva verificada?</Text>
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

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          if (Platform.OS === 'web') {
            const confirm = window.confirm('¿Estás seguro de que deseas eliminar esta reserva?');
            if (confirm) handleDelete();
          } else {
            Alert.alert(
              'Confirmar eliminación',
              '¿Estás seguro de que deseas eliminar esta reserva?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: handleDelete },
              ]
            );
          }
        }}
      >
        <Text style={styles.deleteButtonText}>Eliminar reserva</Text>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1B2A',
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#AFC1D6',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#E0E1DD',
    padding: 10,
    borderRadius: 8,
    color: '#0D1B2A',
  },
  saveButton: {
    backgroundColor: '#E0E1DD',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
  backgroundColor: '#e63946',
  padding: 15,
  borderRadius: 10,
  marginTop: 15,
},
deleteButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
},
});
