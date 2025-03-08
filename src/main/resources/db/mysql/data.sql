-- Inserta las autoridades primero
INSERT INTO authorities(id, authority) VALUES (1, 'OWNER'), (2, 'STUDENT');

-- Inserta los usuarios primero
INSERT INTO users (id, username, password, authority) VALUES
(1, 'alice123', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 1),
(2, 'bob456', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 1),
(3, 'charlie789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 2),
(4, 'diana001', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 1),
(5, 'edward_dev', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 2),
(6, 'frank789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 1),
(7, 'grace567', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 2),
(8, 'harry001', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 2),
(9, 'irene789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 2),
(10, 'jack456', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 1);

-- Ahora sí, inserta los owners con user_id existentes en users
INSERT INTO owners(id, first_name, last_name, email, telephone, date_of_birth, gender, description, photo, is_verified, experience_years, user_id) VALUES 
(1, 'Alice', 'Johnson', 'alice@example.com', '123456789', '1992-03-11', 'WOMAN', 'Descripción de Alice', 'alice.jpg', true, 10, 1),
(2, 'Bob', 'Smith', 'bob@example.com', '987654321', '1999-12-07', 'MAN', 'Descripción de Bob', 'bob.jpg', false, 5, 2),
(4, 'Diana', 'Prince', 'diana@example.com', '654321', '1990-11-11', 'WOMAN', 'Descripción de Diana', 'diana.jpg', true, 8, 4),
(6, 'Frank', 'Castle', 'frank@example.com', '741852963', '1985-08-13', 'MAN', 'Descripción de Frank', 'frank.jpg', true, 12, 6),
(10, 'Jack', 'Sparrow', 'jack@example.com', '753159', '1980-12-25', 'MAN', 'Descripción de Jack', 'jack.jpg', false, 15, 10);

INSERT INTO students (id, first_name, last_name, email, telephone,date_of_birth,gender,description,photo,is_verified,is_smoker, academic_career, hobbies, user_id)
VALUES 
(3, 'Charlie', 'Brown', 'charlie@example.com', '567123890','2001-05-19', 'MAN', 'Descripción de Charlie', 'charlie.jpg', true, false, 'Computer Science', 'Chess, Coding', 3),
(5, 'Edward', 'Snowden','edward@example.com', '321789654', '2003-04-22', 'MAN', 'Descripción de Edward', 'edward.jpg', false, true, 'Cybersecurity', 'Hacking, Reading', 5),
(7, 'Grace', 'Hopper','grace@example.com', '369258147',  '1995-07-23', 'WOMAN', 'Descripción de Grace', 'grace.jpg', true, false, 'Mathematics', 'Puzzles, Music', 7),
(8, 'Harry', 'Potter','harry@example.com', '852963741', '2002-09-14', 'MAN', 'Descripción de Harry', 'harry.jpg', false, true, 'Magic & Wizardry', 'Quidditch, Spells', 8),
(9, 'Irene', 'Adler','irene@example.com', '951753468', '1994-05-06', 'WOMAN', 'Descripción de Irene', 'irene.jpg', true, false, 'Criminology', 'Mysteries, Writing', 9);


INSERT IGNORE INTO advertisements (id, is_visible, title) VALUES
(1, true, 'Oferta Especial en Madrid'),
(2, false, 'Apartamento en Barcelona'),
(3, true, 'Alquiler en Valencia'),
(4, true, 'Casa en Sevilla'),
(5, false, 'Estudio en Bilbao'),
(6, true, 'Habitación en Granada'),
(7, true, 'Piso en Málaga'),
(8, false, 'Chalet en Zaragoza'),
(9, true, 'Dúplex en Alicante'),
(10, true, 'Loft en Salamanca');

INSERT IGNORE INTO accommodations (id, rooms, beds, price_per_day, price_per_month, description, latitud, longitud, start_date, end_date, students, wifi, is_easy_parking, advertisement_id, owner_id) 
VALUES 
(1, 3, 4, 50.00, 1200.00, 'Amplio apartamento con vista al mar', '40.4168N', '3.7038W', '2025-03-01', '2025-12-31', 2, true, false, 1, 1),
(2, 2, 3, 35.00, 900.00, 'Departamento acogedor en el centro', '41.3851N', '2.1734W', '2025-04-01', '2025-11-30', 1, true, true, 2, 2),
(3, 4, 6, 70.00, 2000.00, 'Casa espaciosa en las afueras', '39.4699N', '0.3763W', '2025-05-15', '2025-10-15', 3, true, false, 3, 4),
(4, 1, 1, 25.00, 600.00, 'Pequeño estudio en barrio tranquilo', '37.7749N', '122.4194W', '2025-02-01', '2025-08-31', 1, false, true, 4, 4),
(5, 2, 3, 40.00, 1000.00, 'Apartamento en zona universitaria', '48.8566N', '2.3522W', '2025-06-01', '2025-12-15', 2, true, false, 5, 1),
(6, 3, 4, 55.00, 1400.00, 'Departamento moderno con piscina', '51.5074N', '0.1278W', '2025-07-10', '2025-10-30', 2, true, true, 6, 6),
(7, 5, 8, 80.00, 2500.00, 'Mansión con jardín y piscina', '34.0522N', '118.2437W', '2025-03-01', '2025-11-01', 4, true, true, 7, 2),
(8, 1, 2, 30.00, 750.00, 'Habitación en piso compartido', '35.6895N', '139.6917E', '2025-01-15', '2025-09-30', 1, true, false, 8, 8),
(9, 2, 2, 45.00, 1100.00, 'Ático con terraza y vistas', '55.7558N', '37.6173E', '2025-05-01', '2025-10-01', 2, true, true, 9, 2),
(10, 4, 5, 65.00, 1800.00, 'Dúplex lujoso en el centro', '52.5200N', '13.4050E', '2025-06-15', '2025-12-31', 3, true, false, 10, 10);

INSERT INTO bookings (link, title, advertisement_id) VALUES
('https://booking.example.com/reserva1', 'Reserva en Madrid - Apartamento céntrico', 1),
('https://booking.example.com/reserva2', 'Habitación privada en Barcelona', 2),
('https://booking.example.com/reserva3', 'Estudio moderno en Valencia', 3),
('https://booking.example.com/reserva4', 'Piso compartido en Sevilla', 4),
('https://booking.example.com/reserva5', 'Apartamento con terraza en Granada', 5);


INSERT IGNORE INTO booking_students (id, booking_id, student_id, booking_date, price) VALUES 
(1, 1, 3, '2025-01-03', 400.0),
(2, 2, 5, '2025-02-08', 450.0),
(3, 3, 7, '2025-04-08', 850.0),
(4, 4, 8, '2025-05-03', 475.0),
(5, 5, 9, '2025-06-03', 1200.0);

INSERT IGNORE INTO comments (id, comment_date, text, rating, accommodation_id, user_id, student_id) VALUES
(1, '2024-07-14', 'No me gustó la experiencia, esperaba más.', 5, NULL, 1, 9),
(2, '2024-08-22', 'Muy cómodo y bien ubicado.', 2, NULL, 7, 9),
(3, '2024-10-05', 'El proceso de reserva fue fácil y rápido.', 4, NULL, 8, 9),
(4, '2024-09-11', 'Excelente servicio y atención.', 1, NULL, 4, 8),
(5, '2025-01-21', 'El dueño fue muy amable y servicial.', 3, 8, NULL, 8),
(6, '2025-02-10', 'Muy cómodo y bien ubicado.', 1, 1, NULL, 4),
(7, '2025-02-07', 'Gran experiencia, volvería a reservar aquí.', 2, 3, NULL, 7),
(8, '2024-08-28', 'El proceso de reserva fue fácil y rápido.', 3, 10, NULL, 3),
(9, '2024-09-26', 'El WiFi era lento en algunas áreas.', 2, NULL, 7, 9),
(10, '2025-01-18', 'El WiFi era lento en algunas áreas.', 1, NULL, 9, 5);

INSERT INTO messages (message_date, text, sender_id, receiver_id) VALUES
('2025-03-01', 'Hola, ¿te interesa compartir alojamiento?', 1, 3),
('2025-03-02', 'Sí, ¿cuándo podríamos hablar?', 3, 1),
('2025-03-03', 'Hola, soy el propietario, ¿tienes dudas sobre el apartamento?', 2, 5);



