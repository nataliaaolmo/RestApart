import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import WelcomeScreen from '../(tabs)/welcome-screen'; 
import api from '../../app/api';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));
jest.mock('react-native-vector-icons/FontAwesome', () => 'FontAwesome');
jest.mock('../../app/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

beforeEach(() => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('WelcomeScreen', () => {
  const mockedGet = api.get as jest.Mock;
  const mockedPut = api.put as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el modal de filtros al pulsar "Mostrar filtros"', async () => {
    jest.setTimeout(10000);

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
    await waitFor(() => getByText('Mostrar filtros'));

    fireEvent.press(getByText('Mostrar filtros'));
    expect(queryByText('✕ Cerrar')).toBeTruthy();
  });

  it('renderiza vista OWNER correctamente', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { user: { role: 'OWNER', username: 'Carlos' } },
    });

    mockedGet.mockResolvedValueOnce({ data: [] }); 

    const { findByText } = render(<WelcomeScreen />);
    expect(await findByText('Mis alojamientos')).toBeTruthy();
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
    expect(await findByText('3 camas')).toBeTruthy();
  });

  it('renderiza el panel de admin correctamente', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { user: { role: 'ADMIN', username: 'Admin' } },
    });

    mockedGet.mockResolvedValueOnce({ data: { locked: false } }); 

    const { findByText } = render(<WelcomeScreen />);
    expect(await findByText('Panel de administración')).toBeTruthy();
  });
});
