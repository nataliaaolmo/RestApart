import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from './api';
import { useRouter } from 'expo-router';
import axios from 'axios';

const CustomInput = ({ label, value, onChangeText, icon, helpText, ...props }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <View style={{ marginBottom: 15 }}>
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
        {helpText && (
          <TouchableOpacity onPress={() => setShowHelp(!showHelp)}>
            <Ionicons name="information-circle-outline" size={20} color="#AFC1D6" />
          </TouchableOpacity>
        )}
      </View>
      {showHelp && helpText && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}
    </View>
  );
};

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
  const [streetType, setStreetType] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('España');


  function convertToBackendFormat(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }
  
  const router = useRouter();

  const showError = (msg) => {
    if (Platform.OS === 'web') setErrorMessage(msg);
    else Alert.alert('Error', msg);
  };
  const buildFullAddress = () =>
    `${streetType} ${streetName} ${streetNumber}, ${city}, ${country}`.trim();
  

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
    const fullAddress = `${streetType} ${streetName} ${streetNumber}, ${city}, ${country}`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`, {
        headers: { 'User-Agent': 'MyStudentApp/1.0' },
      });
      const data = await response.json();
      if (data.length > 0) {
        setAddressWarning('');
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      } else {
        setAddressWarning('No se ha encontrado la dirección. ¿Es correcta?');
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
    if (!form.title || !form.rooms || !form.beds || !form.pricePerMonth || !form.pricePerDay || !form.startDate || !form.endDate || !form.students || !buildFullAddress()) {
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
    if (!isValidAddress(buildFullAddress())) {
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

      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        let file = img.file;
        console.log('img', img);
  
        if (!file && img.uri.startsWith('data:image/')) {
          console.warn(`⚠️ Imagen base64 descartada: ${img.fileName || `imagen-${i + 1}`}`);
          continue;
        }
  
        if (!file) {
          try {
            file = new File([img], img.fileName || `image-${i}.jpg`, {
              type: img.mimeType || 'image/jpeg',
            });
          } catch (e) {
            console.warn(`❌ No se pudo construir File para la imagen #${i}`, e);
            continue;
          }
        }
  
        if (!file.type.startsWith('image/')) {
          console.warn(`❌ Archivo no permitido (no es imagen): ${file.name}`);
          continue;
        }
  
        if (file.size > 1024 * 1024) {
          showError(`❌ La imagen "${file.name}" supera 1 MB. Reduce su tamaño e inténtalo de nuevo.`);
          return;
        }
          file = file ?? new File([img], img.fileName || `image-${i}.jpg`, {
            type: img.mimeType || 'image/jpeg'
          });

        formData.append('files', file);
      }
  
      if (formData.getAll('files').length === 0) {
        return showError('❌ No se ha podido subir ninguna imagen válida.');
      }
      
      console.log(formData.getAll('files'));
      
      const uploadRes = await axios.post('http://localhost:8080/api/images/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const imageUrls = uploadRes.data;

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
  helpText="Introduce un título corto y descriptivo para el alojamiento. Ej: 'Piso luminoso en Reina Mercedes'."
/>
<CustomInput
  label="Descripción"
  value={form.description}
  onChangeText={(val) => handleChange('description', val)}
  multiline
  numberOfLines={3}
  icon="document-text-outline"
  helpText="Describe el alojamiento con más detalle: comodidades, normas, entorno, etc."
/>
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
  style={[styles.button]}
  onPress={async () => {
    if (!isValidAddress(buildFullAddress())) {
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
  helpText="Número total de habitaciones disponibles en el alojamiento."
/>

<CustomInput
  label="Camas *"
  value={form.beds}
  onChangeText={(val) => handleChange('beds', val)}
  keyboardType="numeric"
  icon="bed-outline"
  helpText="Número total de camas en el alojamiento (no necesariamente igual al número de habitaciones)."
/>
<CustomInput
  label="Precio por día (€) *"
  value={form.pricePerDay}
  onChangeText={(val) => handleChange('pricePerDay', val)}
  keyboardType="numeric"
  icon="cash-outline"
  helpText="Precio diario aproximado que pagarían los inquilinos. Se utiliza para calcular estancias cortas."
/>
<CustomInput
  label="Precio por mes (€) *"
  value={form.pricePerMonth}
  onChangeText={(val) => handleChange('pricePerMonth', val)}
  keyboardType="numeric"
  icon="card-outline"
  helpText="Precio mensual por el alojamiento completo o por habitación según el caso."
/>
<CustomInput
  label="Plazas para estudiantes *"
  value={form.students}
  onChangeText={(val) => handleChange('students', val)}
  keyboardType="numeric"
  icon="people-outline"
  helpText="Número de estudiantes que pueden alojarse a la vez en este inmueble."
/>

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

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Seleccionar imágenes</Text>
      </TouchableOpacity>

      {selectedImages.length > 0 && (
  <View style={{ marginTop: 10 }}>
    {selectedImages.map((img, idx) => (
      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
        <Text style={{ color: '#E0E1DD', flex: 1 }}>
          {img.file?.name || img.fileName || `Imagen ${idx + 1}`}
        </Text>
        <TouchableOpacity
          onPress={() =>
            setSelectedImages((prev) => prev.filter((_, i) => i !== idx))
          }
        >
          <Ionicons name="trash-outline" size={20} color="tomato" />
        </TouchableOpacity>
      </View>
    ))}
  </View>
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
  helpText: {
    color: '#AFC1D6',
    fontSize: 13,
    marginTop: 5,
    fontStyle: 'italic',
    backgroundColor: '#1B263B',
    padding: 8,
    borderRadius: 8,
  }
});