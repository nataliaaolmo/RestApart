import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import api from './api';
import storage from '../utils/storage';

interface User {
  id: number;
  username: string;
  role: 'STUDENT' | 'OWNER' | 'ADMIN';
  accommodations?: { id: number; description: string; pricePerMonth: number }[];
  bookings?: {
    stayRange: any; id: number; startDate: string; endDate: string; price: number 
}[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [counts, setCounts] = useState({ STUDENT: 0, OWNER: 0, ADMIN: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    fetchCounts();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get('/admin/users-with-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchCounts = async () => {
    try {
      const token = await storage.getItem('jwt');
      const response = await api.get('/admin/user-counts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCounts(response.data);
    } catch (error) {
      console.error('Error al obtener conteos:', error);
    }
  };

  const handleEditUser = (userId: number) => {
    router.push({ pathname: '/admin-edit-users', params: { id: userId } });
  };

  const handleEditAccommodation = (id: number) => {
    router.push({ pathname: '/admin-edit-accommodation', params: { id } });
  };

  const handleEditBooking = (id: number) => {
    router.push({ pathname: '/admin-edit-bookings', params: { id } });
  };

  const groupedUsers = {
    OWNER: users.filter((u) => u.role === 'OWNER'),
    STUDENT: users.filter((u) => u.role === 'STUDENT'),
  };

  const renderUserCard = (item: User) => (
    <View key={item.id} style={styles.userCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.roleBadge}>
        </View>
      </View>

      {item.role === 'OWNER' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alojamientos:</Text>
          {(item.accommodations ?? []).length > 0 ? (
            item.accommodations?.map((a) => (
              <View key={a.id} style={styles.inlineRow}>
                <Text style={styles.itemDetail}>• {a.description} ({a.pricePerMonth} €/mes)</Text>
                <TouchableOpacity onPress={() => handleEditAccommodation(a.id)}>
                  <Icon name="edit" size={18} color="#A8DADC" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.itemEmpty}>No tiene alojamientos</Text>
          )}
        </View>
      )}

      {item.role === 'STUDENT' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservas:</Text>
          {(item.bookings ?? []).length > 0 ? (
            item.bookings?.map((b) => (
              <View key={b.id} style={styles.inlineRow}>
                <Text style={styles.itemDetail}>• Del {formatDate(b.stayRange.startDate)} al {formatDate(b.stayRange.endDate)} ({b.price} €)</Text>
                <TouchableOpacity onPress={() => handleEditBooking(b.id)}>
                  <Icon name="edit" size={18} color="#A8DADC" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.itemEmpty}>No tiene reservas</Text>
          )}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleEditUser(item.id)}>
          <Icon name="user" size={18} color="#0D1B2A" />
          <Text style={styles.iconButtonText}>Editar Usuario</Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  const formatDate = (str: string): string => {
    const date = new Date(str);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel de Administración</Text>

      <View style={styles.statsBox}>
        <Text style={styles.statText}><Icon name="users" size={16} /> Estudiantes: {counts.STUDENT}</Text>
        <Text style={styles.statText}><Icon name="home" size={16} /> Propietarios: {counts.OWNER}</Text>
      </View>

      <Text style={styles.groupHeader}><Icon name="users" size={18} color="#A8DADC" /> Estudiantes</Text>
      {groupedUsers.STUDENT.map(renderUserCard)}

      <Text style={styles.groupHeader}><Icon name="home" size={18} color="#A8DADC" /> Propietarios</Text>
      {groupedUsers.OWNER.map(renderUserCard)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0D1B2A',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E1DD',
    marginBottom: 20,
    textAlign: 'center',
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#AFC1D6',
    marginVertical: 10,
    borderBottomColor: '#415A77',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  statsBox: {
    backgroundColor: '#1B263B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  statText: {
    color: '#E0E1DD',
    fontSize: 16,
    marginBottom: 5,
  },
  userCard: {
    backgroundColor: '#1B263B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#415A77',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    color: '#E0E1DD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: '#A8DADC',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  roleText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    color: '#AFC1D6',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  itemDetail: {
    color: '#E0E1DD',
    fontSize: 14,
  },
  itemEmpty: {
    color: '#AFC1D6',
    fontStyle: 'italic',
    fontSize: 14,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  iconButton: {
    backgroundColor: '#E0E1DD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButtonText: {
    color: '#0D1B2A',
    fontWeight: 'bold',
  },
});