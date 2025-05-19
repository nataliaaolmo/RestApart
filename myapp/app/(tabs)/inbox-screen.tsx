import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../app/api';
import storage from '../../utils/storage';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function InboxScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      const token = await storage.getItem('jwt');
      const res = await api.get('/chat/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    };
    fetchConversations();
  }, []);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get(`/users/username/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data ? [response.data] : []);
    } catch (error) {
      console.error('Error buscando usuario:', error);
      setSearchResults([]);
    }
  };

  const openChat = (userId: number) => {
    router.push({ pathname: '/private-chat', params: { id: userId } });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => openChat(item.id)}>
      <Image 
        source={{ uri: item.photo ? `https://restapart.onrender.com/images/${item.photo}` : 'https://restapart.onrender.com/images/default-avatar.png' }} 
        style={styles.avatar} 
      />
      <View>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#AFC1D6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre de usuario..."
          placeholderTextColor="#AFC1D6"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchUsers(text);
          }}
        />
      </View>

      {isSearching && searchQuery.length >= 2 ? (
        <>
          <Text style={styles.title}>Resultado de búsqueda</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.noResults}>No se encontró ningún usuario con ese nombre</Text>
            }
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Conversaciones recientes</Text>
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.noResults}>No tienes conversaciones recientes</Text>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    flex: 1, 
    backgroundColor: '#0D1B2A' 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162A40',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#E0E1DD',
    paddingVertical: 12,
    fontSize: 16,
  },
  title: { 
    color: '#E0E1DD', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#162A40',
    borderRadius: 10,
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 15 
  },
  name: { 
    color: '#E0E1DD', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  username: { 
    color: '#AFC1D6' 
  },
  noResults: {
    color: '#AFC1D6',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});
