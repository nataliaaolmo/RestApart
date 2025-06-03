-- encoding: UTF-8
INSERT INTO users (username, password, role, first_name, last_name, email, telephone, date_of_birth, gender, description, photo, is_verified) VALUES
('alice123', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER', 'Alice', 'Johnson', 'alice@example.com', '123456789', '1992-03-11', 'WOMAN', 'Descripción Alice', 'alice.jpg', true),
('bob456', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER', 'Bob', 'Smith', 'bob@example.com', '987654321', '1999-12-07', 'MAN', 'Descripción Bob', 'bob.jpg', false),
('charlie789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT', 'Charlie', 'Brown', 'charlie@example.com', '567123890', '2001-05-19', 'MAN', 'Descripción Charlie', 'charlie.jpg', true),
('diana001', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER', 'Diana', 'Williams', 'diana@example.com', '456789', '1995-08-12', 'WOMAN', 'Descripción Diana', 'diana.jpg', true),
('edward_dev', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT', 'Edward', 'Davis', 'edward@example.com', '123890', '1998-02-02', 'MAN', 'Descripción Edward', 'edward.jpg', false),
('frank789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER', 'Frank', 'Martinez', 'frank@example.com', '890123', '1990-11-20', 'MAN', 'Descripción Frank', 'frank.jpg', true),
('grace567', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT', 'Grace', 'Rodriguez', 'grace@example.com', '678901', '1993-04-13', 'WOMAN', 'Descripción Grace', 'grace.jpg', true),
('harry001', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT', 'Harry', 'Lopez', 'harry@example.com', '234567', '1997-06-12', 'MAN', 'Descripción Harry', 'harry.jpg', false),
('irene789', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'STUDENT', 'Irene', 'Garcia', 'irene@example.com', '890123', '1996-09-08', 'WOMAN', 'Descripción Irene', 'irene.jpg', true),
('jack456', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'OWNER', 'Jack', 'Hernandez', 'jack@example.com', '456789', '1994-01-07', 'MAN', 'Descripción Jack', 'jack.jpg', true),
('natalichic', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', 'ADMIN', 'Natalia', 'Olmo', 'natali@example.com', '123456789', '2003-04-17', 'WOMAN', 'Descripción Natalia', 'natalia.jpg', true);

INSERT INTO owners (user_id, experience_years) VALUES 
(1, 10),
(2, 5),
(4, 8),
(6, 15),
(10, 3);

INSERT INTO system_status (id, locked) VALUES (1, false);

INSERT INTO advertisements (is_visible, title) VALUES
(true, 'Piso cerca de Reina Mercedes'),
(false, 'Habitación junto a ETSII'),
(true, 'Apartamento en Viapol'),
(true, 'Estudio junto a Ramón y Cajal'),
(false, 'Piso compartido en Los Bermejales'),
(true, 'Dúplex moderno en El Porvenir'),
(true, 'Habitación individual en Reina Mercedes'),
(false, 'Apartamento tranquilo en Heliópolis'),
(true, 'Ático con vistas cerca del Rectorado'),
(true, 'Chalet para estudiantes en Felipe II');

INSERT INTO accommodations (rooms, beds, price_per_day, price_per_month, description, latitud, longitud, start_date, end_date, students, wifi, is_easy_parking, advertisement_id, owner_id, is_verified, verifications) 
VALUES 
(3, 4, 50.00, 1200.00, 'Piso amplio ideal para estudiantes a 5 minutos de Reina Mercedes', 37.3577, -5.9869, '2025-03-01', '2025-12-31', 1, true, false, 1, 1, true, 2),
(2, 3, 35.00, 900.00, 'Habitación en piso compartido justo al lado de la ETSII', 37.3586, -5.9850, '2025-04-01', '2025-11-30', 1, true, true, 2, 2, false, 1),
(4, 6, 70.00, 2000.00, 'Apartamento con buenas conexiones cerca de Viapol', 37.3760, -5.9768, '2025-05-15', '2025-10-15', 3, true, false, 3, 4, false, 1),
(1, 1, 25.00, 600.00, 'Estudio acogedor a un paso del campus Ramón y Cajal', 37.3791, -5.9776, '2025-02-01', '2025-08-31', 1, false, true, 4, 4, true, 2),
(2, 3, 40.00, 1000.00, 'Piso grande con terraza en Los Bermejales, ideal para compartir', 37.3479, -5.9901, '2025-06-01', '2025-12-15', 2, true, false, 5, 1, false, 2),
(3, 4, 55.00, 1400.00, 'Dúplex moderno en zona El Porvenir, cerca de varias facultades', 37.3748, -5.9784, '2025-07-10', '2025-10-30', 2, true, true, 6, 6, false, 1),
(5, 8, 80.00, 2500.00, 'Habitación individual en piso de estudiantes por Reina Mercedes', 37.3579, -5.9857, '2025-03-01', '2025-11-01', 4, true, true, 7, 2, false, 1),
(1, 2, 30.00, 750.00, 'Apartamento tranquilo en Heliópolis con buen ambiente', 37.3513, -5.9871, '2025-01-15', '2025-09-30', 1, true, false, 8, 6, false, 1),
(2, 2, 45.00, 1100.00, 'Ático con terraza y vistas, junto al Rectorado', 37.3845, -5.9879, '2025-05-01', '2025-10-01', 2, true, true, 9, 2, false, 1),
(4, 5, 65.00, 1800.00, 'Chalet grande en zona Felipe II, ideal para grupos de estudio', 37.3711, -5.9735, '2025-06-15', '2025-12-31', 3, true, false, 10, 10, false, 1);

INSERT INTO accommodation_images (accommodation_id, image_url) VALUES 
(1, 'piso1_1.jpg'),
(1, 'piso1_3.jpg'),
(1, 'piso1_4.jpg'),
(2, 'piso2_1.jpg'),
(2, 'piso2_3.jpg'),
(2, 'piso2_4.jpg'),
(3, 'piso3_1.jpg'),
(3, 'piso3_3.jpg'),
(3, 'piso3_4.jpg'),
(4, 'piso4_1.jpg'),
(4, 'piso4_2.jpg'),
(4, 'piso4_3.jpg'),
(4, 'piso4_4.jpg'),
(5, 'piso5_1.jpg'),
(5, 'piso5_2.jpg'),
(5, 'piso5_3.jpg'),
(5, 'piso5_4.jpg'),
(6, 'piso6_1.jpg'),
(6, 'piso6_3.jpg'),
(6, 'piso6_4.jpg'),
(7, 'piso7_1.jpg'),
(7, 'piso7_3.jpg'),
(7, 'piso7_4.jpg'),
(8, 'piso4_1.jpg'),
(8, 'piso8_2.jpg'),
(8, 'piso8_3.jpg'),
(8, 'piso8_4.jpg'),
(9, 'piso9_1.jpg'),
(9, 'piso9_3.jpg'),
(9, 'piso9_4.jpg'),
(10, 'piso10_1.jpg'),
(10, 'piso10_3.jpg'),
(10, 'piso10_4.jpg');

INSERT INTO students (user_id, is_smoker, academic_career, hobbies) VALUES 
(3, false, 'Computer Science', 'Chess, Traveling'),
(5, true, 'Engineering', 'Reading, Traveling'),
(7, false, 'Business Administration', 'Traveling'),
(8, true, 'Medicine', 'Cooking, Traveling'),
(9, false, 'Architecture', 'Photography, Traveling');

INSERT INTO bookings (student_id, booking_date, price, accommodation_id, start_date, end_date, is_verified) VALUES
(1, '2025-01-03', 400.0, 1, '2025-04-01', '2025-06-20', true),
(2, '2025-02-08', 450.0, 2, '2025-05-01', '2025-07-01', false),
(1, '2025-04-08', 850.0, 3, '2025-06-15', '2025-10-15', false),
(4, '2025-05-03', 475.0, 4, '2025-04-01', '2025-05-01', true),
(5, '2025-06-03', 1200.0, 5, '2025-08-01', '2025-10-28', true);

INSERT INTO comments (comment_date, text, rating, accommodation_id, author_id, student_id) VALUES
('2024-07-14', 'No me gustó la experiencia, esperaba más.', 1, 1, NULL, 9),
('2024-08-22', 'Muy cómodo y bien ubicado.', 4, 1, NULL, 9),
('2024-10-05', 'El proceso de reserva con ella fue fácil y rápido.', 4, NULL, 8, 9),
('2024-09-11', 'Excelente servicio y atención.', 1, NULL, 5, 8),
('2025-01-21', 'El dueño fue muy amable y servicial.', 4, NULL, 3, 8),
('2025-02-10', 'Muy cómodo y bien ubicado.', 3, 1, NULL, 7),
('2025-02-07', 'Gran experiencia, volvería a reservar aquí.', 5, 3, NULL, 7),
('2024-08-28', 'Muy buena gente', 5 , NULL, 5, 3),
('2024-09-26', 'El WiFi era lento en algunas áreas.', 2, 6, NULL, 9),
('2025-01-18', 'El WiFi era lento en algunas áreas.', 1, 6, NULL, 5);



