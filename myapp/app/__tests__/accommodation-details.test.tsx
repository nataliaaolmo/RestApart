import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AccommodationDetailsScreen from '../accommodation-details';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('fake-jwt-token')),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock de storage utility
jest.mock('../../utils/storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve('fake-jwt-token')),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    session: {
      setItem: jest.fn(() => Promise.resolve()),
    }
  }
}));

// Mock de expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: '1',
    title: 'Piso de prueba',
    beds: '3',
    bedrooms: '2',
    price: '400',
    startDate: null,
    endDate: null,
    isVerified: 'true'
  }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn()
  }),
}));

// Mock de componentes de React Native
jest.mock('react-native/Libraries/Image/Image', () => 'Image');
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => 'ScrollView');
jest.mock('react-native/Libraries/Lists/FlatList', () => 'FlatList');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Ionicons'
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

// Mock de la API
jest.mock('../../app/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockImplementation((url) => {
      if (url.includes('current-user')) {
        return Promise.resolve({ 
          data: { 
            user: { 
              id: 123, 
              role: 'OWNER', 
              username: 'pepe', 
              firstName: 'Pepe', 
              lastName: 'Márquez', 
              photo: 'default.jpg' 
            } 
          } 
        });
      }
      if (url.includes('/accommodations/')) {
        return Promise.resolve({
          data: {
            owner: {
              user: { 
                id: 123, 
                firstName: 'Pepe', 
                lastName: 'Márquez', 
                photo: 'default.jpg', 
                username: 'pepe' 
              },
              experienceYears: 5
            },
            description: 'Descripción del alojamiento',
            images: ['img1.jpg', 'img2.jpg'],
            latitud: 37.3886,
            longitud: -5.9953
          }
        });
      }
      if (url.includes('/comments/accomodations/')) {
        return Promise.resolve({
          data: []
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({}),
  }
}));

// Mock de Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn(obj => obj.web)
}));

describe('AccommodationDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente el título del alojamiento', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    await waitFor(() => {
      expect(findByText('Piso de prueba')).toBeTruthy();
    });
  });

  it('renderiza correctamente la información básica del alojamiento', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    await waitFor(() => {
      expect(findByText('3 camas - 2 dormitorios - 2 baños')).toBeTruthy();
    });
  });

  it('renderiza el chip de verificación cuando isVerified es true', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    await waitFor(() => {
      expect(findByText('Alojamiento verificado')).toBeTruthy();
    });
  });

  it('renderiza la información del propietario', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    await waitFor(() => {
      expect(findByText('Dueño: Pepe Márquez')).toBeTruthy();
    });
  });

  it('renderiza la descripción del alojamiento', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    await waitFor(() => {
      expect(findByText('Descripción del alojamiento')).toBeTruthy();
    });
  });

  it('renderiza el precio del alojamiento', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    await waitFor(() => {
      expect(findByText('400€/mes')).toBeTruthy();
    });
  });
}); 