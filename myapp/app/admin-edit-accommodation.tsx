import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import { ScrollView } from 'react-native';

export default function AdminEditAccommodation() {
  const { id } = useLocalSearchParams();
  const [accommodation, setAccommodation] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [pricePerDayInput, setPricePerDayInput] = useState('');
  const [pricePerMonthInput, setPricePerMonthInput] = useState('');
  const [studentsInput, setStudentsInput] = useState('');

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
    fetchAccommodation();
  }, []);

  const fetchAccommodation = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get(`/accommodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsVerified(response.data.isVerified);
      setPricePerDayInput(response.data.pricePerDay?.toString() || '');
      setPricePerMonthInput(response.data.pricePerMonth?.toString() || '');
      setStudentsInput(response.data.students?.toString() || '');
      const accommodationData = response.data;
      accommodationData.availability.startDate = formatToSpanish(accommodationData.availability.startDate);
      accommodationData.availability.endDate = formatToSpanish(accommodationData.availability.endDate);
      setAccommodation(response.data);
    } catch (error) {
      console.error('Error al cargar alojamiento:', error);
      Alert.alert('Error', 'No se pudo cargar el alojamiento');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (!accommodation.availability.startDate || !accommodation.availability.endDate || !pricePerDayInput || !pricePerMonthInput || !studentsInput) {
      showMessage('Error', 'Todos los campos obligatorios deben estar completos.');
      return;
    }
    if (accommodation.pricePerDay < 0) {
      showMessage('Error', `El precio por día de la alojamiento no puede ser negativo`);
      return;
    }

    if (accommodation.pricePerMonth < 0) {
      showMessage('Error', `El precio por mes de la alojamiento no puede ser negativo`);
      return;
    }
    if (accommodation.students < 0) {
      showMessage('Error', `El número de estudiantes no puede ser negativo`);
      return;
    }

    const isValidDate = (date: string) => /^\d{2}-\d{2}-\d{4}$/.test(date);

    if (!accommodation.availability.startDate || !accommodation.availability.endDate) {
      showMessage('Error','Debes introducir ambas fechas.');
      return;
    }

    if (!isValidDate(accommodation.availability.startDate) || !isValidDate(accommodation.availability.endDate)) {
      showMessage('Error','Formato de fecha inválido. Usa DD-MM-YYYY.');
      return;
    }

    const [startDay, startMonth, startYear] = accommodation.availability.startDate.split('-').map(Number);
    const [endDay, endMonth, endYear] = accommodation.availability.endDate.split('-').map(Number);

    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    if (start >= end) {
      showMessage('Error','La fecha de inicio debe ser anterior a la de fin.');
      return;
    }
    const parsedPricePerDay = parseFloat(pricePerDayInput);
    if (isNaN(parsedPricePerDay) || parsedPricePerDay < 0) {
      showMessage('Error', 'Introduce un precio válido mayor o igual a 0');
      setSaving(false);
      return;
    }
    const parsedPricePerMonth = parseFloat(pricePerMonthInput);
    if (isNaN(parsedPricePerMonth) || parsedPricePerMonth < 0) {
      showMessage('Error', 'Introduce un precio válido mayor o igual a 0');
      setSaving(false);
      return;
    }
    const parsedStudents = parseFloat(studentsInput);
    if (isNaN(parsedStudents) || parsedStudents < 0) {
      showMessage('Error', 'Introduce un número válido de estudiantes mayor o igual a 0');
      setSaving(false);
      return;
    }
    const accommodationToSave = {
      id: accommodation.id,
      description: accommodation.description,
      pricePerDay: parsedPricePerDay,
      pricePerMonth: parsedPricePerMonth,
      students: parsedStudents,
      startDate: convertToBackendFormat(accommodation.availability.startDate),
      endDate: convertToBackendFormat(accommodation.availability.endDate),
      isVerified: isVerified,
      rooms: accommodation.rooms,
      beds: accommodation.beds,
      latitud: accommodation.latitud,
      longitud: accommodation.longitud,
      wifi: accommodation.wifi,
      isEasyParking: accommodation.isEasyParking,
    };

    try {
      const token = localStorage.getItem('jwt');
      await api.put(`/accommodations/admin/${id}`, accommodationToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Éxito', 'Alojamiento actualizado correctamente');
      router.back();
    } catch (error) {
      console.error('Error al actualizar alojamiento:', error);
      Alert.alert('Error', 'No se pudo actualizar el alojamiento');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setAccommodation((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
  try {
    const token = localStorage.getItem('jwt');
    await api.delete(`/accommodations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Alert.alert('Alojamiento eliminado', 'El alojamiento ha sido eliminada correctamente.');
    router.back();
  } catch (error) {
    console.error('Error al eliminar el alojamiento:', error);
    Alert.alert('Error', 'No se pudo eliminar el alojamiento');
  }
};

  if (!accommodation) {
    return <ActivityIndicator style={{ marginTop: 50 }} color="#E0E1DD" size="large" />;
  }

  return (
  <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Alojamiento</Text>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        value={accommodation.description || ''}
        onChangeText={(text) => handleChange('description', text)}
      />

      <Text style={styles.label}>Precio por mes</Text>
      <TextInput
        style={styles.input}
        value={pricePerMonthInput}
        onChangeText={setPricePerMonthInput}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio por día</Text>
      <TextInput
        style={styles.input}
        value={pricePerDayInput}
        onChangeText={setPricePerDayInput}
        keyboardType="numeric"
      />      

      <Text style={styles.label}>Máximo estudiantes en este alojamiento</Text>
      <TextInput
        style={styles.input}
        value={studentsInput}
        onChangeText={setStudentsInput}
        keyboardType="numeric"
      />    

            <Text style={styles.label}>Fecha inicio disponibilidad (DD-MM-YYYY)</Text>
            <TextInput
              style={styles.input}
              value={accommodation.availability?.startDate || ''}
              onChangeText={(text) =>
                handleChange('availability', { ...accommodation.availability, startDate: text })
              }
            />
      
            <Text style={styles.label}>Fecha fin disponibilidad(DD-MM-YYYY)</Text>
            <TextInput
              style={styles.input}
              value={accommodation.availability?.endDate || ''}
              onChangeText={(text) =>
                handleChange('availability', { ...accommodation.availability, endDate: text })
              }
            />

      <Text style={styles.label}>¿Alojamiento verificado?</Text>
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
            const confirm = window.confirm('¿Estás seguro de que deseas eliminar este alojamiento?');
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
        <Text style={styles.deleteButtonText}>Eliminar alojamiento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1B2A',
    padding: 20,
    paddingBottom: 60,
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
