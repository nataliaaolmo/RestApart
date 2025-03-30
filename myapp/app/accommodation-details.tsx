// AccommodationDetailsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, FlatList,
  Alert, Linking, TouchableOpacity, Modal, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../app/api';
import { Ionicons } from '@expo/vector-icons';

export default function AccommodationDetailsScreen() {
  const { id, title, beds, bedrooms, price } = useLocalSearchParams();
  const [owner, setOwner] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const router = useRouter();
  const [photosModalVisible, setPhotosModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList<any>>(null);

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
      setImages(response.data.images || []);
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

  const initiatePaypalPayment = async () => {
    const token = localStorage.getItem('jwt');
    try {
      const isAvailable = await api.get(`/accommodations/${id}/check-availability`, {
        params: stayRange,
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.data);

      if (!isAvailable) {
        Alert.alert('Sin plazas', 'No hay plazas disponibles.');
        return;
      }

      const response = await api.post('/payments/paypal/create', null, {
        params: {
          amount: price,
          currency: 'EUR',
          description: `Reserva alojamiento ID ${id}`,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.approvalUrl) {
        Linking.openURL(response.data.approvalUrl);
      } else {
        Alert.alert('Error', 'No se pudo obtener el enlace de pago.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el pago.');
    }
  };

  const handleUserPress = (userId: number) => {
    setSelectedUserId(userId);
    setActionModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#E0E1DD" />
        </TouchableOpacity>
        <Text style={styles.titleBar}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {images.length > 0 && (
          <>
            <Image
              source={{ uri: `http://localhost:8080/images/${images[0]}` }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={() => setPhotosModalVisible(true)}>
              <Text style={styles.viewMorePhotos}>Ver más fotos</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.content}>
          <Text style={styles.subTitle}>{beds} camas - {bedrooms} dormitorios - 2 baños</Text>

          {owner && (
            <View style={styles.ownerSection}>
              <TouchableOpacity onPress={() => handleUserPress(owner.user.id)}>
                <Image
                  source={{ uri: `http://localhost:8080/images/${owner.user.photo || 'default.jpg'}` }}
                  style={styles.ownerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.ownerName}>Dueño: {owner.user.firstName} {owner.user.lastName}</Text>
                <Text style={styles.ownerExperience}>{owner.experienceYears} años de experiencia</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Inquilinos actuales</Text>
          <ScrollView horizontal style={styles.tenantsRow}>
            {tenants.map((tenant, index) => (
              <TouchableOpacity key={index} onPress={() => handleUserPress(tenant.id)}>
                <Image
                  source={{ uri: `http://localhost:8080/images/${tenant.photo}` }}
                  style={styles.tenantPhoto}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{description}</Text>

          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Image source={require('../assets/images/map.jpg')} style={styles.mapImage} />

          <Text style={styles.sectionTitle}>Comentarios</Text>
          <View style={styles.commentBox}><Text>⭐ 3,5 - Apartamento pequeño pero bien ubicado.</Text></View>
          <View style={styles.commentBox}><Text>⭐ 5 - Todo perfecto, repetiría sin duda.</Text></View>

          <View style={styles.footer}>
            <Text style={styles.price}>{price}€/mes</Text>
            <TouchableOpacity onPress={initiatePaypalPayment}>
              <Text style={styles.payButton}>PAGAR CON PAYPAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL de FOTOS */}
      <Modal visible={photosModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `http://localhost:8080/images/${item}` }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / Dimensions.get('window').width
              );
              setCurrentImageIndex(index);
            }}
          />

          {/* Flechas */}
          {currentImageIndex > 0 && (
            <TouchableOpacity
              style={styles.arrowLeft}
              onPress={() => {
                const newIndex = currentImageIndex - 1;
                flatListRef.current?.scrollToIndex({ index: newIndex });
                setCurrentImageIndex(newIndex);
              }}
            >
              <Ionicons name="chevron-back-circle" size={40} color="#fff" />
            </TouchableOpacity>
          )}
          {currentImageIndex < images.length - 1 && (
            <TouchableOpacity
              style={styles.arrowRight}
              onPress={() => {
                const newIndex = currentImageIndex + 1;
                flatListRef.current?.scrollToIndex({ index: newIndex });
                setCurrentImageIndex(newIndex);
              }}
            >
              <Ionicons name="chevron-forward-circle" size={40} color="#fff" />
            </TouchableOpacity>
          )}

          <Text style={styles.imageCounter}>
            {currentImageIndex + 1} / {images.length}
          </Text>

          <TouchableOpacity style={styles.closeButton} onPress={() => setPhotosModalVisible(false)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL de acciones (ver perfil / chatear) */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Qué deseas hacer?</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setActionModalVisible(false);
                if (selectedUserId !== null) {
                  router.push({ pathname: '/(tabs)/profile', params: { id: selectedUserId } });
                } else {
                  Alert.alert('Error', 'Usuario no válido.');
                }
              }}
            >
              <Text style={styles.modalButtonText}>Ver perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setActionModalVisible(false);
                router.push({ pathname: '/private-chat', params: { id: selectedUserId } });
              }}
            >
              <Text style={styles.modalButtonText}>Chatear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActionModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#102437',
    alignItems: 'center',
  },
  titleBar: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainImage: {
    width: '100%',
    height: 220,
  },
  viewMorePhotos: {
    color: '#A8DADC',
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
  },
  content: { padding: 20 },
  subTitle: { color: '#AFC1D6', marginBottom: 10 },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  ownerName: { color: '#E0E1DD', fontWeight: 'bold' },
  ownerExperience: { color: '#AFC1D6' },
  sectionTitle: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  tenantsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tenantPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  description: { color: '#E0E1DD' },
  mapImage: { width: '100%', height: 150, borderRadius: 10 },
  commentBox: {
    backgroundColor: '#E0E1DD',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  price: { backgroundColor: '#fff', padding: 10, borderRadius: 10 },
  payButton: {
    backgroundColor: '#ffc439',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  arrowLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  arrowRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#0D1B2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#E0E1DD',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalCancel: {
    color: '#AFC1D6',
    textAlign: 'center',
    marginTop: 10,
  },
});
