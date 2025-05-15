import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AccommodationDetailsScreen from '../accommodation-details';

global.localStorage = {
  getItem: jest.fn(() => 'fake-jwt-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn((index: number) => null),
};

process.env.EXPO_PUBLIC_API_URL = 'https://restapart.onrender.com/api';

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

jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null
}));
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

jest.mock('../../app/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockImplementation((url: string) => {
      if (url.includes('current-user')) {
        return Promise.resolve({ data: { user: { id: 123, role: 'OWNER', username: 'pepe', firstName: 'Pepe', lastName: 'Márquez', photo: 'default.jpg' } } });
      }
      if (url.includes('/accommodations/')) {
        return Promise.resolve({
          data: {
            owner: {
              user: { id: 123, firstName: 'Pepe', lastName: 'Márquez', photo: 'default.jpg', username: 'pepe' },
              experienceYears: 5
            },
            description: 'Descripción del alojamiento',
            images: ['img1.jpg', 'img2.jpg'],
            latitud: 37.3886,
            longitud: -5.9953
          }
        });
      }
      if (url.includes('/students')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/comments/accomodations/1/average')) {
        return Promise.resolve({ data: 4.2 });
      }
      if (url.includes('/comments/accomodations/1')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/check-availability')) {
        return Promise.resolve({ data: true });
      }
      return Promise.resolve({ data: {} });
    }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({}),
  }
}));

describe('AccommodationDetailsScreen', () => {
  it('renderiza correctamente el título y cabecera', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    expect(await findByText('Piso de prueba')).toBeTruthy();
    expect(await findByText('⭐ 4.2 / 5')).toBeTruthy();
  });

  it('muestra mensaje si no hay fechas para ver inquilinos', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    expect(await findByText('Introduce fechas para ver los inquilinos actuales')).toBeTruthy();
  });

  it('muestra botones editar y eliminar si eres OWNER', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    expect(await findByText('Editar')).toBeTruthy();
    expect(await findByText('Eliminar')).toBeTruthy();
  });

  it('muestra el botón añadir comentario si no eres OWNER', async () => {
    const { findByText } = render(<AccommodationDetailsScreen />);
    expect(await findByText('Añadir Comentario')).toBeTruthy();
  });
});
