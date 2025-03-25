import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../app/api';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function CreateAccommodation() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [rooms, setRooms] = useState('');
  const [beds, setBeds] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [description, setDescription] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [students, setStudents] = useState('');
  const [wifi, setWifi] = useState(false);
  const [isEasyParking, setIsEasyParking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const handleSubmit = async () => {
    const token = localStorage.getItem('jwt');
  
    if (!selectedImage) {
      Alert.alert('Error', 'Debes seleccionar al menos una imagen del alojamiento.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', {
      uri: selectedImage.uri,
      name: 'accommodation.jpg',
      type: 'image/jpeg',
    });
  
    try {
      const uploadResponse = await fetch('http://localhost:8080/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const imageUrl = await uploadResponse.text(); 
      console.log('URL de la imagen subida:', imageUrl);
  
      const accommodationData = {
        rooms: parseInt(rooms),
        beds: parseInt(beds),
        pricePerDay: parseFloat(pricePerDay),
        pricePerMonth: parseFloat(pricePerMonth),
        description,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        availability: {
          startDate,
          endDate
        },
        students: parseInt(students),
        wifi,
        isEasyParking,
        images: [imageUrl], 
      };
  
      const response = await api.post(`/accommodations?title=${encodeURIComponent(title)}`, accommodationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      Alert.alert('Éxito', 'Alojamiento creado correctamente');
      router.replace('../(tabs)/welcome-screen'); 
  
    } catch (error) {
      console.error('Error al crear alojamiento:', error);
      Alert.alert('Error', 'No se pudo crear el alojamiento');
    }
  };
  

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso requerido", "Se necesita permiso para acceder a tus imágenes");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Nuevo alojamiento</Text>

      <Text style={styles.label}>Título del anuncio *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Nº de habitaciones *</Text>
      <TextInput style={styles.input} value={rooms} onChangeText={setRooms} keyboardType="numeric" />

      <Text style={styles.label}>Nº de camas *</Text>
      <TextInput style={styles.input} value={beds} onChangeText={setBeds} keyboardType="numeric" />

      <Text style={styles.label}>Precio por día (€) *</Text>
      <TextInput style={styles.input} value={pricePerDay} onChangeText={setPricePerDay} keyboardType="numeric" />

      <Text style={styles.label}>Precio por mes (€) *</Text>
      <TextInput style={styles.input} value={pricePerMonth} onChangeText={setPricePerMonth} keyboardType="numeric" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline numberOfLines={3} />

      <Text style={styles.label}>Latitud *</Text>
      <TextInput style={styles.input} value={latitud} onChangeText={setLatitud} keyboardType="numeric" />

      <Text style={styles.label}>Longitud *</Text>
      <TextInput style={styles.input} value={longitud} onChangeText={setLongitud} keyboardType="numeric" />

      <Text style={styles.label}>Fecha de inicio (YYYY-MM-DD) *</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />

      <Text style={styles.label}>Fecha de fin (YYYY-MM-DD) *</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />

      <Text style={styles.label}>Plazas para estudiantes *</Text>
      <TextInput style={styles.input} value={students} onChangeText={setStudents} keyboardType="numeric" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Wifi</Text>
        <Switch value={wifi} onValueChange={setWifi} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Fácil aparcamiento</Text>
        <Switch value={isEasyParking} onValueChange={setIsEasyParking} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear alojamiento</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Seleccionar imagen</Text>
      </TouchableOpacity>
        {selectedImage && (
        <Text style={{ color: '#E0E1DD', marginTop: 10 }}>Imagen seleccionada: ✅</Text>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1B2A',
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#E0E1DD',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#E0E1DD',
    color: '#0D1B2A',
    padding: 10,
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#E0E1DD',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
