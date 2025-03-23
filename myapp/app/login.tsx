import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "../app/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await api.post("/users/auth/login", form);
      const token = response.data.token;
      const userName = response.data.user?.firstName || form.username; 
      const role = response.data.role; 

      if (!token) {
        throw new Error("No se recibió un token del backend");
      }

      await AsyncStorage.setItem("jwt", token);
      await AsyncStorage.setItem("userName", userName); 

      Alert.alert("Inicio de sesión exitoso", `Bienvenido de nuevo, ${userName}!`);

      router.push({
        pathname: "/(tabs)/welcome-screen",
        params: { name: userName, role: role}
      });

    } catch (err) {
      setError("Credenciales incorrectas o fallo al obtener el token");
      console.error("Error en el inicio de sesión:", err);
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

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        ¿No tienes una cuenta?{" "}
        <Text style={styles.registerLink} onPress={() => router.push("/register-form")}>
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
