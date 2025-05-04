import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, ActivityIndicator, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import api from '../api';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [role, setRole] = useState<string | null>(null);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="welcome-screen"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites-or-students"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox-screen"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
