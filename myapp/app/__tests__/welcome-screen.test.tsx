import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WelcomeScreen from '../(tabs)/welcome-screen'; 
import api from '../../app/api';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key) => {
      if (key === 'favorites') {
        return Promise.resolve(JSON.stringify([]));
      }
      if (key === 'accommodationFilters') {
        return Promise.resolve(JSON.stringify({
          maxPrice: '',
          startDate: '',
          endDate: '',
          students: '',
          wifi: false,
          isEasyParking: false,
          academicCareerAffinity: false,
          hobbiesAffinity: false,
          allowSmoking: false,
          latitude: 0,
          longitude: 0,
          radius: '5',
          zoneQuery: '',
          locationConfirmed: false
        }));
      }
      return Promise.resolve(null);
    }),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }
}));

// Mock de storage utility
jest.mock('../../utils/storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key) => {
      if (key === 'jwt') {
        return Promise.resolve('fake-jwt-token');
      }
      if (key === 'favorites') {
        return Promise.resolve(JSON.stringify([]));
      }
      if (key === 'accommodationFilters') {
        return Promise.resolve(JSON.stringify({
          maxPrice: '',
          startDate: '',
          endDate: '',
          students: '',
          wifi: false,
          isEasyParking: false,
          academicCareerAffinity: false,
          hobbiesAffinity: false,
          allowSmoking: false,
          latitude: 0,
          longitude: 0,
          radius: '5',
          zoneQuery: '',
          locationConfirmed: false
        }));
      }
      return Promise.resolve(null);
    }),
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
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mock de componentes de React Native
jest.mock('@expo/vector-icons', () => ({
  Feather: () => 'Feather'
}));
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

// Mock de la API
jest.mock('../../app/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// Mock de Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn(obj => obj.web)
}));

describe('WelcomeScreen', () => {
  const mockedGet = api.get as jest.Mock;
  const mockedPut = api.put as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el modal de filtros al pulsar "Mostrar filtros"', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { user: { role: 'STUDENT', username: 'Juan' } },
    });

    mockedGet.mockResolvedValueOnce({
      data: [
        { id: 1, beds: 2, rooms: 1, pricePerMonth: 300, images: [] },
      ],
    });

    mockedGet.mockResolvedValueOnce({ data: 4.3 });

    const { getByText, queryByText } = render(<WelcomeScreen />);
    
    await waitFor(() => {
      expect(getByText('Mostrar filtros')).toBeTruthy();
    });

    fireEvent.press(getByText('Mostrar filtros'));
    
    await waitFor(() => {
      expect(queryByText('✕ Cerrar')).toBeTruthy();
    });
  });

  it('renderiza vista OWNER correctamente', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { user: { role: 'OWNER', username: 'Carlos' } },
    });

    mockedGet.mockResolvedValueOnce({ data: [] }); 

    const { findByText } = render(<WelcomeScreen />);
    
    await waitFor(() => {
      expect(findByText('Mis alojamientos')).toBeTruthy();
    });
  });

  it('renderiza lista de alojamientos para STUDENT', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { user: { role: 'STUDENT', username: 'Ana' } },
    });

    mockedGet.mockResolvedValueOnce({
      data: [{ id: 1, beds: 3, rooms: 2, pricePerMonth: 450, images: ['img.jpg'] }],
    });

    mockedGet.mockResolvedValueOnce({ data: 4.2 });

    const { findByText } = render(<WelcomeScreen />);
    
    await waitFor(() => {
      expect(findByText('3 camas')).toBeTruthy();
    });
  });

  it('renderiza el panel de admin correctamente', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { user: { role: 'ADMIN', username: 'Admin' } },
    });

    mockedGet.mockResolvedValueOnce({ data: { locked: false } }); 

    const { findByText } = render(<WelcomeScreen />);
    
    await waitFor(() => {
      expect(findByText('Panel de bloqueo del sistema')).toBeTruthy();
    });
  });
});
