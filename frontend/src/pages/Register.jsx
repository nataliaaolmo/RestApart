import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../static/resources/css/Register.css"; 

const Register = () => {
  const [role, setRole] = useState(""); 
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    telephone: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    description: "",
    profilePicture: "",
    isSmoker: false, 
    academicCareer: "",
    hobbies: "",
    experienceYears: 0, 
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setForm({ ...form, role: selectedRole });
  };

  const handleChange = (e) => {
    let value = e.target.value;
  
    // Si el input es de tipo fecha, aseguramos que esté en formato yyyy-MM-dd
    if (e.target.name === "dateOfBirth") {
      value = new Date(value).toISOString().split("T")[0]; 
    }
  
    setForm({ ...form, [e.target.name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); //Evita el recargo de la página
    console.log("Formulario enviado:", form);

    try {
        const response = await axios.post("http://localhost:8080/api/users/auth/register", {
            ...form,
            role: role,
        });

        if (response.data.error) {
            setError("Error: " + response.data.error);
            return;
        }

        console.log("Usuario registrado:", response.data);
        navigate("/"); 
    } catch (error) {
        console.error("Error en el registro:", error.response?.data || error.message);
        setError("Error al registrarse. Inténtalo de nuevo.");
    }
};


  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro</h2>
        
        {!role ? (
          <div className="role-selection">
            <h3>Selecciona tu rol</h3>
            <button className="role-btn" onClick={() => handleRoleSelection("OWNER")}>Propietario</button>
            <button className="role-btn" onClick={() => handleRoleSelection("STUDENT")}>Estudiante</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            
            <input type="text" name="firstName" placeholder="Nombre" value={form.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange} required />
            <input type="text" name="username" placeholder="Usuario" value={form.username} onChange={handleChange} required />
            <input type="url" name="profilePicture" placeholder="URL de tu foto de perfil" value={form.profilePicture} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
            <input type="tel" name="telephone" placeholder="Teléfono" value={form.telephone} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
            
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Selecciona tu género</option>
              <option value="MAN">Hombre</option>
              <option value="WOMAN">Mujer</option>
              <option value="OTHER">Otro</option>
            </select>

            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
            <textarea name="description" placeholder="Descripción sobre ti" value={form.description} onChange={handleChange} required />

            {role === "OWNER" && (
              <input type="number" name="experienceYears" placeholder="Años de experiencia" value={form.experienceYears} onChange={handleChange} required />
            )}

            {role === "STUDENT" && (
              <>
                <select name="isSmoker" value={form.isSmoker} onChange={handleChange} required>
                  <option value="">¿Eres fumador?</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
                <input type="text" name="academicCareer" placeholder="Carrera académica" value={form.academicCareer} onChange={handleChange} required />
                <input type="text" name="hobbies" placeholder="Hobbies" value={form.hobbies} onChange={handleChange} required />
              </>
            )}

            <button className="submit-btn" type="submit">Registrarse</button>
          </form>
        )}

        <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
};

export default Register;
