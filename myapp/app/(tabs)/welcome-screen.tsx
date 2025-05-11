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
  ActivityIndicator,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../app/api';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function WelcomeScreen() {
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<any[]>([]);
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
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [radius, setRadius] = useState('5');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [allAccommodations, setAllAccommodations] = useState<any[]>([]);
  const [visibleAccommodations, setVisibleAccommodations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [filterError, setFilterError] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [averageRatings, setAverageRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    const savedFilters = localStorage.getItem('accommodationFilters');
    if (savedFilters) {
      const f = JSON.parse(savedFilters);
      setMaxPrice(f.maxPrice);
      setStartDate(f.startDate);
      setEndDate(f.endDate);
      setStudents(f.students);
      setWifi(f.wifi);
      setIsEasyParking(f.isEasyParking);
      setAcademicCareerAffinity(f.academicCareerAffinity);
      setHobbiesAffinity(f.hobbiesAffinity);
      setAllowSmoking(f.allowSmoking);
      setLatitude(f.latitude);
      setLongitude(f.longitude);
      setRadius(f.radius);
      setZoneQuery(f.zoneQuery);
      setLocationConfirmed(f.locationConfirmed);
      getFilteredAccommodations();
    }
    if (role === 'STUDENT') {
      const savedFilters = localStorage.getItem('accommodationFilters');
      if (savedFilters) {
        getFilteredAccommodations();
      } else {
        findAllAccommodations();
      }
    } else if (role === 'OWNER') {
      findAccommodationsByOwner();
    }
  }, []);  
  
  useEffect(() => {
    if (role === 'STUDENT') {
      const savedFilters = localStorage.getItem('accommodationFilters');
      if (savedFilters) {
        getFilteredAccommodations();
      } else {
        findAllAccommodations();
      }
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

  const showFilterError = (msg: string) => {
    if (Platform.OS === 'web') {
      setFilterError(msg);
    } else {
      Alert.alert('Error en los filtros', msg);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
  
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };
  
  const findAllAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get('/accommodations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setAllAccommodations(data);
      setVisibleAccommodations(data.slice(0, itemsPerPage));
      setPage(1);
      fetchAverageRatings(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const nextItems = allAccommodations.slice(0, nextPage * itemsPerPage);
    setVisibleAccommodations(nextItems);
    setPage(nextPage);
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

  const fetchAverageRatings = async (accommodationsList: any[]) => {
    try {
      const token = localStorage.getItem('jwt');
      const ratings: { [key: number]: number } = {};
  
      await Promise.all(accommodationsList.map(async (acc) => {
        try {
          const response = await api.get(`/comments/accomodations/${acc.id}/average`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          ratings[acc.id] = response.data ?? 0.0;
        } catch (error) {
          console.warn(`Error al obtener media para alojamiento ${acc.id}:`, error);
          ratings[acc.id] = 0.0;
        }
      }));
  
      setAverageRatings(ratings);
    } catch (error) {
      console.error('Error al calcular medias:', error);
    }
  };  

const applyFilters = () => {
  setFilterError('');
  
  if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) <= 0)) {
    showFilterError('El precio máximo debe ser un número mayor que 0');
    return;
  }

  if (students && (isNaN(Number(students)) || Number(students) <= 0)) {
    showFilterError('El número de estudiantes debe ser válido');
    return;
  }

  const isValidDate = (date: string) => /^\d{2}-\d{2}-\d{4}$/.test(date);

  if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
    showFilterError('Las fechas deben estar en formato DD-MM-YYYY');
    return;
  }

  if ((latitude !== null && isNaN(Number(latitude))) || (longitude !== null && isNaN(Number(longitude)))) {
    showFilterError('Las coordenadas deben ser números válidos');
    return;
  }  

  if (radius && (isNaN(Number(radius)) || Number(radius) < 0)) {
    showFilterError('El radio debe ser un número positivo');
    return;
  }

  const isAffinitySelected = academicCareerAffinity || hobbiesAffinity || allowSmoking;
  const noDatesSpecified = !startDate || !endDate;
  if (isAffinitySelected && noDatesSpecified) {
    showFilterError('Debes especificar al menos una fecha para usar filtros de afinidad o de fumadores');
    return;
  }

  const filters = {
    maxPrice, startDate, endDate, students, wifi, isEasyParking,
    academicCareerAffinity, hobbiesAffinity, allowSmoking,
    latitude, longitude, radius, zoneQuery, locationConfirmed
  };
  localStorage.setItem('accommodationFilters', JSON.stringify(filters));
  getFilteredAccommodations();
  setModalVisible(false);
};

function formatDateToISO(dateString: string | null): string | null {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

  const getFilteredAccommodations = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const params: any = {
        maxPrice: maxPrice ? Number(maxPrice) : null,
        startDate: formatDateToISO(startDate) || null,
        endDate: formatDateToISO(endDate) || null,
        students: students ? Number(students) : null,
        wifi: wifi || null,
        isEasyParking: isEasyParking || null,
        matchCareer: academicCareerAffinity || null,
        matchHobbies: hobbiesAffinity || null,
        matchSmoking: allowSmoking || null,
        latitude: locationConfirmed ? parseFloat(latitude.toString()) : null,
        longitude: locationConfirmed ? parseFloat(longitude.toString()) : null,
        radius: locationConfirmed ? parseFloat(radius.toString()) : null,              
      };

      console.log('params', params);

      const response = await api.get('/accommodations/search', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('accommodations filtered', response.data);
      setAccommodations(Array.isArray(response.data) ? response.data : []);
      fetchAverageRatings(response.data);
    } catch (error) {
      console.error('Error filtrando alojamientos:', error);
    }
  };

  const searchByZone = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(zoneQuery)}`);
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLatitude(lat);
        setLongitude(lon);
        setLocationConfirmed(true);
        setFilterError('Coordenadas actualizadas, pulsa "Aplicar filtros" para buscar.');
      } else {
        alert('Zona no encontrada');
        setLocationConfirmed(false);
      }
    } catch (error) {
      console.error('Error buscando zona:', error);
      alert('Error buscando la zona');
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
              latitude: item.latitude,
              longitude: item.longitude,
              startDate: formatDateToISO(startDate),
              endDate: formatDateToISO(endDate),  
              isVerified: item.isVerified,            
            },
          })
        }
      >
        <View style={styles.card}>
        {role === 'STUDENT' && (
        <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={() => toggleFavorite(item.id)}
          >
            <Text style={{ fontSize: 20 }}>
              {favorites.includes(item.id) ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}

          <View style={{ position: 'relative' }}>
          <FlatList
            data={images}
            horizontal
            keyExtractor={(img, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: `http://localhost:8080/images/${item}` }} style={styles.cardImage} />
            )}
            showsHorizontalScrollIndicator={false}
              />
            </View>

          <View style={{ marginTop: 10 }}>
            <View style={styles.cardInfoRow}>
              <View style={styles.cardInfoLeft}>
                <View style={styles.cardInfoItem}>
                  <Icon name="bed" size={16} color="#AFC1D6" style={{ marginRight: 5 }} />
                  <Text style={styles.cardInfoText}>{item.beds ?? '4'} camas</Text>
                </View>
                <View style={styles.cardInfoItem}>
                  <Icon name="home" size={16} color="#AFC1D6" style={{ marginRight: 5 }} />
                  <Text style={styles.cardInfoText}>{item.rooms ?? '2'} dormitorios</Text>
                </View>
              </View>
              <View style={styles.cardInfoRight}>
                <Text style={styles.cardPrice}>{item.pricePerMonth} €/mes</Text>
              </View>
            </View>

            <Text style={styles.ratingText}>
              ⭐ {typeof averageRatings[item.id] === 'number' ? averageRatings[item.id].toFixed(1) : '–'} / 5
            </Text>

            <View style={styles.servicesRow}>
            {item.isVerified && (
            <View style={styles.verifiedChip}>
              <Feather name="shield" size={14} color="#0D1B2A" />
              <Text style={styles.verifiedChipText}>Verificado</Text>
            </View>
          )}
            {item.wifi && (
              <View style={styles.serviceItem}>
                <Icon name="wifi" size={16} color="#E0E1DD" style={{ marginRight: 6 }} />
                <Text style={styles.serviceText}>Wifi</Text>
              </View>
            )}
            {item.isEasyParking && (
              <View style={styles.serviceItem}>
                <Icon name="car" size={16} color="#E0E1DD" style={{ marginRight: 6 }} />
                <Text style={styles.serviceText}>Parking</Text>
              </View>
            )}
            {item.smokingAllowed && (
              <View style={styles.serviceItem}>
                <Icon name="smoking" size={16} color="#E0E1DD" style={{ marginRight: 6 }} />
                <Text style={styles.serviceText}>Fumar</Text>
              </View>
            )}
          </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const resetFilters = () => {
    setZoneQuery('');
    setLatitude(0.0);
    setLongitude(0.0);
    setStartDate('');
    setEndDate('');
    setMaxPrice('');
    setStudents('');
    setWifi(false);
    setIsEasyParking(false);
    setAcademicCareerAffinity(false);
    setHobbiesAffinity(false);
    localStorage.removeItem('accommodationFilters');
    findAllAccommodations();
  };
  

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1B2A' }}>
    <LinearGradient
      colors={['#0D1B2A', '#1B263B']}
      style={styles.header}
    >
      <View style={styles.headerLeft}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: `http://localhost:8080/images/${userData?.profilePicture}` }}
          style={styles.avatar}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <ActivityIndicator
            size="small"
            color="#E0E1DD"
            style={{ position: 'absolute', top: 5, left: 5 }}
          />
        )}
      </View>

        <Text style={styles.headerText}>¡Bienvenido, {name}!</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
        <Feather name="log-out" size={20} color="#AFC1D6" />
      </TouchableOpacity>
    </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        {role === 'STUDENT' && (
          <>
      <TouchableOpacity style={styles.toggleButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.toggleText}>Mostrar filtros</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
      <ScrollView contentContainerStyle={styles.modalContent}>
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{ alignSelf: 'flex-end', marginBottom: 10 }}
          >
            <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>✕ Cerrar</Text>
          </TouchableOpacity>

          {Platform.OS === 'web' && filterError !== '' && (
            <Text style={styles.filterError}>{filterError}</Text>
          )}

          <View style={styles.filterBlock}>
          <Text style={styles.label}>Buscar por zona (ej: Reina Mercedes, Sevilla)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la zona"
            value={zoneQuery}
            onChangeText={setZoneQuery}
          />
          <Text style={styles.label}>Radio de búsqueda (km)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={radius}
            onChangeText={setRadius}
          />
          <TouchableOpacity
            style={[styles.button, { marginTop: 15 }]}
            onPress={searchByZone}
          >
            <Text style={styles.buttonText}>Buscar zona</Text>
          </TouchableOpacity>
          </View>

          {/* Error de filtro */}

          {/* Paso 2: filtros, solo si hay coordenadas */}
          {locationConfirmed && (
            <>
              <View style={styles.filterBlock}>
              <Text style={styles.sectionTitle}>💰 Presupuesto</Text>
              <Text style={styles.label}>Precio máximo por mes (€)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
              </View>

              <View style={styles.filterBlock}>
              <Text style={styles.sectionTitle}>📆 Fechas</Text>
              <Text style={styles.label}>Fechas de estancia</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 5 }]}
                  placeholder="Inicio (DD-MM-YYYY)"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 5 }]}
                  placeholder="Fin (DD-MM-YYYY)"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
              </View>

              <View style={styles.filterBlock}>
              <Text style={styles.sectionTitle}>👥 Compañeros</Text>
              <Text style={styles.label}>Número de estudiantes</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={students}
                onChangeText={setStudents}
              />
              </View>

              <View style={styles.filterBlock}>
              <Text style={styles.sectionTitle}>🔧 Servicios y preferencias</Text>
              <View style={styles.switchRow}><Text style={styles.label}>Wifi</Text><Switch value={wifi} onValueChange={setWifi} /></View>
              <View style={styles.switchRow}><Text style={styles.label}>Fácil aparcar</Text><Switch value={isEasyParking} onValueChange={setIsEasyParking} /></View>
              </View>
              <View style={styles.filterBlock}>
              <Text style={styles.sectionTitle}>🧑‍🤝‍🧑 Afinidades</Text>
              <View style={styles.switchRow}><Text style={styles.label}>Afinidad carrera</Text><Switch value={academicCareerAffinity} onValueChange={setAcademicCareerAffinity} /></View>
              <View style={styles.switchRow}><Text style={styles.label}>Afinidad aficiones</Text><Switch value={hobbiesAffinity} onValueChange={setHobbiesAffinity} /></View>
              <View style={styles.switchRow}><Text style={styles.label}>No me importa que mis compañeros fumen</Text><Switch value={allowSmoking} onValueChange={setAllowSmoking} /></View>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={applyFilters}
              >
                <Text style={styles.buttonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </ScrollView>
    </Modal>
    <Text style={styles.resultsTitle}>Apartamentos disponibles</Text>

{zoneQuery && latitude && longitude ? (
  <>
    <Text style={styles.zoneInfo}>
      Mostrando resultados para: <Text style={{ fontWeight: 'bold' }}>{zoneQuery}</Text>
    </Text>

    <TouchableOpacity onPress={resetFilters} style={styles.clearFiltersButton}>
      <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
    </TouchableOpacity>

    <FlatList
      data={accommodations}
      keyExtractor={(item) => item.id?.toString()}
      renderItem={renderAccommodation}
      ListEmptyComponent={<Text style={{ color: '#ccc' }}>No hay alojamientos disponibles.</Text>}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  </>
) : (
  <FlatList
    data={visibleAccommodations}
    keyExtractor={(item) => item.id?.toString()}
    renderItem={renderAccommodation}
    ListEmptyComponent={<Text style={{ color: '#ccc' }}>No hay alojamientos disponibles.</Text>}
    onEndReached={loadMore}
    onEndReachedThreshold={0.5}
    showsVerticalScrollIndicator={false}
  />
)}
        </>
        )}

        {role === 'OWNER' && (
          <>
            <Text style={styles.resultsTitle}>Mis alojamientos</Text>

            {accommodationsByOwner.length > 0 ? (
              <Text style={styles.ownerSummaryText}>
                Tienes <Text style={{ fontWeight: 'bold' }}>{accommodationsByOwner.length}</Text> alojamientos publicados.
              </Text>
            ) : (
              <Text style={styles.ownerEmptyText}>
                Aún no has publicado ningún alojamiento. ¡Empieza creando uno!
              </Text>
            )}

            <FlatList
              data={accommodationsByOwner}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={renderAccommodation}
              ListEmptyComponent={null}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('../create-accommodation')}
            >
              <Feather name="plus-circle" size={20} color="#0D1B2A" style={{ marginRight: 10 }} />
              <Text style={styles.createButtonText}>Crear nuevo anuncio</Text>
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#1B263B',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0E1DD',
  },
  logoutText: {
    color: '#AFC1D6',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleButton: {
    backgroundColor: '#1B263B',
    padding: 12,
    borderRadius: 10,
    marginVertical: 15,
  },
  toggleText: {
    color: '#E0E1DD',
    textAlign: 'center',
    fontSize: 16,
  },
  searchBox: {
    backgroundColor: '#1B263B',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    color: '#E0E1DD',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#E0E1DD',
    color: '#0D1B2A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 5,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1B263B',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: 300,
    height: 180,
    borderRadius: 12,
    marginRight: 10,
  },
  cardTitle: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  cardText: {
    color: '#AFC1D6',
    marginTop: 5,
    fontSize: 14,
  },
  newBadge: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#E0E1DD',
  },
  modalContent: {
    paddingTop: 60,
    backgroundColor: '#0D1B2A',
    flexGrow: 1,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1B263B',
    padding: 6,
    borderRadius: 999,
    zIndex: 10,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B263B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  serviceText: {
    color: '#E0E1DD',
    fontSize: 13,
    fontWeight: '500',
  },  
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardInfoLeft: {
    flexDirection: 'row',
    gap: 15,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoText: {
    color: '#AFC1D6',
    fontSize: 14,
  },
  cardInfoRight: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cardPrice: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutIcon: {
    padding: 8,
    backgroundColor: '#1B263B',
    borderRadius: 8,
  },
  zoneInfo: {
    color: '#AFC1D6',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },  
  distanceText: {
    color: '#AFC1D6',
    marginTop: 4,
    fontSize: 13,
    fontStyle: 'italic',
  },  
  filterError: {
    color: 'tomato',
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },  
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#AFC1D6',
    marginTop: 20,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#415A77',
    paddingBottom: 5,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  
  clearFiltersText: {
    color: '#333',
    fontWeight: 'bold',
  },
  filterBlock: {
  backgroundColor: '#1B263B',
  borderRadius: 10,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#415A77',
},
createButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#E0E1DD',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginTop: 20,
},
createButtonText: {
  color: '#0D1B2A',
  fontWeight: 'bold',
  fontSize: 16,
},
ownerEmptyText: {
  color: '#AFC1D6',
  fontSize: 16,
  textAlign: 'center',
  marginVertical: 10,
  fontStyle: 'italic',
},
ownerSummaryText: {
  color: '#AFC1D6',
  fontSize: 15,
  textAlign: 'center',
  marginBottom: 15,
}, 
verifiedChip: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#A8DADC',
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 20,
  alignSelf: 'flex-start',
  marginTop: 8,
  marginBottom: -4,
},
verifiedChipText: {
  color: '#0D1B2A',
  marginLeft: 6,
  fontSize: 13,
  fontWeight: 'bold',
  textTransform: 'uppercase',
},
});
