import "../static/resources/css/AppNavBar.css";
import logo from "../static/resources/images/logo.png";
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      {/* Logo e Inicio */}
      <div className="navbar-brand">
        <img src={logo} alt="Eventbride Logo" className="navbar-logo" />
        <Link to="/" className="navbar-title">Inicio</Link>
      </div>

      {/* Opciones del Menú */}
      {currentUser && (
        <div className="navbar-flex">
          <Link to="/mis-alojamientos" className="navbar-list">Mis alojamientos</Link>
          <Link to="/perfil" className="navbar-list">Mi Perfil</Link>
          <Link to="/chat" className="navbar-list">Chat</Link>

          {/* Opciones específicas según el rol */}
          {currentUser.role === "OWNER" && (
            <Link to="/publicar-alojamiento" className="navbar-list"> Publicar Alojamiento</Link>
          )}
          {currentUser.role === "STUDENT" && (
            <Link to="/buscar-alojamientos" className="navbar-list"> Buscar Alojamiento</Link>
          )}
        </div>
      )}

      {/* Botón de Cerrar Sesión */}
      {currentUser && (
        <div className="navbar-logout">
          <button className="logout-btn" onClick={handleLogout}> Cerrar sesión</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
