import { useState } from 'react';
import "../static/resources/css/PublishAccommodation.css";
import { useNavigate } from "react-router-dom";

const PublishAccommodation = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [errors, setErrors] = useState({
        title: '',
        description: '',
        pricePerDay: '',
        pricePerMonth: '',
        rooms: '',
        beds: '',
        latitud: '',
        longitud: '',
        wifi: '',
        isEasyParking: '',
        students: '',
        availability: ''
    });

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        description: '',
        pricePerDay: 0,
        pricePerMonth: 0,
        rooms: 0,
        beds: 0,
        latitud: '',
        longitud: '',
        wifi: false,
        isEasyParking: false,
        students: 1, // Número de estudiantes predeterminado
        availability: {
            startDate: '',
            endDate: ''
        }
    });

    const [title, setTitle] = useState(''); // El título se envía como parámetro en la URL

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "startDate" || name === "endDate") {
            setFormData({
                ...formData,
                availability: {
                    ...formData.availability,
                    [name]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("El título es obligatorio.");
            return;
        }

        // Convertimos los valores numéricos correctamente
        const formattedData = {
            ...formData,
            pricePerDay: Number(formData.pricePerDay),
            pricePerMonth: Number(formData.pricePerMonth),
            rooms: Number(formData.rooms),
            beds: Number(formData.beds),
            students: Number(formData.students),
            wifi: Boolean(formData.wifi),
            isEasyParking: Boolean(formData.isEasyParking),
            availability: {
                startDate: formData.availability.startDate,
                endDate: formData.availability.endDate
            }
        };

        console.log("Datos enviados al backend:", formattedData);

        const queryParams = new URLSearchParams({ title }).toString();

        fetch(`http://localhost:8080/api/accommodations?${queryParams}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(formattedData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.error) {
                navigate("/misservicios");
            } else {
                setErrors(data);
            }
        })
        .catch(error => console.error("Error creando alojamiento:", error));
    };

    return (
        <div className="registrar-alojamiento-container">
            <h2>Publicar Alojamiento</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Título del Anuncio:</label>
                    <p className="error-title">{errors.title}</p>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Descripción:</label>
                    <p className="error-title">{errors.description}</p>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pricePerDay">Precio por Día (€):</label>
                    <p className="error-title">{errors.pricePerDay}</p>
                    <input
                        type="number"
                        id="pricePerDay"
                        name="pricePerDay"
                        value={formData.pricePerDay}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pricePerMonth">Precio por Mes (€):</label>
                    <p className="error-title">{errors.pricePerMonth}</p>
                    <input
                        type="number"
                        id="pricePerMonth"
                        name="pricePerMonth"
                        value={formData.pricePerMonth}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="rooms">Número de Habitaciones:</label>
                    <p className="error-title">{errors.rooms}</p>
                    <input
                        type="number"
                        id="rooms"
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="beds">Número de Camas:</label>
                    <p className="error-title">{errors.beds}</p>
                    <input
                        type="number"
                        id="beds"
                        name="beds"
                        value={formData.beds}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="students">Número de Estudiantes:</label>
                    <p className="error-title">{errors.students}</p>
                    <input
                        type="number"
                        id="students"
                        name="students"
                        value={formData.students}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="startDate">Fecha de Inicio:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.availability.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">Fecha de Fin:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.availability.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="latitud">Latitud:</label>
                    <p className="error-title">{errors.latitud}</p>
                    <input
                        type="number"
                        id="latitud"
                        name="latitud"
                        value={formData.latitud}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="longitud">Longitud:</label>
                    <p className="error-title">{errors.longitud}</p>
                    <input
                        type="number"
                        id="longitud"
                        name="longitud"
                        value={formData.longitud}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="wifi">WiFi Disponible:</label>
                    <input
                        type="checkbox"
                        id="wifi"
                        name="wifi"
                        checked={formData.wifi}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="isEasyParking">Fácil Aparcamiento:</label>
                    <input
                        type="checkbox"
                        id="isEasyParking"
                        name="isEasyParking"
                        checked={formData.isEasyParking}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="submit-button">Publicar Alojamiento</button>
            </form>
        </div>
    );
};

export default PublishAccommodation;
