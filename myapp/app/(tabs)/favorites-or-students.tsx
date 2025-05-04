import React, { useEffect, useState } from 'react';
import FavoritesScreen from '../favorites'; 
import StudentsInMyProperties from '../students-in-my-accommodations'; 
import api from '../api';

export default function SharedTab() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const res = await api.get('/users/auth/current-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(res.data.user.role);
      } catch (err) {
        console.error('Error al obtener rol:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return null; // o spinner si quieres
  }

  if (role === 'OWNER') {
    return <StudentsInMyProperties />;
  } else {
    return <FavoritesScreen />;
  }
}
