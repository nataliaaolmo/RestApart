import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../static/resources/css/SearchPage.css";
import apiClient from '../apiClient.js';

const SearchPage = () => {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [students, setStudents] = useState('');
  const [wifi, setWifi] = useState(false);
  const [isEasyParking, setIsEasyParking] = useState(false);
  const [academicCareerAffinity, setAcademicCareerAffinity] = useState(false);
  const [hobbiesAffinity, sethobbiesAffinity] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(5);

  const findAllAccommodations = async () => {
    try {
        const response = await apiClient.get("/api/accommodations");

        // Manejo de estructura incorrecta
        if (Array.isArray(response.data)) {
            setAccommodations(response.data);
        } else if (response.data && Array.isArray(response.data.accommodations)) {
            setAccommodations(response.data.accommodations);
        } else {
            console.error("Error: La respuesta no es un array válido", response.data);
            setAccommodations([]); // Evitamos un crash
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        setAccommodations([]); // Evitamos undefined
    }
};



const getFilteredAccomodations = async () => {
    try {
        const params = {};
        if (maxPrice) params.maxPrice = maxPrice;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (students) params.students = students;
        if (wifi) params.wifi = wifi;
        if (isEasyParking) params.isEasyParking = isEasyParking;
        if (academicCareerAffinity) params.matchCareer = academicCareerAffinity;
        if (hobbiesAffinity) params.matchHobbies = hobbiesAffinity;
        if (allowSmoking) params.matchSmoking = allowSmoking;
        if (latitude) params.latitude = latitude;
        if (longitude) params.longitude = longitude;
        if (radius) params.radius = radius;

        const response = await apiClient.get("/api/accommodations/search", { params });
        if (Array.isArray(response.data)) {
            setAccommodations(response.data);
        } else {
            console.error("Error: La respuesta no es un array", response.data);
            setAccommodations([]);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        setAccommodations([]);
    }
};

  useEffect(() => {
    findAllAccommodations();
  }, []);

  const applyFilters = () => {
    getFilteredAccomodations();
  };

  const clearFilters = () => {
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
    setStudents('');
    setWifi(false);
    setIsEasyParking(false);
    setAcademicCareerAffinity(false);
    setAllowSmoking(false);
    sethobbiesAffinity(false);
    setLatitude('');
    setLongitude('');
    setRadius('');
    setFiltersApplied(false); 
    findAllAccommodations(); 
  };

    const toggleFilters = () => {
      setFiltersVisible(!filtersVisible);
  };


  return (
    <div className="search-container">
      <h1>Filtrar Alojamientos</h1>

      <div>
          <button
            style={{ backgroundColor: '#555', color: 'white', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
            onClick={toggleFilters} >
            {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
      </div>

      {filtersVisible && (
        <div style={{ marginTop: '20px', display: filtersVisible ? 'block' : 'none' }} >
          <h2 style={{ fontSize: '1.8em' }} >Filtros disponibles</h2>
          <input
            type="number"
            placeholder="Precio máximo (€)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="date"
            placeholder="Fecha de Inicio"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="date"
            placeholder="Fecha de Fin"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="Número de estudiantes"
            value={students}
            onChange={(e) => setStudents(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="checkbox"
            placeholder="Wifi"
            checked={wifi}
            onChange={(e) => setWifi(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="checkbox"
            placeholder="Fácil Aparcar"
            checked={isEasyParking}
            onChange={(e) => setIsEasyParking(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="checkbox"
            placeholder="Buscar por afinidad Carrera Académica"
            checked={academicCareerAffinity}
            onChange={(e) => setAcademicCareerAffinity(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="checkbox"
            placeholder="Buscar por afinidad de Aficiones"
            checked={hobbiesAffinity}
            onChange={(e) => sethobbiesAffinity(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="checkbox"
            placeholder="No me importa que mis compañeros fumen"
            checked={allowSmoking}
            onChange={(e) => setAllowSmoking(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="Latitud"
            checked={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <input
            type="number"
            placeholder="Longitud"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{ padding: '10px', fontSize: '1em', margin: '10px 0', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ddd' }}
          />          
          <select
            placeholder="Radio de búsqueda (km)"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="15">15 km</option>
          </select>
          <button
            onClick={applyFilters}
            style={{ padding: '10px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Aplicar filtros
          </button>
          <button
            onClick={clearFilters}
            style={{ padding: '10px 15px', backgroundColor: '#FF0000', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}>
            Borrar filtros
          </button>
        </div>
      )}

      <div>
        <h2>Apartamentos disponibles</h2>
        <ul>
          {Array.isArray(accommodations) && accommodations.length > 0 ? (
            accommodations.map((accommodation) => (
              <li key={accommodation.id}>
                <h3>{accommodation.advertisement?.title || "Sin título"}</h3>
                <p>Precio por mes: {accommodation.pricePerMonth ?? "No disponible"}</p>
                <p>Descripción: {accommodation.description ?? "No disponible"}</p>
                <p>Número de estudiantes: {accommodation.students ?? "No especificado"}</p>
              </li>
            ))
          ) : (
            <p>No hay alojamientos disponibles.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
