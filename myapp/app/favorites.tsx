import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, AppState } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api from './api';
import storage from '../utils/storage';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteAccommodations, setFavoriteAccommodations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    const storedFavorites = await storage.getItem('favorites');
    if (storedFavorites) {
      const favoriteIds = JSON.parse(storedFavorites);
      setFavorites(favoriteIds);
      fetchFavoriteAccommodations(favoriteIds);
    } else {
      setFavoriteAccommodations([]);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadFavorites();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchFavoriteAccommodations = async (favoriteIds: number[]) => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get('/accommodations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const filteredAccommodations = response.data.filter((acc: any) => 
        favoriteIds.includes(acc.id)
      );
      
      setFavoriteAccommodations(filteredAccommodations);
    } catch (error) {
      console.error('Error al obtener alojamientos favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFavorite = ({ item }: { item: any }) => {
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
            },
          })
        }
      >
        <View style={styles.card}>
          <Image
            source={{ uri: `https://restapart.onrender.com/images/${images[0]}` }}
            style={styles.image}
          />
          <View style={{ marginTop: 10 }}>
            <Text style={styles.title}>{item.advertisement?.title || 'Sin título'}</Text>
            <Text style={styles.text}>🛏 {item.beds} camas · 🛋 {item.rooms} dorms</Text>
            <Text style={styles.price}>💰 {item.pricePerMonth} €/mes</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Cargando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tus favoritos</Text>
      <FlatList
        data={favoriteAccommodations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavorite}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tienes alojamientos guardados. Marca con ❤️ los que te gusten en la pantalla principal.
          </Text>
        }
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E1DD',
    padding: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1B263B',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  title: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    color: '#AFC1D6',
    fontSize: 14,
    marginTop: 4,
  },
  price: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  emptyText: {
    color: '#AFC1D6',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
});

