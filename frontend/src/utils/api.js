import axios from "axios";

export const loginUser = async (form) => {
  const response = await axios.post("http://localhost:8080/api/auth/login", form);
  return response.data;
};

export const registerUser = async (form) => {
  await axios.post("http://localhost:8080/api/users", form);
};

export const getCurrentUser = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/auth/current-user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};
