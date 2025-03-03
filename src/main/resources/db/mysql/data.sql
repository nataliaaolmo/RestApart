INSERT IGNORE INTO users (id, username, email, first_name, last_name, telephone, password, date_of_birth, gender, description, photo, is_verified) VALUES 
(1, 'alice123', 'alice@example.com', 'Alice', 'Johnson', 123456789, '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', '1992-03-11', 'WOMAN','Descripción de Alice', 'alice.jpg', true),
(2, 'bob456', 'bob@example.com', 'Bob', 'Smith', 987654321, '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', '1999-12-07', 'MAN','Descripción de Bob', 'bob.jpg', false),
(3, 'charlie789', 'charlie@example.com', 'Charlie', 'Brown', 567123890, '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', '2001-05-19', 'MAN','Descripción de Charlie', 'charlie.jpg', true),
(4, 'diana001', 'diana@example.com', 'Diana', 'Prince', 654321987, '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', '1990-11-11', 'WOMAN','Descripción de Diana', 'diana.jpg', true),
(5, 'edward_dev', 'edward@example.com', 'Edward', 'Snowden', 321789654, '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', '2003-04-22', 'MAN','Descripción de Edward', 'edward.jpg', false);
