import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ResultsPage = () => {
  const location = useLocation();
  const filters = location.state || {};
  const [accommodations, setAccommodations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const params = new URLSearchParams(filters).toString();
        const url = `http://localhost:8080/api/v1/accommodations?${params}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text(); // Leer la respuesta como texto para ver si es HTML o JSON
          console.error("Server Response:", errorText);
          throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
        }

        // Verificar si la respuesta es JSON antes de parsearla
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Respuesta no es un JSON válido.");
        }

        const data = await response.json();
        setAccommodations(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching accommodations:", err);
      }
    };

    fetchResults();
  }, [filters]);

  return (
    <div className="results-container">
      <h2>Resultados de la búsqueda</h2>

      {error && <p className="error-message">{error}</p>}

      {accommodations.length === 0 && !error ? (
        <p>No se encontraron alojamientos con estos filtros.</p>
      ) : (
        <ul className="accommodations-list">
          {accommodations.map((acc) => (
            <li key={acc.id} className="accommodation-card">
              <h3>{acc.advertisement?.title || "Sin título"}</h3>
              <p>Precio por mes: {acc.pricePerMonth ? `${acc.pricePerMonth}€` : "No disponible"}</p>
              <p>Habitaciones: {acc.rooms ?? "No especificado"}</p>
              <p>Camas: {acc.beds ?? "No especificado"}</p>
              <p>Wifi: {acc.wifi ? "Sí" : "No"}</p>
              <p>Aparcamiento: {acc.isEasyParking ? "Fácil" : "Difícil"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsPage;
