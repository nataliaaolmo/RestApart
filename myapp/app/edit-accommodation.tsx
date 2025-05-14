import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from './api';

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  [key: string]: any;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, value, onChangeText, icon, ...props }) => (
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

export default function EditAccommodation() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', description: '', address: '', rooms: '', beds: '', pricePerDay: '',
    pricePerMonth: '', students: '', wifi: false, isEasyParking: false,startDate: '', endDate: ''
  });
  const [latLng, setLatLng] = useState<{ lat: number; lon: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [addressWarning, setAddressWarning] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [streetType, setStreetType] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('España');

  function convertToBackendFormat(dateStr: string): string {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }
  
  function formatToSpanish(dateStr: string): string {
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }  

  const handleChange = (name: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'address' && typeof value === 'string') {
        const suggested = maybeSuggestAddress(value);
        setSuggestion(suggested !== value ? suggested : '');
      }
  };

const showError = (msg: string): void => {
    if (Platform.OS === 'web') setErrorMessage(msg);
    else Alert.alert('Error', msg);
};
const buildFullAddress = () =>
  `${streetType} ${streetName} ${streetNumber}, ${city}, ${country}`.trim();

const maybeSuggestAddress = (input: string): string => {
    let suggestion = input;
    if (input.includes('Av.') || input.includes('Av ')) {
      suggestion = suggestion.replace(/\bAv\.?\b/gi, 'Avenida');
    }
    if (!/España/i.test(suggestion)) {
      suggestion += ', España';
    }
    return suggestion;
  };
  
  const fetchLatLng = async (address: string | number | boolean) => {
    const fullAddress = `${streetType} ${streetName} ${streetNumber}, ${city}, ${country}`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`, {
        headers: { 'User-Agent': 'MyStudentApp/1.0' },
      });
      const data = await res.json();
      if (data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        setLatLng(coords);
        return coords;
      } else {
        throw new Error('Dirección no encontrada.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
      return null;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setNewImages(prev => [...prev, ...result.assets]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const res = await api.get(`/accommodations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setForm({
          title: data.advertisement.title,
          description: data.description,
          address: '',
          rooms: String(data.rooms),
          beds: String(data.beds),
          pricePerDay: String(data.pricePerDay),
          pricePerMonth: String(data.pricePerMonth),
          students: String(data.students),
          wifi: data.wifi,
          isEasyParking: data.isEasyParking,
          startDate: convertToBackendFormat(data.availability.startDate),
          endDate: convertToBackendFormat(data.availability.endDate),
        });

        setImages(data.images);
        const coords = { lat: data.latitud, lon: data.longitud };
        setLatLng(coords);

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&zoom=18&addressdetails=1`, {
          headers: { 'User-Agent': 'MyStudentApp/1.0' }
        });
        const reverse = await response.json();
        const addr = reverse.address || {};

        setStreetType(addr.road?.split(' ')[0] || 'Calle');
        setStreetName(addr.road?.replace(/^(\w+)\s/, '') || '');
        setStreetNumber(addr.house_number || '');
        setCity(addr.city || addr.town || addr.village || '');
        setCountry(addr.country || '');

      } catch (err) {
        console.error('Error al cargar alojamiento:', err);
      }
    };
    loadData();
  }, [id]);

  const isValidAddress = (address: string) => {
    const clean = address.trim().toLowerCase();
    const hasPrefix = ['calle', 'av', 'avenida', 'camino', 'plaza', 'paseo'].some(prefix =>
      clean.includes(prefix)
    );
    const hasNumber = /\d+/.test(clean);
    return clean.length > 5 && hasPrefix && hasNumber;
  };

  const handleSave = async () => {
    setErrorMessage('');
    setAddressWarning('');

if (!form.title || !form.rooms || !form.beds || !form.pricePerDay || !form.pricePerMonth || !form.students || !form.startDate || !form.endDate || !streetType || !streetName || !city || !country) {
  showError('Por favor, completa todos los campos obligatorios.');
  return;
}


    if (isNaN(Number(form.rooms)) || isNaN(Number(form.beds)) || isNaN(Number(form.pricePerDay)) || isNaN(Number(form.pricePerMonth)) || isNaN(Number(form.students))){
      showError('Asegúrate de que los campos númericos son válidos.');
      return;
    }

    if (Number(form.pricePerDay) <= 0 || Number(form.pricePerMonth) <= 0){
      showError('Los precios deben ser mayores que 0.');
      return;
    }

    if(Number(form.rooms) <= 0 || Number(form.beds) <= 0 || Number(form.students) <= 0){
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

    if (!latLng) {
      showError('Debes obtener la ubicación exacta antes de crear el alojamiento.');
      return;
    }
    try {
      const coords = await fetchLatLng(buildFullAddress());
      if (!coords) return;

      const token = localStorage.getItem('jwt');
      let imageUrls = images;

      if (newImages.length > 0) {
        const formData = new FormData();
        for (const [i, img] of newImages.entries()) {
          const response = await fetch(img.uri);
          const blob = await response.blob();
          const file = new File([blob], img.fileName || `image-${i}.jpg`, { type: img.mimeType || 'image/jpeg' });
          formData.append('files', file);
        }
        const uploadRes = await fetch('http://localhost:8080/api/images/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('Error subiendo imágenes');
        const newImageUrls = await uploadRes.json();
        imageUrls = [...images, ...newImageUrls]; 
      }

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

      console.log('Datos del alojamiento:', accommodationData);

      await api.put(`/accommodations/${id}`, accommodationData,{
        headers: { Authorization: `Bearer ${token}` },
      });
      

      router.back();
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setErrorMessage('No se pudo guardar el alojamiento.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Alojamiento</Text>
      {Platform.OS === 'web' && errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

      <Text style={styles.section}>Información general</Text>
      <CustomInput label="Título *" value={form.title} onChangeText={val => handleChange('title', val)} icon="home-outline" />
      <CustomInput label="Descripción" value={form.description} onChangeText={val => handleChange('description', val)} icon="document-text-outline" multiline numberOfLines={3} />
      <CustomInput
          label="Tipo de vía (ej. Calle, Avenida...)"
          value={streetType}
          onChangeText={setStreetType}
          icon="pricetag-outline"
          helpText="Indica si es Calle, Avenida, Camino, Plaza, etc."
        />
      <CustomInput
          label="Nombre de la calle"
          value={streetName}
          onChangeText={setStreetName}
          icon="navigate-outline"
          helpText="Escribe el nombre de la vía sin el tipo ni número. Ej: 'Real Alcázar'."
        />
        <CustomInput
          label="Número"
          value={streetNumber}
          onChangeText={setStreetNumber}
          keyboardType="numeric"
          icon="list-outline"
          helpText="Número exacto del edificio o portal. Ej: 42"
        />
        <CustomInput
          label="Ciudad"
          value={city}
          onChangeText={setCity}
          icon="business-outline"
          helpText="Ciudad donde se encuentra el alojamiento. Ej: Sevilla"
        />
        <CustomInput
          label="País"
          value={country}
          onChangeText={setCountry}
          icon="flag-outline"
          helpText="País del alojamiento. Por defecto: España."
        />

<TouchableOpacity
  style={styles.button}
  onPress={async () => {
    if (!isValidAddress(buildFullAddress())) {
      setAddressWarning('⚠️ Dirección inválida. Ej: "Calle Real 10, Sevilla, España"');
      return;
    }
    const coords = await fetchLatLng(buildFullAddress());
    if (coords) {
      setLatLng(coords);
      setAddressWarning('');
    }
  }}
>
  <Text style={styles.buttonText}>Obtener ubicación exacta</Text>
</TouchableOpacity>

{latLng && (
  <Text style={{ color: '#90EE90', marginTop: 10 }}>
    📍 Ubicación encontrada: {latLng.lat.toFixed(5)}, {latLng.lon.toFixed(5)}
  </Text>
)}


      <Text style={styles.section}>Detalles del alojamiento</Text>
      <CustomInput label="Habitaciones" value={form.rooms} onChangeText={val => handleChange('rooms', val)} icon="bed-outline" keyboardType="numeric" />
      <CustomInput label="Camas" value={form.beds} onChangeText={val => handleChange('beds', val)} icon="bed-outline" keyboardType="numeric" />
      <CustomInput label="Precio por día (€)" value={form.pricePerDay} onChangeText={val => handleChange('pricePerDay', val)} icon="cash-outline" keyboardType="numeric" />
      <CustomInput label="Precio por mes (€)" value={form.pricePerMonth} onChangeText={val => handleChange('pricePerMonth', val)} icon="card-outline" keyboardType="numeric" />
      <CustomInput label="Plazas para estudiantes" value={form.students} onChangeText={val => handleChange('students', val)} icon="people-outline" keyboardType="numeric" />

        <Text style={styles.section}>Disponibilidad</Text>
<CustomInput
  label="Fecha inicio (DD-MM-YYYY) *"
  value={form.startDate}
  onChangeText={(val) => handleChange('startDate', val)}
  icon="calendar-outline"
  helpText="Día en que estará disponible el alojamiento. Usa el formato DD-MM-YYYY."
/>
<CustomInput
  label="Fecha fin (DD-MM-YYYY) *"
  value={form.endDate}
  onChangeText={(val) => handleChange('endDate', val)}
  icon="calendar-outline"
  helpText="Último día disponible para reservar el alojamiento. Usa el formato DD-MM-YYYY."
/>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Wifi</Text>
        <Switch value={form.wifi} onValueChange={(val) => handleChange('wifi', val)} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Fácil aparcamiento</Text>
        <Switch value={form.isEasyParking} onValueChange={(val) => handleChange('isEasyParking', val)} />
      </View>

      <Text style={styles.section}>Imágenes actuales</Text>
      <ScrollView horizontal>
      {images.map((img, index) => (
  <View key={index} style={{ position: 'relative', marginRight: 10 }}>
    <Image
      source={{ uri: `http://localhost:8080/images/${img}` }}
      style={{ width: 80, height: 80, borderRadius: 10 }}
    />
    <TouchableOpacity
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 2,
      }}
      onPress={() => {
        setImages(prev => prev.filter((_, i) => i !== index));
      }}
    >
      <Ionicons name="close-circle" size={20} color="white" />
    </TouchableOpacity>
  </View>
))}

      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Seleccionar nuevas imágenes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0D1B2A', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#E0E1DD', marginBottom: 20, textAlign: 'center' },
  section: { fontSize: 18, color: '#E0E1DD', marginTop: 20, marginBottom: 10, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#162A40', borderRadius: 10,
    paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor: '#415A77',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#E0E1DD' },
  label: { color: '#E0E1DD' },
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
});