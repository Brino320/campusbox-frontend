-- Créer la base si elle n'existe pas
CREATE DATABASE IF NOT EXISTS campusbox_db;
USE campusbox_db;

-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    filiere ENUM('DGL', 'RIT') NOT NULL,
    classe ENUM('L1') DEFAULT 'L1',
    role ENUM('user', 'admin') DEFAULT 'user',
    is_email_confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);