import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import api from "../app/api";
import storage from "../utils/storage";

const i18n = new I18n({
  en: {
    login: "Login",
    username: "Username",
    password: "Password",
    loginButton: "Login",
    createAccount: "Create an account",
    invalidCredentials: "Invalid username or password",
    systemLocked: "The system is temporarily locked. Only admins can access."
  },
  es: {
    login: "Iniciar sesión",
    username: "Nombre de usuario",
    password: "Contraseña",
    loginButton: "Iniciar sesión",
    createAccount: "Crear una cuenta",
    invalidCredentials: "Usuario o contraseña incorrectos",
    systemLocked: "El sistema está bloqueado temporalmente. Solo los administradores pueden acceder."
  }
});

i18n.locale = Localization.locale;
i18n.enableFallback = true;

export default function LoginScreen() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/users/auth/login", form);
      
      const jwt = response.data.token || response.data.jwt;
      const name = response.data.name || form.username;
      const role = response.data.role || '';
      
      if (!jwt) {
        console.error("No se recibió un token válido:", response.data);
        setError("Error al iniciar sesión. No se recibió un token válido.");
        setLoading(false);
        return;
      }

      await storage.setItem("jwt", jwt);
      await storage.setItem("name", name);
      if (role) {
        await storage.setItem("role", role);
      }

      await storage.removeItem("accommodationFilters");

      if (Platform.OS === 'web') {
        setTimeout(() => {
          router.replace("/(tabs)/welcome-screen");
        }, 100);
      } else {
        router.replace("/(tabs)/welcome-screen");
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      
      if (error.response && error.response.status === 401) {
        setError(i18n.t("invalidCredentials"));
  } else {
        setError("Error al conectar con el servidor. Inténtalo más tarde.");
  }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de Sesión</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor="#AFC1D6"
        onChangeText={(value) => handleChange("username", value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#AFC1D6"
        secureTextEntry
        onChangeText={(value) => handleChange("password", value)}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0D1B2A" />
        ) : (
        <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.registerText}>
        ¿No tienes una cuenta?{" "}
        <Text style={styles.registerLink} onPress={() => router.push("/role-selection")}>
          Regístrate aquí
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D1B2A",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E0E1DD",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#162A40",
    color: "#E0E1DD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#415A77",
  },
  button: {
    backgroundColor: "#E0E1DD",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D1B2A",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  registerText: {
    color: "#AFC1D6",
    marginTop: 20,
    fontSize: 14,
  },
  registerLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#E0E1DD",
  },
});
