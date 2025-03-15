-- 1️⃣ Inserta los usuarios primero
INSERT INTO users (id, username, password, role) VALUES
(1, 'alice123', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER'),
(2, 'bob456', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER'),
(3, 'charlie789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT'),
(4, 'diana001', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER'),
(5, 'edward_dev', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT'),
(6, 'frank789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER'),
(7, 'grace567', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT'),
(8, 'harry001', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT'),
(9, 'irene789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT'),
(10, 'jack456', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER');

-- 2️⃣ Inserta en person y relaciona con users
INSERT INTO person (id, user_id, first_name, last_name, email, telephone, date_of_birth, gender, description, photo, is_verified)
VALUES 
(1, 1, 'Alice', 'Johnson', 'alice@example.com', '123456789', '1992-03-11', 'WOMAN', 'Descripción Alice', 'alice.jpg', true),
(2, 2, 'Bob', 'Smith', 'bob@example.com', '987654321', '1999-12-07', 'MAN', 'Descripción Bob', 'bob.jpg', false),
(3, 3, 'Charlie', 'Brown', 'charlie@example.com', '567123890', '2001-05-19', 'MAN', 'Descripción Charlie', 'charlie.jpg', true),
(4, 4, 'Diana', 'Williams', 'diana@example.com', '456789', '1995-08-12', 'WOMAN', 'Descripción Diana', 'diana.jpg', true),
(5, 5, 'Edward', 'Davis', 'edward@example.com', '123890', '1998-02-02', 'MAN', 'Descripción Edward', 'edward.jpg', false),
(6, 6, 'Frank', 'Martinez', 'frank@example.com', '890123', '1990-11-20', 'MAN', 'Descripción Frank', 'frank.jpg', true),
(7, 7, 'Grace', 'Rodriguez', 'grace@example.com', '678901', '1993-04-13', 'WOMAN', 'Descripción Grace', 'grace.jpg', true),
(8, 8, 'Harry', 'Lopez', 'harry@example.com', '234567', '1997-06-12', 'MAN', 'Descripción Harry', 'harry.jpg', false),
(9, 9, 'Irene', 'Garcia', 'irene@example.com', '890123', '1996-09-08', 'WOMAN', 'Descripción Irene', 'irene.jpg', true),
(10, 10, 'Jack', 'Hernandez', 'jack@example.com', '456789', '1994-01-07', 'MAN', 'Descripción Jack', 'jack.jpg', true);

-- 3️⃣ Ahora insertamos en owners y students usando el mismo ID de person
INSERT INTO owners (id, experience_years) VALUES 
(1, 10),
(2, 5),
(4, 8),
(6, 15),
(10, 3);

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
(1, 3, 4, 50.00, 1200.00, 'Apartamento en el centro de Sevilla', 37.3886, -5.9823, '2025-03-01', '2025-12-31', 2, true, false, 1, 1),
(2, 2, 3, 35.00, 900.00, 'Piso acogedor cerca de la Giralda', 37.3879, -5.9933, '2025-04-01', '2025-11-30', 1, true, true, 2, 2),
(3, 4, 6, 70.00, 2000.00, 'Casa espaciosa en Triana', 37.3826, -6.0004, '2025-05-15', '2025-10-15', 3, true, false, 3, 4),
(4, 1, 1, 25.00, 600.00, 'Estudio en la Macarena', 37.4085, -5.9822, '2025-02-01', '2025-08-31', 1, false, true, 4, 4),
(5, 2, 3, 40.00, 1000.00, 'Apartamento en la Alameda', 37.4044, -5.9869, '2025-06-01', '2025-12-15', 2, true, false, 5, 1),
(6, 3, 4, 55.00, 1400.00, 'Piso moderno en Los Remedios', 37.3721, -5.9902, '2025-07-10', '2025-10-30', 2, true, true, 6, 6),
(7, 5, 8, 80.00, 2500.00, 'Chalet con jardín en Nervión', 37.3828, -5.9704, '2025-03-01', '2025-11-01', 4, true, true, 7, 2),
(8, 1, 2, 30.00, 750.00, 'Habitación en piso compartido en San Bernardo', 37.3771, -5.9873, '2025-01-15', '2025-09-30', 1, true, false, 8, 8),
(9, 2, 2, 45.00, 1100.00, 'Ático con terraza en Sevilla Este', 37.3952, -5.9426, '2025-05-01', '2025-10-01', 2, true, true, 9, 2),
(10, 4, 5, 65.00, 1800.00, 'Dúplex lujoso en el Arenal', 37.3863, -5.9982, '2025-06-15', '2025-12-31', 3, true, false, 10, 10);

INSERT INTO students (id, is_smoker, academic_career, hobbies, accommodation_id) VALUES 
(3, false, 'Computer Science', 'Chess, Traveling', null),
(5, true, 'Engineering', 'Reading, Traveling', 1),
(7, false, 'Business Administration', 'Traveling',1),
(8, true, 'Medicine', 'Cooking, Traveling', 2),
(9, false, 'Architecture', 'Photography, Traveling', 2);

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



