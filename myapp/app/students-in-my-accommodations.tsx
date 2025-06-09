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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import storage from '../utils/storage';

const formatToSpanish = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function StudentsInMyAccommodations() {
  const { token: navigationToken } = useLocalSearchParams();
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [studentMap, setStudentMap] = useState<Record<string, any[]>>({});
  const [bookingMap, setBookingMap] = useState<Record<string, Record<string, any>>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [filterError, setFilterError] = useState('');
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});

  const getAuthToken = async (): Promise<string> => {
    const token = typeof navigationToken === 'string' ? navigationToken : await storage.getItem('jwt');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return token;
  };

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
    const initializeData = async () => {
      try {
        const token = await getAuthToken();
        await fetchAccommodations();
      } catch (error) {
        console.error('Error al inicializar datos:', error);
        Alert.alert('Error', 'No hay sesión activa. Por favor, inicia sesión de nuevo.');
        router.push('/login');
      }
    };

    initializeData();
  }, [navigationToken]);

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
        // Inicializar el mapa de disponibilidad con los datos del alojamiento
        const initialAvailabilityMap: Record<number, any> = {};
        res.data.forEach((acc: any) => {
          initialAvailabilityMap[acc.id] = {
            startDate: acc.availability?.startDate,
            endDate: acc.availability?.endDate,
            availableSpots: acc.students,
            isAvailable: true
          };
        });
        setAvailabilityMap(initialAvailabilityMap);
        // Obtener estudiantes para cada alojamiento
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

      const studentsRes = await api.get(`/bookings/${accommodation.id}/get-accommodation-bookings`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (studentsRes.data && Array.isArray(studentsRes.data)) {
        // Los datos que recibimos son directamente los estudiantes
        const students = studentsRes.data.map((student: any) => ({
          id: student.id,
          firstName: student.firstName,
          photo: student.photo,
          userId: student.userId
        }));

        // Obtener las fechas de las reservas para cada estudiante
        const newBookingMap: Record<number, { startDate: string; endDate: string }> = {};
        const today = new Date().toISOString().split('T')[0];
        
        // Obtener las reservas para cada estudiante
        await Promise.all(
          students.map(async (student: any) => {
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

        // Filtrar estudiantes con reservas activas
        const activeStudents = students.filter(student => {
          const booking = newBookingMap[student.id];
          if (!booking) return false;
          
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          const currentDate = new Date(today);
          
          return startDate <= currentDate && currentDate <= endDate;
        });

        // Actualizar el mapa de estudiantes con solo los activos
        setStudentMap(prev => {
          const newMap = { ...prev, [accommodation.id]: activeStudents };
          // Calcular el total de estudiantes después de actualizar el mapa
          let total = 0;
          Object.values(newMap).forEach(students => {
            if (Array.isArray(students)) {
              total += students.length;
            }
          });
          setTotalStudents(total);
          return newMap;
        });

        // Actualizar plazas disponibles basado en estudiantes activos
        const availableSpots = Math.max(0, accommodation.students - activeStudents.length);
        setAvailabilityMap(prev => ({
          ...prev,
          [accommodation.id]: {
            ...prev[accommodation.id],
            availableSpots,
            isAvailable: availableSpots > 0
          }
        }));

        setBookingMap(prev => ({ ...prev, [accommodation.id]: newBookingMap }));
      }
    } catch (err: any) {
      console.error(`Error al obtener estudiantes del alojamiento ${accommodation.id}:`, err);
      if (err.response) {
        console.error('Detalles del error:', {
          status: err.response.status,
          data: err.response.data
        });
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
      setStudentMap(prev => ({ ...prev, [accommodation.id]: [] }));
      setBookingMap(prev => ({ ...prev, [accommodation.id]: {} }));
    }
  };

  const registerStudentWithoutAccount = async () => {
    if (!selectedAccommodationId || !startDate || !endDate || !firstName || !lastName) {
      if (Platform.OS === 'web') {
        setFilterError('Por favor, rellena todos los campos obligatorios.');
      } else {
        Alert.alert('Error', 'Por favor, rellena todos los campos obligatorios.');
      }
      return;
    }
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      if (Platform.OS === 'web') {
        setFilterError('El formato de las fechas debe ser DD-MM-YYYY');
      } else {
        Alert.alert('Error', 'El formato de las fechas debe ser DD-MM-YYYY');
      }
      return;
    }

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
      const token = await getAuthToken();

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

      setFirstName('');
      setLastName('');
      setPhoto('');
      setSelectedAccommodationId('');
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
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Por favor, selecciona ambas fechas para filtrar');
      return;
    }

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert('Error', 'El formato de las fechas debe ser DD-MM-YYYY');
      return;
    }

    const startDateObj = new Date(convertToBackendFormat(startDate));
    const endDateObj = new Date(convertToBackendFormat(endDate));
    if (startDateObj >= endDateObj) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    // Limpiar los mapas actuales
    setStudentMap({});
    setBookingMap({});
    setTotalStudents(0);

    // Obtener estudiantes para cada alojamiento con las fechas filtradas
    accommodations.forEach((acc) => {
      fetchStudentsWithDates(acc, startDate, endDate);
    });
  };

  const fetchStudentsWithDates = async (accommodation: any, start: string, end: string) => {
    try {
      const token = await storage.getItem('jwt');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const studentsRes = await api.get(`/bookings/${accommodation.id}/get-accommodation-bookings`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (studentsRes.data && Array.isArray(studentsRes.data)) {
        const students = studentsRes.data.map((student: any) => ({
          id: student.id,
          firstName: student.firstName,
          photo: student.photo,
          userId: student.userId
        }));

        const newBookingMap: Record<number, { startDate: string; endDate: string }> = {};
        const filterStart = new Date(convertToBackendFormat(start));
        const filterEnd = new Date(convertToBackendFormat(end));

        await Promise.all(
          students.map(async (student: any) => {
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
                const bookingStart = new Date(matchingBooking.startDate);
                const bookingEnd = new Date(matchingBooking.endDate);
                
                // Verificar si la reserva se solapa con el rango de fechas seleccionado
                if (bookingStart <= filterEnd && bookingEnd >= filterStart) {
                  newBookingMap[student.id] = {
                    startDate: matchingBooking.startDate,
                    endDate: matchingBooking.endDate,
                  };
                }
              }
            } catch (err) {
              console.error(`Error al obtener booking para estudiante ${student.id}:`, err);
            }
          })
        );

        // Filtrar estudiantes que tienen reservas en el rango de fechas
        const filteredStudents = students.filter(student => newBookingMap[student.id]);

        setStudentMap(prev => {
          const newMap = { ...prev, [accommodation.id]: filteredStudents };
          // Calcular el total de estudiantes después de actualizar el mapa
          let total = 0;
          Object.values(newMap).forEach(students => {
            if (Array.isArray(students)) {
              total += students.length;
            }
          });
          setTotalStudents(total);
          return newMap;
        });

        setBookingMap(prev => ({
          ...prev,
          [accommodation.id]: newBookingMap
        }));

        // Actualizar plazas disponibles
        const availableSpots = Math.max(0, accommodation.students - filteredStudents.length);
        setAvailabilityMap(prev => ({
          ...prev,
          [accommodation.id]: {
            ...prev[accommodation.id],
            availableSpots,
            isAvailable: availableSpots > 0
          }
        }));
      }
    } catch (err) {
      console.error(`Error al obtener estudiantes con fechas para alojamiento ${accommodation.id}:`, err);
    }
  };

  const renderAccommodation = ({ item }: { item: any }) => {
    const students = studentMap[item.id] || [];
    const bookingsForAcc = bookingMap[item.id] || {};
    console.log("booking", bookingMap);
    const availability = availabilityMap[item.id] || { availableSpots: item.students, isAvailable: true };
    const title = item.advertisement?.title || 'Sin título';
    const images = item.images?.length > 0 ? item.images : ['default.jpg'];
    const currentDate = new Date();
    const availablePlaces = item.capacity - students.length;
    const isAvailable = availability.startDate && availability.endDate && 
      new Date(availability.startDate) <= currentDate && 
      new Date(availability.endDate) >= currentDate;

    return (
      <View style={styles.card}>
        <Image source={{ uri: `https://restapart.onrender.com/images/${images[0]}` }} style={styles.image} />
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.availabilityInfo}>
            <Text style={[styles.availabilityText, { color: availability.isAvailable ? '#4CAF50' : '#E63946' }]}>
              {availability.isAvailable ? 'Disponible' : 'No disponible'}
            </Text>
            <Text style={styles.placesText}>
              {availability.availableSpots} plazas disponibles de {item.students}
            </Text>
            {availability.startDate && availability.endDate && (
              <Text style={styles.datesText}>
                Disponible desde: {formatToSpanish(availability.startDate)} hasta: {formatToSpanish(availability.endDate)}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Estudiantes actuales:</Text>
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
                    Estancia: {formatToSpanish(bookingsForAcc[student.id].startDate)} → {formatToSpanish(bookingsForAcc[student.id].endDate)}
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
          <Text style={styles.noStudents}>No hay estudiantes alojados actualmente.</Text>
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
                    value="" 
                    color="#AFC1D6"
                  />
                  {accommodations.map((acc) => (
                    <Picker.Item
                      key={acc.id}
                      label={acc.advertisement?.title || 'Sin título'}
                      value={acc.id.toString()}
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
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
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
    width: '100%',
  },
  input: {
    backgroundColor: '#1B263B',
    color: '#E0E1DD',
    padding: 12,
    borderRadius: 8,
    width: Platform.OS === 'web' ? '30%' : '90%',
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
    width: '100%',
  },
  accommodationsList: {
    padding: 20,
    width: '100%',
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
    width: '100%',
    height: '100%',
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
    color: '#E0E1DD',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#E0E1DD',
  },
  modalInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#415A77',
    color: '#E0E1DD',
  },
  pickerContainer: {
    overflow: 'hidden',
    backgroundColor: '#162A40',
    borderColor: '#415A77',
    borderWidth: 1,
    borderRadius: 8,
    padding: 0,
    marginBottom: 0,
  },
  picker: {
    margin: 0,
    padding: 0,
    color: '#E0E1DD',
    backgroundColor: '#162A40',
    height: 50,
    width: '100%',
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
  cardHeader: {
    marginBottom: 15,
  },
  availabilityInfo: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#162A40',
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  placesText: {
    color: '#E0E1DD',
    fontSize: 14,
    marginBottom: 5,
  },
  datesText: {
    color: '#AFC1D6',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
});