import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';

export default function AccommodationDetailsScreen() {
  const { id, title, beds, bedrooms, price } = useLocalSearchParams();
  const [owner, setOwner] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const router = useRouter();

  const stayRange = {
    startDate: '2025-04-01',
    endDate: '2025-07-01',
  };

  useEffect(() => {
    findAccommodation();
    loadTenants();
  }, []);

  const findAccommodation = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get(`/accommodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwner(response.data.owner);
      setDescription(response.data.description);
      setImages(response.data.images?.map((name: string) => ({ uri: `http://localhost:8080/images/${name}` })) || []);
    } catch (error) {
      console.error('Error buscando alojamiento', error);
    }
  };

  const loadTenants = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get(`/accommodations/${id}/students`, {
        params: stayRange,
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(response.data);
    } catch (err) {
      console.error('Error cargando inquilinos', err);
    }
  };

  const checkAvailability = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get(`/accommodations/${id}/check-availability`, {
        params: stayRange,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      Alert.alert('Error', 'No se pudo comprobar la disponibilidad.');
      return false;
    }
  };

  const initiatePaypalPayment = async () => {
    const token = localStorage.getItem('jwt');
    try {
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        Alert.alert('Sin plazas', 'El alojamiento ya no tiene plazas disponibles para esas fechas.');
        return;
      }

      const response = await api.post('/payments/paypal/create', null, {
        params: {
          amount: price,
          currency: 'EUR',
          description: `Reserva alojamiento ID ${id}`,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const approvalUrl = response.data.approvalUrl;
      if (approvalUrl) {
        Linking.openURL(approvalUrl);
      } else {
        Alert.alert('Error', 'No se pudo obtener el enlace de pago.');
      }
    } catch (error) {
      console.error('Error iniciando pago', error);
      Alert.alert('Error', 'No se pudo iniciar el proceso de pago.');
    }
  };

  const renderImage = ({ item }: { item: any }) => <Image source={item} style={styles.carouselImage} />;

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={images}
        horizontal
        renderItem={renderImage}
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{beds} camas - {bedrooms} dormitorios - 2 baños</Text>

        {owner && (
          <View style={styles.ownerSection}>
            <Image
              source={{ uri: `http://localhost:8080/images/${owner.profilePicture}` }}
              style={styles.ownerImage}
            />
            <View>
              <Text style={styles.ownerName}>Dueño: {owner.user.firstName} {owner.user.lastName}</Text>
              <Text style={styles.ownerExperience}>{owner.experienceYears} años de experiencia</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Inquilinos</Text>
        <View style={styles.tenantsRow}>
          {tenants.map((tenant, index) => (
            <Image
              key={index}
              source={{ uri: `http://localhost:8080/images/${tenant.photo}` }}
              style={styles.tenantPhoto}
            />
          ))}
        </View>

        <Text style={styles.description}>{description}</Text>

        <Text style={styles.sectionTitle}>Ubicación exacta</Text>
        <Image source={require('../assets/images/map.jpg')} style={styles.mapImage} />

        <Text style={styles.sectionTitle}>Comentarios</Text>
        <View style={styles.commentBox}>
          <Text style={styles.commentRating}>3,5 ⭐</Text>
          <Text>Todo bien pero apartamento pequeño y difícil aparcar por la zona</Text>
        </View>
        <View style={styles.commentBox}>
          <Text style={styles.commentRating}>5 ⭐</Text>
          <Text>Máxima puntuación, pues todo estuvo perfecto</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{price}€/mes</Text>
          <View style={{ width: '60%' }}>
            <Text onPress={initiatePaypalPayment} style={styles.payButton}>PAGAR CON PAYPAL</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  carouselImage: { width: '100%', height: 200 },
  content: { padding: 20 },
  title: { color: '#E0E1DD', fontSize: 20, fontWeight: 'bold' },
  subTitle: { color: '#AFC1D6', marginBottom: 10 },
  ownerSection: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  ownerImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  ownerName: { color: '#E0E1DD', fontWeight: 'bold' },
  ownerExperience: { color: '#AFC1D6' },
  sectionTitle: { color: '#E0E1DD', fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  tenantsRow: { flexDirection: 'row', marginBottom: 10 },
  tenantPhoto: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  description: { color: '#E0E1DD', marginTop: 10 },
  mapImage: { width: '100%', height: 150, borderRadius: 10 },
  commentBox: { backgroundColor: '#E0E1DD', padding: 10, borderRadius: 10, marginTop: 10 },
  commentRating: { fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  price: { backgroundColor: '#fff', padding: 10, borderRadius: 10 },
  payButton: { backgroundColor: '#ffc439', padding: 12, borderRadius: 8, textAlign: 'center', color: '#000', fontWeight: 'bold' },
});
