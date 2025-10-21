-- ========================================
-- CROCO BRASSEUR - DATABASE SCHEMA
-- ========================================

-- Create database
CREATE DATABASE IF NOT EXISTS croco_brasseur_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE croco_brasseur_db;

-- ========================================
-- RESERVATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    date_reservation DATE NOT NULL,
    heure_reservation TIME NOT NULL,
    nombre_personnes INT NOT NULL,
    occasion VARCHAR(100),
    message_special TEXT,
    statut ENUM('en_attente', 'confirmee', 'annulee') DEFAULT 'en_attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date_reservation),
    INDEX idx_statut (statut),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CONTACTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    sujet VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    statut ENUM('nouveau', 'lu', 'traite') DEFAULT 'nouveau',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_statut (statut),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- EVENEMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS evenements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    type_evenement VARCHAR(100),
    date_event DATE,
    heure_debut TIME,
    heure_fin TIME,
    prix_entree DECIMAL(10, 2),
    image_url VARCHAR(500),
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date_event),
    INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- NEWSLETTER TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS newsletter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    actif BOOLEAN DEFAULT TRUE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CATERING REQUESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS catering_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_entreprise VARCHAR(255),
    nom_contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    type_evenement VARCHAR(100) NOT NULL,
    date_evenement DATE NOT NULL,
    nombre_invites INT NOT NULL,
    lieu VARCHAR(500),
    budget_estime VARCHAR(100),
    details TEXT,
    statut ENUM('nouveau', 'en_cours', 'accepte', 'refuse') DEFAULT 'nouveau',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date_evenement),
    INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- BIERES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bieres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    abv DECIMAL(4, 2),
    ibu INT,
    prix DECIMAL(10, 2),
    disponible BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERT SAMPLE DATA - EVENEMENTS
-- ========================================
INSERT INTO evenements (titre, description, type_evenement, date_event, heure_debut, heure_fin, actif) VALUES
('Karaoke Night', 'Chantez vos chansons préférées dans une ambiance conviviale. La scène vous appartient!', 'Karaoke', NULL, '19:00:00', '23:00:00', TRUE),
('Open Mic Night', 'Talents musicaux, poésie, stand-up — partagez votre art avec nous!', 'Open Mic', NULL, '20:00:00', '23:30:00', TRUE),
('Sunday Brunch', 'Brunch gourmand avec musique live et cocktails', 'Brunch', NULL, '10:00:00', '15:00:00', TRUE);

-- ========================================
-- INSERT SAMPLE DATA - BIERES
-- ========================================
INSERT INTO bieres (nom, type, description, abv, prix, disponible) VALUES
('Croco Lager', 'Lager', 'Light golden lager, perfect for hot days', 4.8, 3000, TRUE),
('Tanganyika IPA', 'IPA', 'Citrus notes with a hoppy finish', 6.2, 3500, TRUE),
('Dark Croco', 'Stout', 'Coffee and chocolate notes', 5.5, 3500, TRUE),
('Amber Ale', 'Ale', 'Smooth amber with caramel hints', 5.2, 3200, TRUE);

-- ========================================
-- ADMIN USER TABLE (Optional)
-- ========================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(255),
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    actif BOOLEAN DEFAULT TRUE,
    derniere_connexion TIMESTAMP NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VIEWS FOR REPORTING
-- ========================================

-- View for upcoming reservations
CREATE OR REPLACE VIEW reservations_a_venir AS
SELECT 
    r.*,
    CONCAT(r.prenom, ' ', r.nom) as nom_complet,
    DATE_FORMAT(r.date_reservation, '%d/%m/%Y') as date_formatee,
    TIME_FORMAT(r.heure_reservation, '%H:%i') as heure_formatee
FROM reservations r
WHERE r.date_reservation >= CURDATE()
    AND r.statut != 'annulee'
ORDER BY r.date_reservation, r.heure_reservation;

-- View for today's reservations
CREATE OR REPLACE VIEW reservations_aujourdhui AS
SELECT 
    r.*,
    CONCAT(r.prenom, ' ', r.nom) as nom_complet
FROM reservations r
WHERE DATE(r.date_reservation) = CURDATE()
    AND r.statut != 'annulee'
ORDER BY r.heure_reservation;

-- ========================================
-- STORED PROCEDURES
-- ========================================

DELIMITER //

-- Procedure to confirm reservation
CREATE PROCEDURE confirmer_reservation(IN reservation_id INT)
BEGIN
    UPDATE reservations 
    SET statut = 'confirmee' 
    WHERE id = reservation_id;
END //

-- Procedure to cancel reservation
CREATE PROCEDURE annuler_reservation(IN reservation_id INT)
BEGIN
    UPDATE reservations 
    SET statut = 'annulee' 
    WHERE id = reservation_id;
END //

-- Procedure to get statistics
CREATE PROCEDURE get_statistics()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM reservations WHERE statut = 'en_attente') as reservations_en_attente,
        (SELECT COUNT(*) FROM reservations WHERE DATE(date_reservation) = CURDATE()) as reservations_aujourdhui,
        (SELECT COUNT(*) FROM contacts WHERE statut = 'nouveau') as messages_non_lus,
        (SELECT COUNT(*) FROM newsletter WHERE actif = TRUE) as abonnes_newsletter,
        (SELECT COUNT(*) FROM catering_requests WHERE statut = 'nouveau') as demandes_catering;
END //

DELIMITER ;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Additional indexes for better query performance
CREATE INDEX idx_reservation_date_statut ON reservations(date_reservation, statut);
CREATE INDEX idx_contact_date ON contacts(date_creation);
CREATE INDEX idx_catering_date_statut ON catering_requests(date_evenement, statut);

-- ========================================
-- TRIGGERS
-- ========================================

DELIMITER //

-- Trigger to validate reservation date
CREATE TRIGGER before_reservation_insert
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
    IF NEW.date_reservation < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La date de réservation ne peut pas être dans le passé';
    END IF;
    
    IF NEW.nombre_personnes < 1 OR NEW.nombre_personnes > 50 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Le nombre de personnes doit être entre 1 et 50';
    END IF;
END //

DELIMITER ;

