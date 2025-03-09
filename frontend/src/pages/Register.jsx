/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    telephone: "",
    password: "",
    dni: "",
    role: "CLIENT",
    profilePicture: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", form); 

    const role = 'proveedor' === form.role ? 'SUPPLIER' : 'CLIENT';

    try {
      const response = await axios.post("http://localhost:8080/api/users/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        telephone: Number(form.telephone), 
        dni: form.dni,
        password: form.password,
        role: role,
        profilePicture: form.profilePicture,
      });

      if (response.data.error) {
        setError("Error: " + response.data.error);
        return;
      }

      console.log("Usuario registrado:", response.data);
      navigate("/login"); 
    } catch (error) {
      console.error("Error en el registro:", error.response?.data || error.message);
      setError("Error al registrarse. Inténtalo de nuevo.");
    }
  };

  // TODO: Añadir al formulario el campo para el tipo de usuario: cliente o proveedor
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Registro</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="Nombre" value={form.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange} required />
          <input type="text" name="username" placeholder="Usuario" value={form.username} onChange={handleChange} required />
          <input type="url" name="profilePicture" placeholder="https://foto.de/perfil" value={form.profilePicture} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
          <input type="tel" name="telephone" placeholder="Teléfono" value={form.telephone} onChange={handleChange} required />
          <input type="text" name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          <select name="role" value={form.role} onChange={handleChange} required>
            <option value="">Selecciona tu rol</option>
            <option value="cliente">Cliente</option>
            <option value="proveedor">Proveedor</option>
          </select>
          <button type="submit">Registrarse</button>
        </form>
        <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
};

export default Register;
