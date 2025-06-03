// AccommodationDetailsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, FlatList,
  Alert, Linking, TouchableOpacity, Modal, Dimensions,
  TextInput,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from './api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import StarRating from '@/components/StarRating';
import Icon from 'react-native-vector-icons/FontAwesome';
import storage from '../utils/storage';

export default function AccommodationDetailsScreen() {
  const { id, title, beds, bedrooms, price, startDate, endDate, isVerified } = useLocalSearchParams();
  const [owner, setOwner] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const router = useRouter();
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [comments, setComments] = useState<{ text: string; rating: number; student?: { user?: { firstName: string; lastName: string } } }[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [zone, setZone] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageZoomVisible, setImageZoomVisible] = useState(false);
  const [filterError, setFilterError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [hasBookedThisAcc, sethasBookedThisAcc] = useState(false);
  const [datesSetFromTenantsSection, setDatesSetFromTenantsSection] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [stayRange, setStayRange] = useState({
    startDate: startDate as string | null,
    endDate: endDate as string | null,
  });
  
  const [tempStartDate, setTempStartDate] = useState(stayRange.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(stayRange.endDate || '');
  const [addressInfo, setAddressInfo] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  interface StudentProfileDTO {
    id: number;
    username?: string;
    photo?: string;
    userId: number;
  }
  const [pastTenants, setPastTenants] = useState<StudentProfileDTO[]>([]);

  const bannedWords = ['puta', 'gilipollas', 'cabron', 'mierda', 'idiota', 
    'estúpido', 'tonto', 'coño', 'hijo de puta', 'pendejo', 
    'imbécil', 'maldito', 'puto', 'zorra', 'maricón', 'putita', 'putón']; 

  const containsBannedWord = (text: string): boolean => {
    return bannedWords.some(word => text.toLowerCase().includes(word));
  };

  function formatToSpanish(dateStr: string): string {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }
  
  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }
  
  function toBackendFormatIfNeeded(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const [dd, mm, yyyy] = date.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }  
  
const checkAlreadyLiving = async () => {
  try {
    const token = await storage.getItem('jwt');
    const res = await api.get(`/accommodations/${id}/students`, {
      params: {
        startDate: toBackendFormatIfNeeded(stayRange.startDate!),
        endDate: toBackendFormatIfNeeded(stayRange.endDate!)
      },      
      headers: { Authorization: `Bearer ${token}` },
    });
    const alreadyTenant = res.data.some((s: any) => s.id === currentUserId);
    sethasBookedThisAcc(alreadyTenant);
  } catch (err) {
    console.error('Error comprobando si ya resides en el alojamiento', err);
  }
};

  useEffect(() => {
    findAccommodation();
    fetchPastTenants();
    if (stayRange.startDate && stayRange.endDate) {
      loadTenants();
      checkAlreadyLiving();
    }
    findComments();
    fetchAverageRating();  
    if (latitude && longitude) {
      fetchZoneFromCoordinates(latitude, longitude);
    }
  }, [latitude, longitude, stayRange, averageRating]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = await storage.getItem('jwt');
      const res = await api.get('/users/auth/current-user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUserId(res.data.user.id);
      if (res.data.user.id === owner?.user?.id) {
        setIsOwner(true);
      }
    };
    fetchCurrentUser();
  }, [owner]);

  const findComments = async () => {
    try { 
      const token = await storage.getItem('jwt');
      const response = await api.get(`/comments/accomodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
    }
    catch (error) { 
      console.error('Error buscando comentarios', error);
    }
  }; 

  const fetchZoneFromCoordinates = async (lat: any, lon: any) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=15&addressdetails=1`, {
        headers: {
          'User-Agent': 'MyStudentApp/1.0'
        }
      });
      const data = await response.json();
      const address = data.address;
      const zoneName = address.suburb || address.neighbourhood || address.city || address.town || 'Zona desconocida';
      setZone(zoneName);
    } catch (error) {
      console.error('Error obteniendo zona:', error);
      setZone('Zona desconocida');
    }
  };

  const fetchStreetType = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=17&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MyStudentApp/1.0'
          }
        }
      );
      const data = await response.json();
      const addr = data.address;
  
      const possibleFields = ['road', 'pedestrian', 'footway', 'cycleway', 'street'];
      const found = possibleFields.find(field => addr[field]);
      if (found) {
        const raw = addr[found];
        const sinNumero = raw.replace(/\d+.*$/, '').trim();
        setAddressInfo(sinNumero);
      } else {
        setAddressInfo(null);
      }
    } catch (err) {
      console.error('Error obteniendo tipo de vía:', err);
      setAddressInfo(null);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get(`/comments/accomodations/${id}/average`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAverageRating(response.data ?? null);
    } catch (error) {
      console.error('Error al obtener media de valoración:', error);
    }
  };

  const showFilterError = (msg: string) => {
    if (Platform.OS === 'web') {
      setFilterError(msg);
    } else {
      Alert.alert('Error en los filtros', msg);
    }
  };
  
  const makeComment = async () => {
    setFilterError('');
    if (rating < 1 || rating > 5) {
      console.log('Puntuación inválida:', rating);
      showFilterError('Puntuación inválida. Selecciona una puntuación entre 1 y 5 estrellas.');
      return;
    }
    
    if (text.trim().length < 5) {
      console.log('Comentario demasiado corto:', text);
      showFilterError('Comentario demasiado corto. Por favor, escribe un comentario más detallado.');
      return;
    }

    if (containsBannedWord(text)) {
      showFilterError('Tu comentario contiene palabras inapropiadas. Por favor, modifícalo.');
      return;
    }
    
    try {
      const token = await storage.getItem('jwt');

      const sanitizedText = text.trim().replace(/[<>$%&]/g, '');

      const commentData = {
        text: sanitizedText,
        rating: rating,
      };
      
      const response = await api.post(`/comments/accomodations/${id}`, commentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizar la lista de comentarios
      const updatedComments = [...comments, response.data];
      setComments(updatedComments);
      
      // Calcular la nueva media manualmente
      const totalRating = updatedComments.reduce((sum, comment) => sum + comment.rating, 0);
      const newAverage = totalRating / updatedComments.length;
      setAverageRating(newAverage);

      setCommentModalVisible(false);
      setText('');
      setRating(0);

    } catch (error) {
      console.error('Error al crear alojamiento:', error);
      Alert.alert('Error', 'No se pudo crear el alojamiento');
    }
  }; 

  const findAccommodation = async () => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get(`/accommodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwner(response.data.owner);
      setDescription(response.data.description);
      setImages(response.data.images || []);
      if (response.data.images && response.data.images.length > 0) {
        setSelectedImage(response.data.images[0]);
      }      
      setLatitude(response.data.latitud);
      setLongitude(response.data.longitud);
      fetchStreetType(response.data.latitud, response.data.longitud);
    } catch (error) {
      console.error('Error buscando alojamiento', error);
    }
  };

  const handleReservationConfirm = (start: string, end: string) => {
    if (!start || !end) {
      showFilterError('Debes introducir ambas fechas.');
      return;
    }
  
    const isValidDate = (date: string) => /^\d{2}-\d{2}-\d{4}$/.test(date);
    if (!isValidDate(start) || !isValidDate(end)) {
      showFilterError('Formato de fecha inválido. Usa DD-MM-YYYY.');
      return;
    }
  
    const range = { startDate: start, endDate: end };
    setStayRange(range);
    setConfirmModalVisible(false);
    initiatePaypalPaymentWithRange(range);
  };

const fetchPastTenants = async () => {
  try {
    const token = await storage.getItem('jwt');
    const response = await api.get(`/bookings/${id}/get-accommodation-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPastTenants(response.data);
    console.log('Past tenants:', response.data);
  } catch (error) {
    console.error('Error al cargar el historial de inquilinos', error);
  }
};

  const loadTenants = async () => {
    if (!stayRange.startDate || !stayRange.endDate) {
      return; 
    }
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get(`/accommodations/${id}/students`, {
        params: {
          startDate: toBackendFormatIfNeeded(stayRange.startDate!),
          endDate: toBackendFormatIfNeeded(stayRange.endDate!)
        },        
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Tenants:', response.data);
      setTenants(response.data);
    } catch (err) {
      console.error('Error cargando inquilinos', err);
    }
  };

  const initiatePaypalPaymentWithRange = async (range: { startDate: string; endDate: string }) => {
    const token = await storage.getItem('jwt');
    try {
      const isAvailable = await api.get(`/accommodations/${id}/check-availability`, {
        params: {
          startDate: toBackendFormatIfNeeded(range.startDate),
          endDate: toBackendFormatIfNeeded(range.endDate)
        },
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.data);
  
      if (!isAvailable) {
        showFilterError('Sin plazas. No hay plazas disponibles.');
        return;
      }
  
      const [startDay, startMonth, startYear] = range.startDate.split('-').map(Number);
      const [endDay, endMonth, endYear] = range.endDate.split('-').map(Number);

      const start = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);
      const diffInMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

      let basePrice = 0;
      if (start.getDate() === end.getDate() && months > 0) {
        basePrice = months * Number(price);
      } else {
        basePrice = days * (Number(price) / 30);
      }
  
      const totalPrice = Math.round(basePrice * 1.02 * 100) / 100;

      // Guardamos información relevante para recuperarla después del pago con PayPal
      await storage.session.setItem("acc_id", id as string);
      await storage.session.setItem("startDate", toBackendFormatIfNeeded(range.startDate));
      await storage.session.setItem("endDate", toBackendFormatIfNeeded(range.endDate));

      // Crear el returnUrl teniendo en cuenta si es web o nativo
      let returnUrl = '';
      if (Platform.OS === 'web') {
        const baseUrl = window.location.origin || 'http://localhost:8081';
        returnUrl = `${baseUrl}/payment-success?id=${id}&startDate=${toBackendFormatIfNeeded(range.startDate)}&endDate=${toBackendFormatIfNeeded(range.endDate)}`;
      } else {
        // En nativo usamos un esquema URI personalizado
        returnUrl = `exp://payment-success?id=${id}&startDate=${toBackendFormatIfNeeded(range.startDate)}&endDate=${toBackendFormatIfNeeded(range.endDate)}`;
      }

      const response = await api.post('/payments/paypal/create', null, {
        params: {
          amount: totalPrice,
          currency: 'EUR',
          description: `Reserva alojamiento ID ${id} del ${formatToSpanish(range.startDate)} al ${formatToSpanish(range.endDate)}`,
          returnUrl
        },
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.approvalUrl) {
        Linking.openURL(response.data.approvalUrl);
      } else {
        Alert.alert('Error', 'No se pudo obtener el enlace de pago.');
      }
    } catch (error) {
      console.error('Error al iniciar el pago:', error);
      Alert.alert('Error', 'No se pudo iniciar el pago.');
    }
  };

  const handleUserPress = (userId: number, username: string | null = null) => {
    console.log('User ID:', userId);
    console.log('Username:', username);
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setActionModalVisible(true);
    setFilterError('');
  };

  const handleUserPressOldTenants = async (userId: number) => {
    try {
      console.log('User ID:', userId);
      setSelectedUserId(userId);
      setSelectedUsername('tenant'); // Establecemos un valor no nulo para indicar que tiene cuenta
      setActionModalVisible(true);
      setFilterError('');
    } catch (error) {
      console.error('Error al manejar el clic en usuario:', error);
    }
  };

  return (
    <View style={styles.container}>
<LinearGradient colors={['#0D1B2A', '#1B263B']} style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E0E1DD" />
        </TouchableOpacity>
        <Text style={styles.titleBar}>{title}</Text>
        {typeof averageRating === 'number' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.rating}>⭐ {averageRating.toFixed(1)} / 5</Text>
          </View>
        ) : (
          <Text style={styles.rating}>⭐ Sin valoraciones</Text>
        )}

        <View style={{ width: 36 }} />
        </LinearGradient>

      <ScrollView>
      {selectedImage && (
  <>
    <TouchableOpacity onPress={() => setImageZoomVisible(true)}>
      <Image
        source={{ uri: selectedImage }}
        style={styles.mainImage}
        resizeMode="cover"
      />
    </TouchableOpacity>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
      {images.map((img, index) => (
        <TouchableOpacity key={index} onPress={() => setSelectedImage(img)}>
          <Image
            source={{ uri: img }}
            style={[
              styles.thumbnail,
              selectedImage === img && styles.thumbnailSelected,
            ]}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
)}
        <View style={styles.content}>
          <Text style={styles.subTitle}>{beds} camas - {bedrooms} dormitorios - 2 baños</Text>
          {(isVerified === 'true' || isVerified === 'true'.toString()) && (
            <View style={styles.verifiedChip}>
              <Ionicons name="shield-checkmark" size={16} color="#0D1B2A" />
              <Text style={styles.verifiedChipText}>Alojamiento verificado</Text>
            </View>
          )}
          {owner && (
            <View style={styles.ownerSection}>
              <TouchableOpacity onPress={() => handleUserPress(owner.user.id, owner.user.username)}>
                <Image
                  source={{ uri: `https://restapart.onrender.com/images/${owner.user.photo || 'default.jpg'}` }}
                  style={styles.ownerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.ownerName}>Dueño: {owner.user.firstName} {owner.user.lastName}</Text>
                <Text style={styles.ownerExperience}>{owner.experienceYears} años de experiencia</Text>
              </View>
              {isOwner && (
  <View style={{ flexDirection: 'row', marginTop: 10 }}>
    <TouchableOpacity
      style={[styles.addCommentButton, { backgroundColor: '#1B9AAA', marginRight: 10 }]}
      onPress={() => router.push({ pathname: '/edit-accommodation', params: { id } })}
    >
      <Text style={styles.addCommentButtonText}>Editar</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.addCommentButton, { backgroundColor: '#E63946' }]}
      onPress={async () => {
        try {
          const token = await storage.getItem('jwt');
          await api.delete(`/accommodations/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (Platform.OS === 'web') {
            setFilterError('Alojamiento eliminado.');
          } else {
            Alert.alert('Éxito', 'Alojamiento eliminado');
          }
          router.replace('/(tabs)/welcome-screen');
        } catch (err) {
          console.error('Error eliminando alojamiento', err);
          if (Platform.OS === 'web') {
            setFilterError('Error eliminando alojamiento.');
          } else {
            Alert.alert('Error', 'No se pudo eliminar el alojamiento.');
          }
        }
      }}
    >
      <Text style={styles.addCommentButtonText}>Eliminar</Text>
    </TouchableOpacity>
  </View>
)}

            </View>
          )}

          <Text style={styles.sectionTitle}>Inquilinos actuales</Text>
          {isOwner ? (
          <View style={[styles.card, { borderColor: '#1B9AAA', borderWidth: 1 }]}>
            <Text style={{ color: '#AFC1D6', fontSize: 15 }}>
              Puedes ver los inquilinos alojados desde la pestaña{" "}
              <Text style={{ fontWeight: 'bold' }}>"❤️"</Text>
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/favorites-or-students')}
              style={[styles.addCommentButton, { marginTop: 15, alignSelf: 'center' }]}
            >
              <Text style={styles.addCommentButtonText}>Ir a mis estudiantes</Text>
            </TouchableOpacity>
          </View>
          
        ) : (
          !stayRange.startDate || !stayRange.endDate ? (
            <View style={[styles.card, { marginTop: 0, borderColor: '#A8DADC', borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="calendar-outline" size={20} color="#E63946" style={{ marginRight: 6 }} />
              <Text style={{ color: '#E63946', fontWeight: 'bold', fontSize: 15 }}>
                Introduce fechas para ver los inquilinos actuales
              </Text>
            </View>

            <TextInput
              style={styles.input2}
              placeholder="Fecha de inicio (DD-MM-YYYY)"
              placeholderTextColor="#AFC1D6"
              value={tempStartDate}
              onChangeText={setTempStartDate}
            />
            <TextInput
              style={styles.input2}
              placeholder="Fecha de fin (DD-MM-YYYY)"
              placeholderTextColor="#AFC1D6"
              value={tempEndDate}
              onChangeText={setTempEndDate}
            />

            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => {
                const isValidDate = (date: string) => /^\d{2}-\d{2}-\d{4}$/.test(date);
                if (!tempStartDate || !tempEndDate) {
                  showFilterError('Debes introducir ambas fechas.');
                  return;
                }
                if (!isValidDate(tempStartDate) || !isValidDate(tempEndDate)) {
                  showFilterError('Formato de fecha inválido. Usa DD-MM-YYYY.');
                  return;
                }

                const [startDay, startMonth, startYear] = tempStartDate.split('-').map(Number);
                const [endDay, endMonth, endYear] = tempEndDate.split('-').map(Number);

                const start = new Date(startYear, startMonth - 1, startDay);
                const end = new Date(endYear, endMonth - 1, endDay);
                if (start >= end) {
                  showFilterError('La fecha de inicio debe ser anterior a la de fin.');
                  return;
                }

                setStayRange({ startDate: tempStartDate, endDate: tempEndDate });
                setDatesSetFromTenantsSection(true);
                loadTenants();
              }}
            >
              <Text style={styles.addCommentButtonText}>Buscar inquilinos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal style={styles.tenantsRow}>
        {tenants.map((tenant, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleUserPress(tenant.userId, tenant.username)}
          >
            <Image
              source={{ uri: `https://restapart.onrender.com/images/${tenant.photo}` }}
              style={styles.tenantPhoto}
            />
          </TouchableOpacity>
        ))}
        </ScrollView>
        )
        )}

        {pastTenants.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E0E1DD', marginBottom: 8 }}>
            Historial de inquilinos
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pastTenants.map((tenant, index) => (
              console.log(tenant),
          <TouchableOpacity
            key={index}
            onPress={() => handleUserPressOldTenants(tenant.userId?? null)}
          >
            <Image
              source={{ uri: `https://restapart.onrender.com/images/${tenant.photo}` }}
              style={styles.tenantPhoto}
            />
          </TouchableOpacity>
        ))}
          </ScrollView>
        </View>
      )}


          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{description}</Text>

          {zone !== '' && (
              <View style={styles.zoneContainer}>
                <Ionicons name="location-outline" size={18} color="#A8DADC" style={{ marginRight: 6 }} />
                <Text style={styles.zoneText}>Zona: {zone}</Text>
              </View>
            )}
            {addressInfo && (
  <Text style={[styles.zoneText, { marginTop: 5 }]}>
    Situado en: {addressInfo} (ubicación aproximada por privacidad)
  </Text>
)}

            <Text style={styles.sectionTitle}>Comentarios</Text>
            {comments.map((comment, index) => (
              <View key={index} style={styles.commentBox}>
                <Text style={styles.commentAuthor}>
                  {comment.student?.user?.firstName} {comment.student?.user?.lastName}
                </Text>
                <Text>{comment.text}</Text>
                <Text>⭐ {comment.rating}</Text>
              </View>
            ))}
          {!isOwner && (
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={() => setCommentModalVisible(true)}
          >
            <Text style={styles.addCommentButtonText}>Añadir Comentario</Text>
          </TouchableOpacity>
          )}
          <View style={styles.footer}>
            <Text style={styles.price}>{price}€/mes</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalBackground2}>
          <View style={styles.modalBox2}>
            <Text style={styles.modalTitle2}>Confirmar Reserva</Text>
            {!datesSetFromTenantsSection && (

            <><Text style={styles.modalLabel}>Fecha de inicio</Text><TextInput
                style={styles.input}
                placeholder="DD-MM-YYYY"
                value={tempStartDate}
                onChangeText={setTempStartDate} /><Text style={styles.modalLabel}>Fecha de fin</Text><TextInput
                  style={styles.input}
                  placeholder="DD-MM-YYYY"
                  value={tempEndDate}
                  onChangeText={setTempEndDate} /></>
            )}

          {tempStartDate && tempEndDate && (
            <>
              <Text style={{ color: '#0D1B2A', fontWeight: 'bold', marginTop: 10, textAlign: 'center' }}>
                Reserva del {formatToSpanish(tempStartDate)} al {formatToSpanish(tempEndDate)}
              </Text>
              {(() => {
                try {
                  const [startDay, startMonth, startYear] = tempStartDate.split('-').map(Number);
                  const [endDay, endMonth, endYear] = tempEndDate.split('-').map(Number);
                  const start = new Date(startYear, startMonth - 1, startDay);
                  const end = new Date(endYear, endMonth - 1, endDay);
                  const diffInMs = end.getTime() - start.getTime();
                  const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
                  if (days <= 0) return null;

                  let basePrice = 0;
                  if (days >= 30) {
                    const months = Math.floor(days / 30);
                    basePrice = months * Number(price);
                  } else {
                    basePrice = days * (Number(price) / 30);
                  }

                  const total = Math.round(basePrice * 1.02 * 100) / 100;
                  return (
                    <Text style={{ color: '#0D1B2A', fontWeight: 'bold', marginTop: 10 }}>
                      Precio estimado: {total} €
                    </Text>
                  );
                } catch {
                  return null;
                }
              })()}
            </>
          )}

            {filterError !== '' && (
              <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{filterError}</Text>
            )}

            <View style={styles.modalButtons}>
            <TouchableOpacity
            style={styles.modalButton2}
            onPress={() => {
                const finalStart = datesSetFromTenantsSection ? stayRange.startDate! : tempStartDate;
                const finalEnd = datesSetFromTenantsSection ? stayRange.endDate! : tempEndDate;

                const isValidDate = (date: string) => /^\d{2}-\d{2}-\d{4}$/.test(date);
                if (!finalStart || !finalEnd) {
                showFilterError('Debes introducir ambas fechas.');
                return;
                }
                if (!isValidDate(finalStart) || !isValidDate(finalEnd)) {
                showFilterError('Formato de fecha inválido. Usa DD-MM-YYYY.');
                return;
                }

                const [startDay, startMonth, startYear] = finalStart.split('-').map(Number);
                const [endDay, endMonth, endYear] = finalEnd.split('-').map(Number);

                const start = new Date(startYear, startMonth - 1, startDay);
                const end = new Date(endYear, endMonth - 1, endDay);
                if (start >= end) {
                showFilterError('La fecha de inicio debe ser anterior a la fecha de fin.');
                return;
                }

                handleReservationConfirm(finalStart, finalEnd);

            }}
          >
            <Text style={styles.modalButtonText2}>Confirmar y pagar</Text>
          </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText2}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalBackground2}>
          <View style={styles.modalBox2}>
            <Text style={styles.modalTitle2}>Añadir Comentario</Text>

            <TextInput
              style={styles.input}
              placeholder="Escribe tu comentario"
              placeholderTextColor="#AFC1D6"
              value={text}
              onChangeText={setText}
            />

            <Text style={styles.modalLabel}>Puntuación</Text>
            <StarRating rating={rating} onChange={setRating} />

            {filterError !== '' && (
              <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                {filterError}
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton2}
                onPress={makeComment}
              >
                <Text style={styles.modalButtonText2}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setCommentModalVisible(false);
                  setFilterError('');
                }}
                
              >
                <Text style={styles.modalButtonText2}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
  visible={imageZoomVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setImageZoomVisible(false)}
>
  <View style={styles.zoomContainer}>
    <Image
      source={{ uri: selectedImage || '' }}
      style={styles.zoomedImage}
      resizeMode="contain"
    />
    <TouchableOpacity style={styles.closeZoomButton} onPress={() => setImageZoomVisible(false)}>
      <Ionicons name="close-circle" size={36} color="#fff" />
    </TouchableOpacity>
  </View>
</Modal>
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Qué deseas hacer?</Text>

            {/* Mensaje si no tiene cuenta */}
            {!selectedUserId && (
              <Text style={styles.informativeTag}>🔒 Este estudiante no tiene cuenta. Solo puedes ver su perfil.</Text>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setActionModalVisible(false);
                if (selectedUserId === currentUserId) {
                  showFilterError('No puedes ver tu propio perfil desde aquí.');
                  return;
                }
                router.push({ pathname: '/(tabs)/profile', params: { id: selectedUserId } });
              }}
            >
              <Text style={styles.modalButtonText}>Ver perfil</Text>
            </TouchableOpacity>

            {selectedUserId && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setActionModalVisible(false);
                  if (selectedUserId === currentUserId) {
                    showFilterError('No puedes iniciar un chat contigo mismo.');
                    return;
                  }
                  router.push({ pathname: '/private-chat', params: { id: selectedUserId } });
                }}
              >
                <Text style={styles.modalButtonText}>Chatear</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                setActionModalVisible(false);
                setFilterError('');
              }}
            >
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {filterError !== '' && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {filterError}
        </Text>
      )}

      {!isOwner && !hasBookedThisAcc && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setConfirmModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-paypal" size={24} color="#0D1B2A" />
        </TouchableOpacity>
      )}

      {hasBookedThisAcc && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          Ya resides en este alojamiento.
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  viewMorePhotos: {
    color: '#A8DADC',
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: '#1B263B',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
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
  addCommentButton: {
    backgroundColor: '#A8DADC',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  addCommentButtonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    textAlign: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#AFC1D6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#0D1B2A',
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
  zoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#1B263B',
    padding: 10,
    borderRadius: 10,
  },
  zoneText: {
    color: '#E0E1DD',
    fontSize: 14,
    fontWeight: '500',
  }, 
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1B263B',
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#1B263B',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  titleBar: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rating: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#ffc439',
    padding: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  mainImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
  },
  thumbnailRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#A8DADC',
  },
  zoomContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '100%',
    height: '80%',
  },
  closeZoomButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  commentAuthor: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    marginBottom: 4,
  },  
  modalLabel: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    textAlign: 'center',
  },
  input2: {
    borderWidth: 1,
    borderColor: '#AFC1D6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#FFFFFF', 
  },
  informativeTag: {
    color: '#F1C40F',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
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
