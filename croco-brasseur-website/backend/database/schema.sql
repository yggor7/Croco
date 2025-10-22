-- CROCO BRASSEUR DATABASE SCHEMA
-- This file contains all table definitions for the restaurant management system

-- ========================================
-- ADMIN USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- ========================================
-- GALLERY IMAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    category ENUM('interieur', 'food', 'beers', 'events', 'other') DEFAULT 'other',
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_actif (actif),
    INDEX idx_ordre (ordre)
);

-- ========================================
-- VIDEOS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    filename VARCHAR(255),
    filepath VARCHAR(500),
    video_url VARCHAR(500),
    video_type ENUM('upload', 'youtube', 'vimeo') DEFAULT 'upload',
    thumbnail_path VARCHAR(500),
    duree INT COMMENT 'Duration in seconds',
    category ENUM('hero', 'gallery', 'promo', 'event') DEFAULT 'gallery',
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_actif (actif),
    INDEX idx_video_type (video_type)
);

-- ========================================
-- MENU CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    nom_en VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ordre (ordre),
    INDEX idx_actif (actif)
);

-- ========================================
-- MENU ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    nom VARCHAR(200) NOT NULL,
    nom_en VARCHAR(200),
    description TEXT,
    description_en TEXT,
    prix DECIMAL(10, 2),
    prix_devise VARCHAR(10) DEFAULT 'BIF',
    image_path VARCHAR(500),
    ingredients TEXT,
    allergenes TEXT,
    vegetarien BOOLEAN DEFAULT FALSE,
    vegan BOOLEAN DEFAULT FALSE,
    sans_gluten BOOLEAN DEFAULT FALSE,
    epice_niveau ENUM('doux', 'moyen', 'epice', 'tres_epice') DEFAULT 'doux',
    populaire BOOLEAN DEFAULT FALSE,
    nouveau BOOLEAN DEFAULT FALSE,
    disponible BOOLEAN DEFAULT TRUE,
    ordre INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_disponible (disponible),
    INDEX idx_populaire (populaire),
    INDEX idx_ordre (ordre)
);

-- ========================================
-- RESERVATIONS TABLE (Already exists, adding if not)
-- ========================================
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    date_reservation DATE NOT NULL,
    heure_reservation TIME NOT NULL,
    nombre_personnes INT NOT NULL,
    occasion VARCHAR(100),
    message_special TEXT,
    statut ENUM('en_attente', 'confirmee', 'annulee', 'terminee') DEFAULT 'en_attente',
    notes_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date_reservation),
    INDEX idx_statut (statut),
    INDEX idx_email (email)
);

-- ========================================
-- CONTACTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    sujet VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    statut ENUM('nouveau', 'lu', 'traite') DEFAULT 'nouveau',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_statut (statut),
    INDEX idx_email (email)
);

-- ========================================
-- NEWSLETTER TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS newsletter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_actif (actif)
);

-- ========================================
-- EVENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS evenements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    titre_en VARCHAR(200),
    description TEXT,
    description_en TEXT,
    date_event DATE,
    heure_debut TIME,
    heure_fin TIME,
    type_event ENUM('karaoke', 'open_mic', 'brunch', 'live_music', 'special', 'autre') DEFAULT 'autre',
    image_path VARCHAR(500),
    prix_entree DECIMAL(10, 2),
    recurrent BOOLEAN DEFAULT FALSE,
    jour_semaine ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date_event),
    INDEX idx_type (type_event),
    INDEX idx_actif (actif)
);

-- ========================================
-- ADMIN ACTIVITY LOG
-- ========================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_admin (admin_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- ========================================
-- INSERT DEFAULT ADMIN USER
-- ========================================
-- Default password: 'admin123' (should be changed after first login)
-- Password hash generated with bcrypt
INSERT INTO admin_users (username, email, password_hash, nom_complet, role)
VALUES ('admin', 'admin@crocobrasseur.com', '$2b$10$8ZqP8Hm5gYxXvXqN0qN0J.HxGpQvRvJzGXqQVvN5xQqGvQVQvQ5Gq', 'Administrateur Croco', 'super_admin')
ON DUPLICATE KEY UPDATE username = username;

-- ========================================
-- INSERT DEFAULT MENU CATEGORIES
-- ========================================
INSERT INTO menu_categories (nom, nom_en, description, icon, ordre) VALUES
('Petit Déjeuner', 'Breakfast', 'Commencez votre journée du bon pied', 'fa-coffee', 1),
('Brunch', 'Brunch', 'Le meilleur des deux mondes', 'fa-utensils', 2),
('Grillades Africaines', 'African Grills', 'Spécialités locales grillées', 'fa-drumstick-bite', 3),
('Burgers & Sandwichs', 'Burgers & Sandwiches', 'Classiques revisités', 'fa-hamburger', 4),
('Pizzas', 'Pizzas', 'Cuites au feu de bois', 'fa-pizza-slice', 5),
('Plats Internationaux', 'International Dishes', 'Saveurs du monde', 'fa-globe', 6),
('Entrées & Tapas', 'Appetizers & Tapas', 'Pour partager', 'fa-cheese', 7),
('Salades', 'Salads', 'Fraîches et croquantes', 'fa-leaf', 8),
('Desserts', 'Desserts', 'Douceurs gourmandes', 'fa-ice-cream', 9),
('Bières Artisanales', 'Craft Beers', 'Brassées sur place', 'fa-beer', 10),
('Cocktails', 'Cocktails', 'Créations maison', 'fa-cocktail', 11),
('Vins', 'Wines', 'Sélection premium', 'fa-wine-bottle', 12),
('Boissons Sans Alcool', 'Non-Alcoholic Drinks', 'Jus et mocktails', 'fa-glass-water', 13)
ON DUPLICATE KEY UPDATE nom = nom;
