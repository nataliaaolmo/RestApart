/* eslint-disable no-unused-vars */
import "../static/resources/css/AppNavBar.css";
import logo from "../static/resources/images/logo-eventbride.png";
import carta from "../static/resources/images/carta.png";
import usuario from "../static/resources/images/user.png";
import React, { useState } from 'react';


function Navbar() {
  //const {currentUser, loading} = useCurrentUser(null)
  const [isOpen, setIsOpen] = useState(false);

  // Obtener datos user desde localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const renderNavList = () => {
    if (!currentUser) {
      return (
        null
      );
    }
    // TODO cambiar este tipo de implicaciones por el role correcto
    if (currentUser.role === "CLIENT") {
      return (
        <div className="navbar-flex">
          <p className="navbar-list"><a href="/my-events">Mis eventos</a></p>
          <p className="navbar-list" onClick={toggleDropdown}>
            <a href="#">Crear evento</a>
            {isOpen && (
            <div className="dropdown">
              <p><a href="/create-events">Desde cero</a></p>
              <p><a href="/quiz">Cuestionario</a></p>
        </div>
        )}
          </p>
          <p className="navbar-list"><a href="/lugares">Recintos</a></p>
          <p className="navbar-list"><a href="/proveedores">Otros servicios</a></p>
          <p className="navbar-list"><a href="/invitaciones">Invitaciones</a></p>
          <p className="navbar-list"><a href="/terminos-y-condiciones">Términos y Condiciones</a></p>
        </div>
      );
    }

    if (currentUser.role === "SUPPLIER") {
      return (
        <div className="navbar-flex">
          <p className="navbar-list"><a href="/misservicios">Mis servicios</a></p>
          <p className="navbar-list"><a href="/terminos-y-condiciones">Términos y Condiciones</a></p>
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="Eventbride Logo" className="navbar-logo" />
        <a href="/"><span className="navbar-title">Inicio</span></a>
      </div>
      {renderNavList()}
      {currentUser && (
        <>
          <div className="navbar-card">
            <a href="/mensajes">
              <img src={carta} alt="Carta" className="carta" />
            </a>
          </div>
          <div className="navbar-user">
            <a href="/perfil">
              <img src={usuario} alt="Usuario" className="usuario" />
            </a>
          </div>
          <div className="navbar-user">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("jwt");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;