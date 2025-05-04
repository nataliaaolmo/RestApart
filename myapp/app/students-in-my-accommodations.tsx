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
} from 'react-native';
import api from '../app/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StudentsInMyAccommodations() {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [studentMap, setStudentMap] = useState<Record<number, any[]>>({});
  const [bookingMap, setBookingMap] = useState<Record<number, Record<number, { startDate: string; endDate: string }>>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
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
      const token = localStorage.getItem('jwt');
      const today = new Date().toISOString().split('T')[0];
      const start = startDate || today;
      const end = endDate || '2100-01-01';
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
            const matchingBooking = bookings.find((b: any) => b.accommodation.id === accommodation.id);
            
            if (matchingBooking && matchingBooking.stayRange) {
              newBookingMap[student.id] = {
                startDate: matchingBooking.stayRange.startDate,
                endDate: matchingBooking.stayRange.endDate,
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
        <Image source={{ uri: `http://localhost:8080/images/${images[0]}` }} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
        {students.length > 0 ? (
          students.map((student, idx) => (
            <View key={idx} style={styles.studentRow}>
              <Image
                source={{ uri: `http://localhost:8080/images/${student.photo || 'default.jpg'}` }}
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
                onPress={() =>
                  router.push({ pathname: '/(tabs)/profile', params: { id: student.id } })
                }
              >
                <Ionicons name="person-circle-outline" size={26} color="#AFC1D6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: '/private-chat', params: { id: student.id } })
                }
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#AFC1D6" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noStudents}>No hay estudiantes alojados.</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Estudiantes en mis alojamientos</Text>
      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Fecha inicio (YYYY-MM-DD)"
          placeholderTextColor="#AFC1D6"
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          placeholder="Fecha fin (YYYY-MM-DD)"
          placeholderTextColor="#AFC1D6"
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
        />
        <TouchableOpacity style={styles.filterButton} onPress={applyDateFilter}>
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalText}>Total estudiantes alojados: {totalStudents}</Text>

      <FlatList
        data={accommodations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAccommodation}
        contentContainerStyle={{ padding: 20 }}
      />
    </ScrollView>
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
});