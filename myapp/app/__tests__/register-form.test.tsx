import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RegisterForm from '../register-form';
import api from '../api';

// Mock de Firebase Auth
jest.mock('firebase/auth', () => ({
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    render: jest.fn(),
    verify: jest.fn(),
  })),
  signInWithPhoneNumber: jest.fn().mockResolvedValue({
    confirm: jest.fn().mockResolvedValue({ user: { uid: '123' } }),
  }),
}));

// Mock de firebaseConfig
jest.mock('../../components/firebaseConfig', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  }
}));

// Mock de storage utility
jest.mock('../../utils/storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
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
  useLocalSearchParams: () => ({ role: 'STUDENT' }),
}));

// Mock de la API
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

// Mock de Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn(obj => obj.web)
}));

// Mock de Icon
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock de Picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: 'Picker',
}));

// Mock de window y alert para el entorno web
Object.defineProperty(global, 'window', {
  value: {
    recaptchaVerifier: null,
    open: jest.fn(),
    alert: jest.fn(),
  },
  writable: true,
});

// Mock de process.env para Expo
process.env.EXPO_OS = 'web';

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza todos los campos del formulario correctamente', () => {
    const { getByPlaceholderText, getByText } = render(<RegisterForm />);

    // Verificar campos de texto
    expect(getByPlaceholderText('Nombre *')).toBeTruthy();
    expect(getByPlaceholderText('Apellido *')).toBeTruthy();
    expect(getByPlaceholderText('Email *')).toBeTruthy();
    expect(getByPlaceholderText('Contraseña *')).toBeTruthy();
    expect(getByPlaceholderText('Teléfono *')).toBeTruthy();

    // Verificar botones
    expect(getByText('Registrarse')).toBeTruthy();
  });

  it('renderiza los campos específicos para estudiantes', () => {
    const { getByPlaceholderText, getByText } = render(<RegisterForm />);

    // Verificar campos específicos de estudiante
    expect(getByPlaceholderText('Carrera académica')).toBeTruthy();
    expect(getByPlaceholderText('Aficiones')).toBeTruthy();
    expect(getByText('¿Eres fumador?')).toBeTruthy();
  });

  it('renderiza los elementos de términos y condiciones', () => {
    const { getByText } = render(<RegisterForm />);

    // Verificar elementos de términos y condiciones
    expect(getByText(/Acepto los Términos y Condiciones/)).toBeTruthy();
  });
}); 