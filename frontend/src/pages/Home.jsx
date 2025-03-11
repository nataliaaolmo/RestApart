import React from "react";
import "../static/resources/css/Home.css"; // Importa los estilos
import Footer from "../components/Footer"; // Importa el footer

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a RENTAPART</h1>
        <p>Encuentra o publica alojamientos de manera sencilla.</p>
      </header>

      <main className="home-main">
        <section className="feature">
          <h2>Buscar Alojamientos</h2>
          <p>Explora alojamientos disponibles para estudiantes y propietarios.</p>
        </section>

        <section className="feature">
          <h2>Publicar un Alojamiento</h2>
          <p>Registra y promociona tu alojamiento en RENTAPART.</p>
        </section>

        <section className="feature">
          <h2> Chat en Vivo</h2>
          <p>Contacta directamente con propietarios o estudiantes en tiempo real.</p>
        </section>
      </main>

      <Footer /> {/* Renderiza el footer aquí */}
    </div>
  );
}

export default Home;
