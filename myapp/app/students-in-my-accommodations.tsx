import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import api from '../app/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import storage from '../utils/storage';

export default function StudentsInMyAccommodations() {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [studentMap, setStudentMap] = useState<Record<number, any[]>>({});
  const [bookingMap, setBookingMap] = useState<Record<number, Record<number, { startDate: string; endDate: string }>>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [filterError, setFilterError] = useState('');

  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }

  function toBackendFormatIfNeeded(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const [dd, mm, yyyy] = date.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const token = await storage.getItem('jwt');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const res = await api.get('/accommodations/owner-accomodations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data)) {
        setAccommodations(res.data);
        // Esperar a que se complete la carga de estudiantes antes de continuar
        await Promise.all(res.data.map(acc => fetchStudents(acc)));
      } else {
        console.error('Formato de respuesta inválido:', res.data);
      }
    } catch (err) {
      console.error('Error al obtener alojamientos del owner:', err);
    }
  };

  const fetchStudents = async (accommodation: any) => {
    try {
      const token = await storage.getItem('jwt');
      if (!token) {
        console.error('No hay token de autenticación');
        Alert.alert('Error', 'No hay sesión activa. Por favor, inicia sesión de nuevo.');
        router.push('/login');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const start = startDate ? convertToBackendFormat(startDate) : today;
      const end = endDate ? convertToBackendFormat(endDate) : '2100-01-01';
      const url = `/accommodations/${accommodation.id}/students`;
      const res = await api.get(url, {
        params: {
          startDate: toBackendFormatIfNeeded(start),
          endDate: toBackendFormatIfNeeded(end)
        },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.data && Array.isArray(res.data)) {
        setStudentMap(prev => ({ ...prev, [accommodation.id]: res.data }));

        const newBookingMap: Record<number, { startDate: string; endDate: string }> = {};
        await Promise.all(
          res.data.map(async (student: any) => {
            try {
              const bookingRes = await api.get(`/bookings/${student.id}`, {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
              });
              const bookings = bookingRes.data;
              const matchingBooking = bookings.find((b: any) => b.accommodationId === accommodation.id);
              if (matchingBooking && matchingBooking.startDate && matchingBooking.endDate) {
                newBookingMap[student.id] = {
                  startDate: matchingBooking.startDate,
                  endDate: matchingBooking.endDate,
                };
              }
            } catch (err) {
              console.error(`Error al obtener booking para estudiante ${student.id}:`, err);
            }
          })
        );
        setBookingMap(prev => ({ ...prev, [accommodation.id]: newBookingMap }));
      } else {
        console.error('Formato de respuesta inválido para estudiantes:', res.data);
        Alert.alert('Error', 'No se pudieron cargar los estudiantes. Por favor, inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error(`Error al obtener estudiantes del alojamiento ${accommodation.id}:`, err);
      if (err.response) {
        switch (err.response.status) {
          case 401:
          case 403:
            Alert.alert('Error', 'No tienes permisos para ver los estudiantes de este alojamiento');
            break;
          case 404:
            Alert.alert('Error', 'El alojamiento no existe');
            break;
          default:
            Alert.alert('Error', 'No se pudieron cargar los estudiantes. Por favor, inténtalo de nuevo.');
        }
      } else {
        Alert.alert('Error', 'No se pudieron cargar los estudiantes. Por favor, inténtalo de nuevo.');
      }
      // Inicializar con array vacío en caso de error
      setStudentMap(prev => ({ ...prev, [accommodation.id]: [] }));
      setBookingMap(prev => ({ ...prev, [accommodation.id]: {} }));
    }
  };

  const registerStudentWithoutAccount = async () => {
    // Validaciones de campos requeridos
    if (!selectedAccommodationId || !startDate || !endDate || !firstName || !lastName) {
      if (Platform.OS === 'web') {
        setFilterError('Por favor, rellena todos los campos obligatorios.');
      } else {
        Alert.alert('Error', 'Por favor, rellena todos los campos obligatorios.');
      }
      return;
    }

    // Validar formato de fechas
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      if (Platform.OS === 'web') {
        setFilterError('El formato de las fechas debe ser DD-MM-YYYY');
      } else {
        Alert.alert('Error', 'El formato de las fechas debe ser DD-MM-YYYY');
      }
      return;
    }

    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    const startDateObj = new Date(convertToBackendFormat(startDate));
    const endDateObj = new Date(convertToBackendFormat(endDate));
    if (startDateObj >= endDateObj) {
      if (Platform.OS === 'web') {
        setFilterError('La fecha de inicio debe ser anterior a la fecha de fin');
      } else {
        Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
      }
      return;
    }

    try {
      const token = await storage.getItem('jwt');

      // Verificar disponibilidad antes de proceder
      try {
        const checkAvailabilityResponse = await api.get(
          `/accommodations/${selectedAccommodationId}/check-availability`,
          {
            params: {
              startDate: convertToBackendFormat(startDate),
              endDate: convertToBackendFormat(endDate)
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!checkAvailabilityResponse.data) {
          if (Platform.OS === 'web') {
            setFilterError('El alojamiento no está disponible para las fechas seleccionadas. Por favor, elige otras fechas.');
          } else {
            Alert.alert(
              'No disponible',
              'El alojamiento no está disponible para las fechas seleccionadas. Por favor, elige otras fechas.'
            );
          }
          return;
        }
      } catch (availabilityError: any) {
        console.error('Error al verificar disponibilidad:', availabilityError);
        if (Platform.OS === 'web') {
          setFilterError('No se pudo verificar la disponibilidad del alojamiento. Por favor, inténtalo de nuevo.');
        } else {
          Alert.alert(
            'Error',
            'No se pudo verificar la disponibilidad del alojamiento. Por favor, inténtalo de nuevo.'
          );
        }
        return;
      }

      // Registrar el estudiante
      const registerResponse = await api.post(
        '/users/auth/register-without-account',
        {
          firstName,
          lastName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newStudentId = registerResponse.data.user.studentId;

      // Crear la reserva
      await api.post(
        `/bookings/${selectedAccommodationId}/${newStudentId}/register-without-account`,
        {
          stayRange: {
            startDate: convertToBackendFormat(startDate),
            endDate: convertToBackendFormat(endDate),
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatusMessage('Estudiante registrado correctamente.');
      setModalVisible(false);
      setFilterError('');
      fetchAccommodations();

      // Limpiar el formulario
      setFirstName('');
      setLastName('');
      setPhoto('');
      setSelectedAccommodationId(null);
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      console.error('Error al registrar estudiante sin cuenta:', err);
      let errorMessage = 'No se pudo registrar el estudiante.';
      
      if (err.response) {
        switch (err.response.status) {
          case 409:
            errorMessage = 'El alojamiento ya está ocupado para las fechas seleccionadas.';
            break;
          case 400:
            errorMessage = err.response.data.message || 'Datos de registro inválidos.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'El alojamiento no existe o no está disponible.';
            break;
          default:
            errorMessage = 'Error al procesar la solicitud. Por favor, inténtalo de nuevo.';
        }
      }
      
      if (Platform.OS === 'web') {
        setFilterError(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const applyDateFilter = () => {
    setStudentMap({});
    setBookingMap({});
    setTotalStudents(0);
    accommodations.forEach((acc) => fetchStudents(acc));
  };

  useEffect(() => {
    let total = 0;
    Object.values(studentMap).forEach((arr) => (total += arr.length));
    setTotalStudents(total);
  }, [studentMap]);

  const renderAccommodation = ({ item }: { item: any }) => {
    const students = studentMap[item.id] || [];
    const bookingsForAcc = bookingMap[item.id] || {};
    const title = item.advertisement?.title || 'Sin título';
    const images = item.images?.length > 0 ? item.images : ['default.jpg'];

    return (
      <View style={styles.card}>
        <Image source={{ uri: `https://restapart.onrender.com/images/${images[0]}` }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        {students.length > 0 ? (
          students.map((student, idx) => (
            <View key={idx} style={styles.studentRow}>
              <Image
                source={{ uri: `https://restapart.onrender.com/images/${student.photo || 'default.jpg'}` }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>
                  {student.firstName} {student.lastName}
                </Text>
                {bookingsForAcc[student.id] ? (
                  <Text style={styles.stayDates}>
                    {bookingsForAcc[student.id].startDate} → {bookingsForAcc[student.id].endDate}
                  </Text>
                ) : (
                  <Text style={styles.stayDates}>Fechas no disponibles</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/profile', params: { id: student.userId } })}
              >
                <Ionicons name="person-circle-outline" size={26} color="#AFC1D6" />
              </TouchableOpacity>
              {!!student.username && (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/private-chat', params: { id: student.id } })}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#AFC1D6" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noStudents}>No hay estudiantes alojados.</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Estudiantes en mis alojamientos</Text>
        <View style={styles.filterContainer}>
          <TextInput
            placeholder="Fecha inicio (DD-MM-YYYY)"
            placeholderTextColor="#AFC1D6"
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate} />
          <TextInput
            placeholder="Fecha fin (DD-MM-YYYY)"
            placeholderTextColor="#AFC1D6"
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate} />
          <TouchableOpacity style={styles.filterButton} onPress={applyDateFilter}>
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.totalText}>Total estudiantes alojados: {totalStudents}</Text>

        {statusMessage !== '' && (
          <Text style={styles.successMessage}>{statusMessage}</Text>
        )}

        <View style={styles.accommodationsContainer}>
          <FlatList
            data={accommodations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAccommodation}
            contentContainerStyle={styles.accommodationsList}
            numColumns={Platform.OS === 'web' ? 2 : 1}
            columnWrapperStyle={Platform.OS === 'web' ? styles.columnWrapper : undefined}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>➕ Añadir nuevo estudiante a alojamiento</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: '#1B263B' }]}>
            <Text style={[styles.modalTitle, { color: '#E0E1DD' }]}>Añadir nuevo estudiante</Text>
            
            {filterError !== '' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{filterError}</Text>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: '#E0E1DD' }]}>Alojamiento</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: '#162A40',
                borderColor: '#415A77',
                borderWidth: 1,
                borderRadius: 8,
                padding: 0,
                marginBottom: 0
              }]}>
                <Picker
                  selectedValue={selectedAccommodationId}
                  onValueChange={(value) => setSelectedAccommodationId(value)}
                  style={[styles.picker, { 
                    color: '#E0E1DD',
                    backgroundColor: '#162A40',
                    height: 50,
                    width: '100%'
                  }]}
                  dropdownIconColor="#E0E1DD"
                >
                  <Picker.Item 
                    label="Selecciona un alojamiento" 
                    value={null} 
                    color="#AFC1D6"
                  />
                  {accommodations.map((acc) => (
                    <Picker.Item
                      key={acc.id}
                      label={acc.advertisement?.title || 'Sin título'}
                      value={acc.id}
                      color="#E0E1DD"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: '#E0E1DD' }]}>Nombre</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: '#162A40', color: '#E0E1DD' }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Nombre del estudiante"
                placeholderTextColor="#AFC1D6"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: '#E0E1DD' }]}>Apellidos</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: '#162A40', color: '#E0E1DD' }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Apellidos del estudiante"
                placeholderTextColor="#AFC1D6"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: '#E0E1DD' }]}>Fecha de inicio</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: '#162A40', color: '#E0E1DD' }]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#AFC1D6"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: '#E0E1DD' }]}>Fecha de fin</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: '#162A40', color: '#E0E1DD' }]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#AFC1D6"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setFilterError('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={registerStudentWithoutAccount}
              >
                <Text style={styles.modalButtonText}>Añadir estudiante</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E1DD',
    textAlign: 'center',
    marginVertical: 20,
  },
  filterContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  input: {
    backgroundColor: '#1B263B',
    color: '#E0E1DD',
    padding: 12,
    borderRadius: 8,
    width: Platform.OS === 'web' ? '30%' : '100%',
    borderWidth: 1,
    borderColor: '#415A77',
  },
  filterButton: {
    backgroundColor: '#415A77',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
  },
  totalText: {
    color: '#E0E1DD',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  successMessage: {
    color: '#90EE90',
    textAlign: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(144, 238, 144, 0.1)',
    borderRadius: 8,
  },
  accommodationsContainer: {
    flex: 1,
  },
  accommodationsList: {
    padding: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 20,
  },
  card: {
    backgroundColor: '#1B263B',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    width: Platform.OS === 'web' ? '48%' : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 15,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#162A40',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  studentName: {
    color: '#E0E1DD',
    fontSize: 16,
    fontWeight: '500',
  },
  stayDates: {
    color: '#AFC1D6',
    fontSize: 14,
  },
  noStudents: {
    color: '#AFC1D6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#415A77',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  errorText: {
    color: '#E63946',
    textAlign: 'center',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: Platform.OS === 'web' ? '40%' : '90%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  modalInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  pickerContainer: {
    overflow: 'hidden',
  },
  picker: {
    margin: 0,
    padding: 0,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#415A77',
  },
  submitButton: {
    backgroundColor: '#1B9AAA',
  },
  modalButtonText: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    fontSize: 16,
  },
});