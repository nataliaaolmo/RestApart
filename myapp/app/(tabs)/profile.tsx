import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../app/api';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useLayoutEffect } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import StarRating from '@/components/StarRating';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/components/firebaseConfig';


export default function ProfileScreen() {
  interface UserData {
    id: number;
    role: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
    gender: string;
    dateOfBirth: string;
    description: string;
    email: string;
    telephone: string;
    isSmoker: boolean;
    academicCareer: string;
    hobbies: string;
    experienceYears?: number;
    password?: string;
    isVerified?: boolean;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [editing, setEditing] = useState(false);
  type ProfileRouteProp = RouteProp<{ Profile: { id: string } }, 'Profile'>;
  const route = useRoute();
  const isViewingOwnProfile = !route?.params || !('id' in route.params);
  const userId = isViewingOwnProfile ? undefined : parseInt((route.params as any).id, 10);  
  const navigation = useNavigation();
  const [comments, setComments] = useState<{ text: string; rating: number; commentDate?: string; student?: { user?: { profilePicture?: string; firstName?: string; lastName?: string } } }[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const sanitizeInput = (text: string) => text.replace(/<script.*?>.*?<\/script>/gi, '').trim();
  const [saving, setSaving] = useState(false);
  const [filterError, setFilterError] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalTelephone, setOriginalTelephone] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const[isVerified, setIsVerified] = useState(false);
  const[studentId, setStudentId] = useState<number | null>(null);

  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  } 

  function formatToSpanish(dateStr: string): string {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }
  
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const url = userId ? `/users/${userId}` : '/users/auth/current-user';
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userId ? response.data : response.data.user;
      user.dateOfBirth = formatToSpanish(user.dateOfBirth);
      setUserData(user);
      setOriginalUsername(user.username);
      setOriginalEmail(user.email);
      setOriginalTelephone(user.telephone);
      setIsVerified(user.isVerified);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (filterError !== '') {
      const timer = setTimeout(() => setFilterError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [filterError]);  

  useEffect(() => {
    const idToUse = userId ?? currentUserId;
    if (idToUse) {
      findComments(idToUse);
    }
    const fetchAverage = async (id: number) => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await api.get(`/comments/users/${id}/average`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAverageRating(response.data ?? null);
      } catch (error) {
        console.error('Error al obtener media de comentarios', error);
      }
    };
  
    if (idToUse) {
      fetchAverage(idToUse);
    }

    const fetchStudent = async (id: number) => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await api.get(`/users/${id}/get-student`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Student ID:', response.data);
        setStudentId(response.data.id ?? null);
      } catch (error) {
        console.error('Error al obtener el id del estudiante', error);
      }
    };

    if (userData?.role === 'STUDENT' && currentUserId === userData.id) {
      fetchStudent(currentUserId);
    }
  }, [userId, currentUserId]);

  useEffect(() => {
  if (studentId !== null) {
    fetchBookings(studentId);
  }
}, [studentId]);


  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const token = localStorage.getItem('jwt');
      const response = await api.get('/users/auth/current-user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUserId(response.data.user.id);
    };
  
    fetchCurrentUserId();
  }, []);  

  useLayoutEffect(() => {
    if (userData) {
      const fullName = `${userData.firstName} ${userData.lastName}`;
      const screenTitle = isViewingOwnProfile ? 'Tu perfil' : `Perfil de ${fullName}`;
      navigation.setOptions({ title: screenTitle });
    }
  }, [userData]);

  const findComments = async (id: number) => {
    try { 
      const token = localStorage.getItem('jwt');
      const response = await api.get(`/comments/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
    }
    catch (error) { 
      console.error('Error buscando comentarios', error);
    }
  };

  const fetchBookings = async (id: number) => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await api.get(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Bookings:', res.data);
      setBookings(res.data);
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
    }
  };

    const showFilterError = (msg: string) => {
      if (Platform.OS === 'web') {
        setFilterError(msg);
      } else {
        Alert.alert('Error en los filtros', msg);
      }
    };

    const verifyAccommodationUser = async (accommodationId: number) => {
      try {
        const token = localStorage.getItem('jwt');
        await api.patch(`/accommodations/${accommodationId}/${currentUserId}/verify-accommodation`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showFilterError('Verificación enviada correctamente');
          if (studentId !== null) {
            fetchBookings(studentId);
          }
        checkIfAccommodationCanBeVerified(accommodationId);
      } catch (err) {
        console.error('Error al verificar alojamiento:', err);
        showFilterError('Error al verificar alojamiento');
      }
    };

    const checkIfAccommodationCanBeVerified = async (accommodationId: number) => {
        try {
          const token = localStorage.getItem('jwt');
          await api.patch(`/accommodations/${accommodationId}/verify-accommodation`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showFilterError('✅ Alojamiento marcado como verificado');
        } catch (err: any) {
          console.error('Verificación global fallida:', err);
          showFilterError('❌ Aún faltan verificaciones de otros usuarios');
        }
      };

        const handlePhoneVerification = async () => {
        try {
          if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
          }
          const appVerifier = window.recaptchaVerifier;
    
          const confirmation = await signInWithPhoneNumber(auth, '+34' + userData?.telephone, appVerifier);
          const code = prompt('Introduce el código SMS recibido');
          if (code) {
            await confirmation.confirm(code);
            setIsVerified(true);
            showFilterError('Teléfono verificado correctamente');
          }
    
        } catch (error) {
          console.error('Error verificando teléfono:', error);
          showFilterError('No se pudo verificar el número');
        }
      };
    
  
    const makeComment = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const formData = new FormData();
  
        const commentData = {
          text: text,
          rating: rating,
        };
  
        const response = await api.post(`/comments/users/${userId}`, commentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments([...comments, response.data]);
        setCommentModalVisible(false);
        setText('');
        setRating(0);
  
      } catch (error) {
        console.error('Error al crear alojamiento:', error);
        Alert.alert('Error', 'No se pudo crear el alojamiento');
      }
    }; 
  

  const handleImagePick = async () => {
    if (!editing) return;
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });
  
    console.log('ImagePicker result:', result);
  
    if (!result.canceled && result.assets.length > 0) {
      const imageAsset = result.assets[0];
  
      const formData = new FormData();
  
      if (imageAsset.file) {
        console.log('Using imageAsset.file directly');
        formData.append('file', imageAsset.file);
      } else {
        const localUri = imageAsset.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
  
        console.log('Using imageAsset.uri:', localUri);
  
        formData.append('file', {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }
  
      try {
        const token = localStorage.getItem('jwt');
  
        const uploadResponse = await fetch('http://localhost:8080/api/users/upload-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
  
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Error al subir foto de perfil:', errorText);
          Alert.alert('Error', 'No se pudo subir la foto de perfil');
          return;
        }
  
        const filename = await uploadResponse.text();
        setUserData(prev => prev ? { ...prev, profilePicture: filename } : null);
        Alert.alert('Foto de perfil actualizada');
  
      } catch (err) {
        console.error('Excepción al subir foto:', err);
        Alert.alert('Error', 'No se pudo subir la foto');
      }
    }
  }; 
  
  const checkIfExists = async (field: 'username' | 'email' | 'telephone', value: string) => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await api.get(`/users/check?field=${field}&value=${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.exists;
    } catch (err) {
      console.error(`Error verificando duplicado en ${field}:`, err);
      return false;
    }
  };
  function calculateAge(dateStr: string): number {
    const [day, month, year] = dateStr.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!hasHadBirthdayThisYear) {
      age--;
    }
    return age;
  }  
  
  const saveChanges = async () => {
    if (!userData) return;
    if (saving) return;
    setSaving(true);
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{7,15}$/;
  
    if (!userData.firstName.trim() || !userData.lastName.trim() || !userData.username.trim()) {
      showFilterError('Error. Nombre, apellido y usuario son obligatorios');
      setSaving(false);
      return;
    }
    if (!emailRegex.test(userData.email)) {
      showFilterError('Error. Email no válido');
      setSaving(false);
      return;
    }
    if (!phoneRegex.test(userData.telephone)) {
      showFilterError('Error. Teléfono no válido');
      setSaving(false);
      return;
    }
  
    const isUsernameTaken = await checkIfExists('username', userData.username);
    if (isUsernameTaken && (userData.username !== originalUsername || userData.id !== currentUserId)) {
      showFilterError('El nombre de usuario ya está en uso');
      setSaving(false);
      return;
    }
  
    const isEmailTaken = await checkIfExists('email', userData.email);
    if (isEmailTaken && (userData.email !== originalEmail || userData.id !== currentUserId)) {
      showFilterError('El email ya está en uso');
      setSaving(false);
      return;
    }
  
    const isPhoneTaken = await checkIfExists('telephone', userData.telephone);
    if (isPhoneTaken && (userData.telephone !== originalTelephone || userData.id !== currentUserId)) {
      showFilterError('El teléfono ya está en uso');
      setSaving(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('jwt');
      const updatedUser = {
        username: sanitizeInput(userData.username),
        password: userData.password || 'Temp1234*',
        email: sanitizeInput(userData.email),
        firstName: sanitizeInput(userData.firstName),
        lastName: sanitizeInput(userData.lastName),
        telephone: sanitizeInput(userData.telephone),
        dateOfBirth: convertToBackendFormat(userData.dateOfBirth),
        gender: userData.gender,
        description: sanitizeInput(userData.description),
        profilePicture: userData.profilePicture,
        role: userData.role,
        isVerified: userData.isVerified,
        experienceYears: userData.role === 'OWNER' ? userData.experienceYears : null,
        academicCareer: userData.role === 'STUDENT' ? sanitizeInput(userData.academicCareer) : null,
        hobbies: userData.role === 'STUDENT' ? sanitizeInput(userData.hobbies) : null,
        isSmoker: userData.role === 'STUDENT' ? userData.isSmoker : null,

      };
      console.log('Updated user data:', updatedUser);
      const res = await api.put(`/users/${userData.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setUserData(res.data);
      setEditing(false);
      fetchProfile();
      Alert.alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error al actualizar perfil');
    }
  };

  if (!userData) return <Text style={styles.loadingText}>Cargando perfil...</Text>;

  const isStudent = userData.role === 'STUDENT';
  const fullName = `${userData.firstName} ${userData.lastName}`;
  const screenTitle = userId ? `Perfil de ${fullName}` : 'Tu perfil';

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity disabled={!editing} onPress={handleImagePick}>
      <Image
        source={{ uri: userData.profilePicture?.startsWith('http') 
          ? userData.profilePicture 
          : `http://localhost:8080/images/${userData.profilePicture || 'default.jpg'}` 
        }}
        style={styles.profileImage}
      />

      </TouchableOpacity>
      <Text style={styles.screenTitle}>{screenTitle}</Text>
      {Platform.OS === 'web' && filterError !== '' && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          {filterError}
        </Text>
      )}

      {editing && !userId ?  (
        <>
          <TextInput style={styles.input} value={userData.firstName} onChangeText={(text) => setUserData(prev => prev ? { ...prev, firstName: text } : null)} placeholder="Nombre" />
          <TextInput style={styles.input} value={userData.lastName} onChangeText={(text) => setUserData(prev => prev ? { ...prev, lastName: text } : null)} placeholder="Apellido" />
          <TextInput style={styles.input} value={userData.username} onChangeText={(text) => setUserData(prev => prev ? { ...prev, username: text } : null)} placeholder="Usuario" />
          <TextInput style={styles.input} value={userData.email} onChangeText={(text) => setUserData(prev => prev ? { ...prev, email: text } : null)} placeholder="Email" />
          <TextInput style={styles.input} value={userData.telephone} onChangeText={(text) => setUserData(prev => prev ? { ...prev, telephone: text } : null)} placeholder="Teléfono" />
          <TextInput style={styles.input} value={userData.dateOfBirth} onChangeText={(text) => setUserData(prev => prev ? { ...prev, dateOfBirth: text } : null)} placeholder="Fecha de nacimiento (DD-MM-YYYY)" />
          <TextInput style={styles.input} value={userData.gender} onChangeText={(text) => setUserData(prev => prev ? { ...prev, gender: text } : null)} placeholder="Género (MAN/WOMAN)" />
          <TextInput style={styles.input} value={userData.description} onChangeText={(text) => setUserData(prev => prev ? { ...prev, description: text } : null)} placeholder="Descripción" />

        {userData.role === 'STUDENT' && (
          <>
            <TextInput
              style={styles.input}
              value={userData.academicCareer}
              onChangeText={(text) =>
                setUserData(prev => prev ? { ...prev, academicCareer: text } : null)
              }
              placeholder="Carrera"
            />
            <TextInput
              style={styles.input}
              value={userData.hobbies}
              onChangeText={(text) =>
                setUserData(prev => prev ? { ...prev, hobbies: text } : null)
              }
              placeholder="Aficiones"
            />
            <TextInput
              style={styles.input}
              value={userData.isSmoker ? 'true' : 'false'}
              onChangeText={(text) =>
                setUserData(prev => prev ? { ...prev, isSmoker: text === 'true' } : null)
              }
              placeholder="¿Fumador? (true/false)"
            />
          </>
        )}

        {userData.role === 'OWNER' && (
          <TextInput
            style={styles.input}
            value={userData.experienceYears?.toString() || ''}
            onChangeText={(text) =>
              setUserData(prev => prev ? { ...prev, experienceYears: parseInt(text) || 0 } : null)
            }
            placeholder="Años de experiencia"
          />
        )}

          {!userId && (
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
           </TouchableOpacity>
          )}

        </>
      ) : (
        <>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={styles.name}>
            {fullName} - <Text style={styles.username}>@{userData.username}</Text>
          </Text>
          {userData.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" size={18} color="#A8DADC" style={{ marginLeft: 6 }} />
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          )}
        </View>
          {typeof averageRating === 'number' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 18, color: i <= Math.round(averageRating || 0) ? '#FFD700' : '#ccc' }}>★</Text>
              ))}
              <Text style={{ color: '#FFD700', marginLeft: 5 }}>{averageRating?.toFixed(1) ?? '0.0'}</Text>
            </View>
          ) : (
            <Text style={styles.rating}>⭐ Sin valoraciones</Text>
          )}
              <Text style={styles.detail}>
      {userData.gender === 'WOMAN' ? 'Mujer' : 'Hombre'} -{' '}
      {calculateAge((userData.dateOfBirth))} años
    </Text>

          {userId && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#AFC1D6', marginTop: 10 }]}
            onPress={() => router.push({ pathname: '/private-chat', params: { id: userData?.id } })}
          >
            <Text style={[styles.saveButtonText, { color: '#0D1B2A' }]}>Enviar mensaje</Text>
          </TouchableOpacity>
        )}

{isStudent ? (
  <>
    <Text style={styles.description}>{userData.description}</Text>

    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Datos de contacto</Text>
      <View style={styles.row}>
        <Icon name="mail" size={18} color="#AFC1D6" style={styles.icon} />
        <Text style={styles.text}>{userData.email}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="phone" size={18} color="#AFC1D6" style={styles.icon} />
        <Text style={styles.text}>{userData.telephone}</Text>
      </View>
    </View>

    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Más información</Text>
      <View style={styles.row}>
        <Icon name={userData.isSmoker ? 'smile' : 'slash'} size={18} color="#AFC1D6" style={styles.icon} />
        <Text style={styles.text}>{userData.isSmoker ? 'Fumador/a' : 'No fumador/a'}</Text>
      </View>
      <View style={styles.row}>
        <Icon name="book-open" size={18} color="#AFC1D6" style={styles.icon} />
        <Text style={styles.text}>{userData.academicCareer}</Text>
      </View>
      <View style={[styles.row, { alignItems: 'flex-start' }]}>
        <Icon name="heart" size={18} color="#AFC1D6" style={styles.icon} />
        <View style={{ flex: 1 }}>
          {userData.hobbies?.split(',').map((hobby, index) => (
            <Text key={index} style={styles.text}>{hobby.trim()}</Text>
          ))}
        </View>
      </View>
    </View>
  </>
) : (
            <>
            <Text style={styles.description}>{userData.description}</Text>
        
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Datos de contacto</Text>
              <View style={styles.row}>
                <Icon name="mail" size={18} color="#AFC1D6" style={styles.icon} />
                <Text style={styles.text}>{userData.email}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="phone" size={18} color="#AFC1D6" style={styles.icon} />
                <Text style={styles.text}>{userData.telephone}</Text>
              </View>
            </View>
        
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Más información</Text>
              <View style={styles.row}>
                <Icon name="briefcase" size={18} color="#AFC1D6" style={styles.icon} />
                <Text style={styles.text}>{userData.experienceYears} años de experiencia</Text>
              </View>
              <View style={styles.row}>
                <Icon name="calendar" size={18} color="#AFC1D6" style={styles.icon} />
                <Text style={styles.text}>
                Fecha de nacimiento: {userData.dateOfBirth}
                </Text>
              </View>
              <View style={styles.row}>
                <Icon name="user" size={18} color="#AFC1D6" style={styles.icon} />
                <Text style={styles.text}>Género: {userData.gender === 'WOMAN' ? 'Mujer' : 'Hombre'}</Text>
              </View>
            </View>
          </>
        )}
        </>
      )}
<View style={{ marginTop: 30 }}>
  <Text style={styles.sectionTitle}>Comentarios</Text>
  {comments.length > 0 ? (
    comments.map((comment, index) => (
      <View key={index} style={styles.commentBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          {comment.student?.user?.profilePicture && (
            <Image
              source={{ uri: `http://localhost:8080/images/${comment.student.user.profilePicture}` }}
              style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
            />
          )}
          <View>
            <Text style={styles.commentAuthor}>
              {comment.student?.user?.firstName} {comment.student?.user?.lastName}
            </Text>
            <Text style={styles.commentDate}>
            {comment.commentDate
            ? new Date(comment.commentDate).toLocaleDateString('es-ES')
            : 'Fecha no disponible'}
            </Text>
          </View>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <Text style={styles.commentRating}>⭐ {comment.rating}</Text>
      </View>
    ))
  ) : (
    <Text style={styles.noComments}>Todavía no hay valoraciones</Text>
  )}
</View>

      {userId && (
              <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => setCommentModalVisible(true)}
            >
              <Text style={styles.addCommentButtonText}>Añadir Comentario</Text>
            </TouchableOpacity>
          )}

       {currentUserId === userData.id && userData.role === 'STUDENT' && ( 
        <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mis reservas</Text>
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <View key={index} style={styles.bookingCard}>
              <View style={styles.bookingItemRow}>
                <Icon name="home" size={18} color="#AFC1D6" style={styles.bookingIcon} />
                <Text style={styles.bookingText}>
                  {booking.bookingName || 'Alojamiento'}
                </Text>
              </View>
              <View style={styles.bookingItemRow}>
                <Icon name="calendar" size={18} color="#AFC1D6" style={styles.bookingIcon} />
                <Text style={styles.bookingText}>
                {(booking.startDate)} → {(booking.endDate)}
                </Text>
              </View>
              <View style={styles.bookingItemRow}>
                <Icon name="dollar-sign" size={18} color="#AFC1D6" style={styles.bookingIcon} />
                <Text style={styles.bookingText}>{booking.price} €</Text>
              </View>
              {!booking.isVerified && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => verifyAccommodationUser(booking.accommodationId)}
              >
                <Text style={styles.buttonText}>Verificar alojamiento</Text>
              </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#AFC1D6' }]}
                onPress={() => router.push({ pathname: '/accommodation-details', params: { id: booking.accommodationId } })}
              >
                <Text style={styles.buttonText}>Ver detalles del alojamiento</Text>
              </TouchableOpacity>

            </View>
          ))
        ) : (
          <Text style={styles.noComments}>No tienes reservas activas</Text>
        )}
      </View>
       )}

        {!userId && currentUserId === userData.id && (
          <TouchableOpacity style={styles.saveButton} onPress={() => setEditing(true)}>
            <Text style={styles.saveButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        )}

        {!userId && currentUserId === userData.id && isVerified === false && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#1B9AAA' }]}
          onPress={handlePhoneVerification}
        >
          <Text style={styles.buttonText}>Verificar número por SMS</Text>
        </TouchableOpacity>
        )}

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
          onPress={async () => {
            setFilterError('');
            if (rating < 1 || rating > 5) {
              showFilterError('Puntuación inválida. Selecciona una puntuación entre 1 y 5 estrellas.');
              return;
            }
            if (text.trim().length < 5) {
              showFilterError('Comentario demasiado corto. Por favor, escribe un comentario más detallado.');
              return;
            }

            try {
              const token = localStorage.getItem('jwt');
              const sanitizedText = text.trim().replace(/[<>$%&]/g, '');

              const commentData = {
                text: sanitizedText,
                rating: rating,
              };

              const response = await api.post(`/comments/users/${userId}`, commentData, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setComments([...comments, response.data]);
              setCommentModalVisible(false);
              setText('');
              setRating(0);
            } catch (error) {
              console.error('Error al comentar perfil:', error);
              Alert.alert('Error', 'No se pudo enviar el comentario');
            }
          }}
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

      
    </ScrollView> 
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A', padding: 20 },
  name: { color: '#E0E1DD', fontSize: 18, fontWeight: 'bold' },
  username: { color: '#AFC1D6' },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    textAlign: 'center',
    marginBottom: 20,
  },
  detail: { color: '#AFC1D6', marginVertical: 5 },
  description: { color: '#E0E1DD', marginTop: 10, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  contactBox: { marginTop: 20 },
  moreInfoBox: { marginTop: 30 },
  sectionTitle: { color: '#E0E1DD', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  label: { color: '#AFC1D6', marginTop: 10 },
  text: { color: '#E0E1DD' },
  rating: { color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
  buttonBox: { marginTop: 20, alignItems: 'center' },
  messageButton: { backgroundColor: '#AFC1D6', color: '#000', padding: 10, borderRadius: 10, fontWeight: 'bold' },
  commentBox: { backgroundColor: '#E0E1DD', padding: 15, borderRadius: 10, marginTop: 20 },
  commentRating: { fontWeight: 'bold', fontSize: 16 },
  commentText: { marginTop: 5, color: '#000' },
  loadingText: { color: '#E0E1DD', textAlign: 'center', marginTop: 50 },
  input: { backgroundColor: '#E0E1DD', color: '#000', marginBottom: 10, padding: 10, borderRadius: 10 },
  saveButton: { backgroundColor: '#E0E1DD', padding: 15, borderRadius: 10, marginTop: 20 },
  saveButtonText: { color: '#0D1B2A', fontWeight: 'bold', textAlign: 'center' },
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
  input2: {
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
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#0D1B2A',
  },
  commentDate: {
    color: '#4A4A4A',
    fontSize: 12,
  },
  noComments: {
    color: '#AFC1D6',
    fontStyle: 'italic',
    marginTop: 10,
  },
  profileImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E1DD',
  },
  card: {
    backgroundColor: '#1B263B',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  }, 
  bookingCard: {
    backgroundColor: '#1B263B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingIcon: {
    marginRight: 10,
  },
  bookingText: {
    color: '#E0E1DD',
    fontSize: 14,
  },  
  modalLabel: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    textAlign: 'center',
  },   
    button: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D1B2A',
  }, 
  verifiedBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#1B263B',
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
  marginLeft: 10,
  marginTop: 6,
},
verifiedText: {
  color: '#A8DADC',
  fontWeight: 'bold',
  marginLeft: 4,
  fontSize: 12,
},
});
