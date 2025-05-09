import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from './api';
import { useRouter } from 'expo-router';

const CustomInput = ({ label, value, onChangeText, icon, ...props }) => (
  <View style={styles.inputWrapper}>
    <Ionicons name={icon} size={20} color="#E0E1DD" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor="#A0AEC0"
      {...props}
    />
  </View>
);

export default function CreateAccommodation() {
  const [form, setForm] = useState({
    title: '', rooms: '', beds: '', pricePerDay: '', pricePerMonth: '',
    description: '', address: '', startDate: '', endDate: '', students: '',
    wifi: false, isEasyParking: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [latLng, setLatLng] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [addressWarning, setAddressWarning] = useState('');
  const [suggestion, setSuggestion] = useState('');

  function convertToBackendFormat(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }
  
  const router = useRouter();

  const showError = (msg) => {
    if (Platform.OS === 'web') setErrorMessage(msg);
    else Alert.alert('Error', msg);
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    if (name === 'address') {
      const suggested = maybeSuggestAddress(value);
      setSuggestion(suggested !== value ? suggested : '');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImages(prev => [...prev, ...result.assets]);
    }
  };

  const isValidAddress = (address) => {
    const clean = address.trim().toLowerCase();
    const hasPrefix = ['calle', 'av', 'avenida', 'camino', 'plaza', 'paseo'].some(prefix =>
      clean.includes(prefix)
    );
    const hasNumber = /\d+/.test(clean);
    return clean.length > 5 && hasPrefix && hasNumber;
  };

  const maybeSuggestAddress = (input) => {
    let suggestion = input;
    if (input.includes('Av.') || input.includes('Av ')) {
      suggestion = suggestion.replace(/\bAv\.?\b/gi, 'Avenida');
    }
    if (!/España/i.test(suggestion)) {
      suggestion += ', España';
    }
    return suggestion;
  };

  const geocodeAddress = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'MyStudentApp/1.0',
          },
        }
      );
      const data = await response.json();
      if (data.length > 0) {
        setAddressWarning('');
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      } else {
        setAddressWarning('No se ha podido encontrar la dirección. ¿Es correcta?');
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo coordenadas:', error);
      setAddressWarning('Error consultando la dirección. Inténtalo de nuevo.');
      return null;
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!form.title || !form.rooms || !form.beds || !form.pricePerMonth || !form.pricePerDay || !form.startDate || !form.endDate || !form.students || !form.address) {
      showError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (isNaN(form.rooms) || isNaN(form.beds) || isNaN(form.pricePerDay) || isNaN(form.pricePerMonth) || isNaN(form.students)){
      showError('Asegúrate de que los campos númericos son válidos.');
      return;
    }

    if (form.pricePerDay <=0 || form.pricePerMonth <=0){
      showError('Los precios deben ser mayores que 0.');
      return;
    }

    if(form.rooms <=0|| form.beds <=0 || form.students <=0){
      showError('Las habitaciones, camas y plazas deben ser mayores que 0.');
      return;
    }

    if (form.startDate.length !== 10 || form.endDate.length !== 10) {
      showError('Las fechas deben tener el formato DD-MM-YYYY.');
      return;
    }

    const [startDay, startMonth, startYear] = form.startDate.split('-').map(Number);
    const [endDay, endMonth, endYear] = form.endDate.split('-').map(Number);

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      showError('Las fechas deben ser válidas.');
      return;
    }

    if (startDate > endDate) {
      showError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    if (selectedImages.length === 0) {
      showError('Debes seleccionar al menos una imagen.');
      return;
    }
    if (!isValidAddress(form.address)) {
      setAddressWarning('⚠️ Introduce la dirección con calle, número, ciudad y país. Ej: "Calle Real 5, Madrid, España"');
      return;
    }
    if (!latLng) {
      showError('Debes obtener la ubicación exacta antes de crear el alojamiento.');
      return;
    }

    try {
      const token = localStorage.getItem('jwt');
      if (!token) return showError('No se encontró el token.');

      const formData = new FormData();
      selectedImages.forEach((img, i) => {
        const file = img.file ?? new File([img], img.fileName || `image-${i}.jpg`, { type: img.mimeType || 'image/jpeg' });
        formData.append('files', file);
      });

      const uploadRes = await fetch('http://localhost:8080/api/images/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!uploadRes.ok) return showError('Error al subir imágenes.');
      const imageUrls = await uploadRes.json();

      const accommodationData = {
        rooms: parseInt(form.rooms),
        beds: parseInt(form.beds),
        pricePerDay: parseFloat(form.pricePerDay),
        pricePerMonth: parseFloat(form.pricePerMonth),
        description: form.description,
        latitud: latLng.lat,
        longitud: latLng.lon,
        availability: {
          startDate: convertToBackendFormat(form.startDate),
          endDate: convertToBackendFormat(form.endDate)
        },        
        students: parseInt(form.students),
        wifi: form.wifi,
        isEasyParking: form.isEasyParking,
        images: imageUrls,
      };

      const res = await api.post(`/accommodations?title=${encodeURIComponent(form.title)}`, accommodationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Platform.OS === 'web') setErrorMessage('');
      else Alert.alert('Éxito', 'Alojamiento creado correctamente');

      router.push({
        pathname: '/(tabs)/welcome-screen',
      });

    } catch (err) {
      console.error(err);
      showError('Error al crear alojamiento.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nuevo Alojamiento</Text>
      {Platform.OS === 'web' && errorMessage !== '' && (
  <Text style={styles.errorText}>{errorMessage}</Text>
)}

<Text style={styles.section}>Información general</Text>
<CustomInput
  label="Título *"
  value={form.title}
  onChangeText={(val) => handleChange('title', val)}
  icon="home-outline"
/>
<CustomInput
  label="Descripción"
  value={form.description}
  onChangeText={(val) => handleChange('description', val)}
  multiline
  numberOfLines={3}
  icon="document-text-outline"
/>
<CustomInput
  label="Dirección* (tipo de vía, nombre, número, ciudad, país. Ej: Calle Real 10, Sevilla, España)"
  value={form.address}
  onChangeText={(val) => handleChange('address', val)}
  icon="location-outline"
/>

<TouchableOpacity
  style={[styles.button]}
  onPress={async () => {
    if (!isValidAddress(form.address)) {
      setAddressWarning('Dirección inválida. Ej: "Calle Real 10, Sevilla, España"');
      return;
    }
    const coords = await geocodeAddress();
    if (coords) setLatLng(coords);
  }}
>
  <Text style={styles.buttonText}>Obtener ubicación exacta</Text>
</TouchableOpacity>

{addressWarning !== '' && (
  <View style={{ marginTop: 5 }}>
    <Text style={styles.warningText}>{addressWarning}</Text>
    {suggestion && (
      <TouchableOpacity onPress={() => handleChange('address', suggestion)}>
        <Text style={styles.suggestionText}>
          👉 Usar sugerencia: <Text style={{ fontWeight: 'bold' }}>{suggestion}</Text>
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}

{latLng && (
  <Text style={{ color: '#90EE90', marginTop: 10 }}>
    📍 Ubicación encontrada: {latLng.lat.toFixed(5)}, {latLng.lon.toFixed(5)}
  </Text>
)}

<Text style={styles.section}>Detalles de alojamiento</Text>
<CustomInput
  label="Habitaciones *"
  value={form.rooms}
  onChangeText={(val) => handleChange('rooms', val)}
  keyboardType="numeric"
  icon="bed-outline"
/>
<CustomInput
  label="Camas *"
  value={form.beds}
  onChangeText={(val) => handleChange('beds', val)}
  keyboardType="numeric"
  icon="bed-outline"
/>
<CustomInput
  label="Precio por día (€) *"
  value={form.pricePerDay}
  onChangeText={(val) => handleChange('pricePerDay', val)}
  keyboardType="numeric"
  icon="cash-outline"
/>
<CustomInput
  label="Precio por mes (€) *"
  value={form.pricePerMonth}
  onChangeText={(val) => handleChange('pricePerMonth', val)}
  keyboardType="numeric"
  icon="card-outline"
/>
<CustomInput
  label="Plazas para estudiantes *"
  value={form.students}
  onChangeText={(val) => handleChange('students', val)}
  keyboardType="numeric"
  icon="people-outline"
/>

<Text style={styles.section}>Disponibilidad</Text>
<CustomInput
  label="Fecha inicio (DD-MM-YYYY) *"
  value={form.startDate}
  onChangeText={(val) => handleChange('startDate', val)}
  icon="calendar-outline"
/>
<CustomInput
  label="Fecha fin (DD-MM-YYYY) *"
  value={form.endDate}
  onChangeText={(val) => handleChange('endDate', val)}
  icon="calendar-outline"
/>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Wifi</Text>
        <Switch value={form.wifi} onValueChange={(val) => handleChange('wifi', val)} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Fácil aparcamiento</Text>
        <Switch value={form.isEasyParking} onValueChange={(val) => handleChange('isEasyParking', val)} />
      </View>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Seleccionar imágenes</Text>
      </TouchableOpacity>

      {selectedImages.length > 0 && (
        <Text style={{ color: '#E0E1DD', marginTop: 10 }}>
          {selectedImages.length} imagen(es) seleccionada(s) ✅
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear Alojamiento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1B2A', padding: 20, paddingBottom: 40,
  },
  title: {
    fontSize: 22, fontWeight: 'bold', color: '#E0E1DD', marginBottom: 20, textAlign: 'center'
  },
  section: {
    fontSize: 18, color: '#E0E1DD', marginTop: 20, marginBottom: 10, fontWeight: '600'
  },
  CustomInputWrapper: {
    marginBottom: 15,
  },
  label: {
    color: '#E0E1DD', marginBottom: 5,
  },
  CustomInput: {
    backgroundColor: '#E0E1DD', color: '#0D1B2A', padding: 10, borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10,
  },
  button: {
    backgroundColor: '#A8DADC', marginTop: 20, padding: 15, borderRadius: 10,
  },
  buttonText: {
    color: '#0D1B2A', fontWeight: 'bold', textAlign: 'center',
  },
  errorText: {
    color: 'tomato', backgroundColor: '#fff3f3', padding: 10, borderRadius: 10,
    marginBottom: 15, textAlign: 'center', fontWeight: '600'
  },
  warningText: {
    color: '#F4A261',
    backgroundColor: '#1B263B',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    fontSize: 14,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162A40',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#E0E1DD',
  },
});