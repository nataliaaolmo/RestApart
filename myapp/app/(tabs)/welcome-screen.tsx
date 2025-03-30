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
import { useRouter } from 'expo-router';
import api from '../../app/api';

export default function WelcomeScreen() {
  const router = useRouter();

  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [accommodationsByOwner, setAccommodationsByOwner] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
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
  const [role, setRole] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (role === 'STUDENT') {
      findAllAccommodations();
    } else if (role === 'OWNER') {
      findAccommodationsByOwner();
    }
  }, [role]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get('/users/auth/current-user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data.user);
      setRole(response.data.user.role);
      setName(response.data.user.username);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  const findAllAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get('/accommodations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccommodations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const findAccommodationsByOwner = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get('/accommodations/owner-accomodations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccommodationsByOwner(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching owner accommodations:', error);
    }
  };

  const applyFilters = () => {
    getFilteredAccommodations();
    setFiltersVisible(false);
  };

  const getFilteredAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const params: any = {
        maxPrice: maxPrice || -1,
        startDate,
        endDate,
        students: students || -1,
        wifi,
        isEasyParking,
        matchCareer: academicCareerAffinity,
        matchHobbies: hobbiesAffinity,
        matchSmoking: allowSmoking,
        latitude,
        longitude,
        radius: radius || -1,
      };

      const response = await api.get('/accommodations/search', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccommodations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error filtrando alojamientos:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/');
  };

  const renderAccommodation = ({ item }: { item: any }) => {
    const images = item.images?.length > 0 ? item.images : ['default.jpg'];
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/accommodation-details',
            params: {
              id: item.id,
              title: item.advertisement?.title || 'Sin título',
              beds: item.beds,
              bedrooms: item.rooms,
              price: item.pricePerMonth,
            },
          })
        }
      >
        <View style={styles.card}>
          <FlatList
            data={images}
            horizontal
            keyExtractor={(img, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: `http://localhost:8080/images/${item}` }} style={styles.cardImage} />
            )}
            showsHorizontalScrollIndicator={false}
          />
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.cardTitle}>{item.advertisement?.title || 'Sin título'}</Text>
              {item.isNew && <Text style={styles.newBadge}>NUEVO</Text>}
            </View>
            <Text style={styles.cardText}>🛏️ {item.beds ?? '4'} camas · 🛋️ {item.rooms ?? '2'} dorms</Text>
            <Text style={styles.cardPrice}>💰 {item.pricePerMonth} €/mes</Text>
            <Text style={styles.ratingText}>⭐ {item.rating ?? '4.5'} / 5</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1B2A' }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>¡Bienvenido, {name}!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        {role === 'STUDENT' && (
          <>
            <TouchableOpacity style={styles.toggleButton} onPress={() => setFiltersVisible(!filtersVisible)}>
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
              keyExtractor={(item) => item.id?.toString()}
              renderItem={renderAccommodation}
              ListEmptyComponent={<Text style={{ color: '#ccc' }}>No hay alojamientos disponibles.</Text>}
            />
          </>
        )}

        {role === 'OWNER' && (
          <>
            <Text style={styles.resultsTitle}>Mis alojamientos</Text>
            <FlatList
              data={accommodationsByOwner}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={renderAccommodation}
              ListEmptyComponent={<Text style={{ color: '#ccc' }}>No tienes alojamientos publicados.</Text>}
            />
            <TouchableOpacity style={styles.button} onPress={() => router.push('../create-accommodation')}>
              <Text style={styles.buttonText}>Crear nuevo anuncio</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#102437',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#1B263B',
  },
  searchBox: {
    backgroundColor: '#1B263B',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    color: '#E0E1DD',
    fontSize: 16,
    marginVertical: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  input: {
    backgroundColor: '#E0E1DD',
    color: '#0D1B2A',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E1DD',
  },
  logoutText: {
    color: '#AFC1D6',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#1B263B',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  toggleText: {
    color: '#E0E1DD',
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
  newBadge: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingText: {
    color: '#FFD700',
    marginTop: 4,
    fontSize: 14,
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
});