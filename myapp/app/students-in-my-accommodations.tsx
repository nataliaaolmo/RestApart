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

  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const token = await storage.getItem('jwt');
      const res = await api.get('/accommodations/owner-accomodations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccommodations(res.data);
      res.data.forEach((acc: any) => fetchStudents(acc));
    } catch (err) {
      console.error('Error al obtener alojamientos del owner:', err);
    }
  };

  const fetchStudents = async (accommodation: any) => {
    try {
      const token = await storage.getItem('jwt');
      const today = new Date().toLocaleDateString('es-ES').split('/').reverse().join('-');
      const start = startDate ? convertToBackendFormat(startDate) : today;
      const end = endDate ? convertToBackendFormat(endDate) : '2100-01-01';
      const url = `/accommodations/${accommodation.id}/students?startDate=${start}&endDate=${end}`;
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentMap((prev) => ({ ...prev, [accommodation.id]: res.data }));

      const newBookingMap: Record<number, { startDate: string; endDate: string }> = {};
      await Promise.all(
        res.data.map(async (student: any) => {
          try {
            const bookingRes = await api.get(`/bookings/${student.id}`, {
              headers: { Authorization: `Bearer ${token}` },
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
            console.error(`Error al obtener booking para estudiante ${student.id}`, err);
          }
        })
      );
      setBookingMap((prev) => ({ ...prev, [accommodation.id]: newBookingMap }));
    } catch (err) {
      console.error(`Error al obtener estudiantes del alojamiento ${accommodation.id}:`, err);
    }
  };

  const registerStudentWithoutAccount = async () => {
    if (!selectedAccommodationId || !startDate || !endDate || !firstName || !lastName) {
      Alert.alert('Error', 'Rellena todos los campos obligatorios.');
      return;
    }
  
    try {
      const token = await storage.getItem('jwt');
  
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
      fetchAccommodations();

      setFirstName('');
      setLastName('');
      setPhoto('');
      setSelectedAccommodationId(null);
      setStartDate('');
      setEndDate('');
    } catch (err) {
      console.error('Error al registrar estudiante sin cuenta:', err);
      Alert.alert('Error', 'No se pudo registrar el estudiante.');
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
    <><ScrollView style={styles.container}>
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
        <Text style={{ color: '#90EE90', textAlign: 'center', marginBottom: 10 }}>{statusMessage}</Text>
      )}

      <FlatList
        data={accommodations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAccommodation}
        contentContainerStyle={{ padding: 20 }} />

      <TouchableOpacity
        style={[styles.filterButton, { margin: 20 }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>➕ Añadir nuevo estudiante a alojamiento</Text>
      </TouchableOpacity>

    </ScrollView>
    <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground2}>
          <View style={styles.modalBox2}>
            <Text style={styles.modalTitle2}>Nuevo estudiante sin cuenta</Text>

            <Text style={styles.modalLabel}>Alojamiento</Text>
            <Picker
                selectedValue={selectedAccommodationId}
                onValueChange={(val) => setSelectedAccommodationId(val)}
                style={styles.input}
              >
                <Picker.Item label="Selecciona un alojamiento" value={null} />
                {accommodations.map(acc => (
                  <Picker.Item label={acc.advertisement.title} value={acc.id} key={acc.id} />
                ))}
              </Picker>

            <TextInput placeholder="Nombre" value={firstName} onChangeText={setFirstName} style={styles.input} />
            <TextInput placeholder="Apellido" value={lastName} onChangeText={setLastName} style={styles.input} />
            <TextInput placeholder="Fecha inicio (DD-MM-YYYY)" value={startDate} onChangeText={setStartDate} style={styles.input} />
            <TextInput placeholder="Fecha fin (DD-MM-YYYY)" value={endDate} onChangeText={setEndDate} style={styles.input} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton2} onPress={registerStudentWithoutAccount}>
                <Text style={styles.modalButtonText2}>Registrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText2}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal></>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  header: {
    color: '#E0E1DD',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#1B263B',
    color: '#E0E1DD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#A8DADC',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
  },
  totalText: {
    color: '#AFC1D6',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#1B263B',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  title: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },
  studentName: {
    color: '#AFC1D6',
    fontSize: 15,
    fontWeight: 'bold',
  },
  stayDates: {
    color: '#ccc',
    fontSize: 13,
  },
  noStudents: {
    color: '#ccc',
    fontStyle: 'italic',
    marginTop: 10,
  },
  modalBackground2: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox2: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle2: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton2: {
    backgroundColor: '#A8DADC',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#E63946',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  modalButtonText2: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalLabel: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    textAlign: 'center',
  },  
});