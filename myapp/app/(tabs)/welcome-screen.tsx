import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../app/api';
import { accommodationImageMap } from '../../components/accommodationImages';

export default function WelcomeScreen() {
  const { name, role } = useLocalSearchParams();
  const router = useRouter();

  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [students, setStudents] = useState('');
  const [wifi, setWifi] = useState(false);
  const [isEasyParking, setIsEasyParking] = useState(false);
  const [academicCareerAffinity, setAcademicCareerAffinity] = useState(false);
  const [hobbiesAffinity, setHobbiesAffinity] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('5');

  useEffect(() => {
    if (role === 'STUDENT') {
      findAllAccommodations();
    }
  }, [role]);

  const findAllAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get('/accommodations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        console.log(response.data)
        setAccommodations(response.data);
      } else {
        setAccommodations([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAccommodations([]);
    }
  };

  const getFilteredAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const params: any = {
        maxPrice: maxPrice || -1,
        startDate: startDate || '',
        endDate: endDate || '',
        students: students || -1,
        wifi: wifi || false,
        isEasyParking: isEasyParking || false,
        matchCareer: academicCareerAffinity || false,
        matchHobbies: hobbiesAffinity || false,
        matchSmoking: allowSmoking || false,
        latitude: latitude || '',
        longitude: longitude || '',
        radius: radius || -1,
      };

      const response = await api.get('/accommodations/search', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setAccommodations(response.data);
      } else {
        setAccommodations([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAccommodations([]);
    }
  };

  const applyFilters = () => {
    getFilteredAccommodations();
    setFiltersVisible(false);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    router.replace('/');
  };

  const renderAccommodation = ({ item }: { item: any }) => {
    const images = accommodationImageMap[item.id] || [require('../../assets/images/default.jpg')];

    return (
      <View style={styles.card}>
        <FlatList
          data={images}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={item} style={styles.cardImage} />
          )}
          showsHorizontalScrollIndicator={false}
        />
        <Text style={styles.cardTitle}>{item.advertisement?.title || 'Sin título'}</Text>
        <Text style={styles.cardText}>🛏️ {item.beds ?? '4'} camas · 🛋️ {item.bedrooms ?? '2'} dormitorios</Text>
        <Text style={styles.cardPrice}>💰 {item.pricePerMonth ?? 'No disponible'} €/mes</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      <Text style={styles.welcomeText}>¡Bienvenido, {name}!</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {role === 'STUDENT' && (
        <>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleFilters}>
            <Text style={styles.toggleText}>{filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}</Text>
          </TouchableOpacity>

          {filtersVisible && (
            <View style={styles.searchBox}>
            <Text style={styles.label}>Precio máximo (€)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice} />

            <Text style={styles.label}>Fecha de inicio</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />

            <Text style={styles.label}>Fecha de fin</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />

            <Text style={styles.label}>Número de estudiantes</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={students} onChangeText={setStudents} />

            <View style={styles.switchRow}><Text style={styles.label}>Wifi</Text><Switch value={wifi} onValueChange={setWifi} /></View>
            <View style={styles.switchRow}><Text style={styles.label}>Fácil aparcar</Text><Switch value={isEasyParking} onValueChange={setIsEasyParking} /></View>
            <View style={styles.switchRow}><Text style={styles.label}>Afinidad carrera</Text><Switch value={academicCareerAffinity} onValueChange={setAcademicCareerAffinity} /></View>
            <View style={styles.switchRow}><Text style={styles.label}>Afinidad aficiones</Text><Switch value={hobbiesAffinity} onValueChange={setHobbiesAffinity} /></View>
            <View style={styles.switchRow}><Text style={styles.label}>Permite fumar</Text><Switch value={allowSmoking} onValueChange={setAllowSmoking} /></View>

            <Text style={styles.label}>Latitud</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={latitude} onChangeText={setLatitude} />

            <Text style={styles.label}>Longitud</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={longitude} onChangeText={setLongitude} />

            <Text style={styles.label}>Radio (km)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={radius} onChangeText={setRadius} />

              <TouchableOpacity style={styles.button} onPress={applyFilters}>
                <Text style={styles.buttonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.resultsTitle}>Apartamentos disponibles</Text>
          <FlatList
            data={accommodations}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderAccommodation}
            ListEmptyComponent={<Text style={{ color: 'white', marginTop: 20 }}>No hay alojamientos disponibles.</Text>}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#E0E1DD',
    color: '#0D1B2A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#E0E1DD',
    fontSize: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginVertical: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#415A77',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutText: {
    color: '#E0E1DD',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#1B263B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  toggleText: {
    color: '#E0E1DD',
    textAlign: 'center',
  },
  searchBox: {
    width: '100%',
    backgroundColor: '#1B263B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E0E1DD',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginVertical: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1B263B',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  cardImage: {
    width: 300,
    height: 180,
    borderRadius: 10,
    marginRight: 10,
  },
  cardTitle: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardText: {
    color: '#E0E1DD',
    marginTop: 5,
  },
  cardPrice: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    marginTop: 5,
  },
});