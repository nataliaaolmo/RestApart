import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../(tabs)/profile';

global.localStorage = {
  getItem: jest.fn(() => 'fake-jwt-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

jest.mock('firebase/auth', () => ({
  RecaptchaVerifier: jest.fn(),
  signInWithPhoneNumber: jest.fn(() => ({
    confirm: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@/components/firebaseConfig', () => ({
  auth: {},
}));

jest.mock('@/app/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn((url) => {
      if (url === '/users/auth/current-user') {
        return Promise.resolve({ data: { user: { id: 1 } } });
      }
      if (url === '/users/1') {
        return Promise.resolve({
          data: {
            id: 1,
            username: 'juanito',
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan@example.com',
            telephone: '123456789',
            gender: 'MAN',
            dateOfBirth: '2000-01-01',
            role: 'STUDENT',
            description: 'Descripción',
            profilePicture: 'default.jpg',
            isSmoker: false,
            academicCareer: 'Informática',
            hobbies: 'Leer, Correr',
            isVerified: false,
          },
        });
      }
      if (url.startsWith('/comments')) return Promise.resolve({ data: [] });
      if (url.startsWith('/bookings')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    }),
    put: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

describe('ProfileScreen (básico)', () => {
  it('muestra el título "Tu perfil"', async () => {
    const { findByText } = render(<ProfileScreen />);
    expect(await findByText('Tu perfil')).toBeTruthy();
  });

  it('muestra botón "Editar perfil"', async () => {
    const { findByText } = render(<ProfileScreen />);
    expect(await findByText('Editar perfil')).toBeTruthy();
  });

  it('muestra inputs al pulsar "Editar perfil"', async () => {
    const { findByText, getByPlaceholderText } = render(<ProfileScreen />);
    const editarBtn = await findByText('Editar perfil');
    fireEvent.press(editarBtn);
    expect(getByPlaceholderText('Nombre')).toBeTruthy();
    expect(getByPlaceholderText('Apellido')).toBeTruthy();
    expect(getByPlaceholderText('Usuario')).toBeTruthy();
  });
});
