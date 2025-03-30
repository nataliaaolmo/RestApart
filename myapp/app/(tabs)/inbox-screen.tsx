import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../app/api';

export default function InboxScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem('jwt');
      const res = await api.get('/chat/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    };
    fetchConversations();
  }, []);

  const openChat = (userId: number) => {
    router.push({ pathname: '/private-chat', params: { id: userId } });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => openChat(item.id)}>
      <Image source={{ uri: `http://localhost:8080/images/${item.photo}` }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversaciones recientes</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#0D1B2A' },
  title: { color: '#E0E1DD', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  name: { color: '#E0E1DD', fontSize: 16, fontWeight: 'bold' },
  username: { color: '#AFC1D6' }
});
