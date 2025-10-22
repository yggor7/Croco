# Le Croco Brasseur - Configuration du Panel d'Administration

## Vue d'ensemble

Ce système d'administration permet de gérer dynamiquement:
- **Photos de la galerie** (upload, catégorisation, organisation)
- **Vidéos** (upload local ou liens YouTube/Vimeo)
- **Menu** (catégories, items, prix, images)
- **Réservations** (visualisation, gestion des statuts)

## Prérequis

- **Node.js** (version 14 ou supérieure)
- **MySQL** (version 5.7 ou supérieure)
- **npm** ou **yarn**

## Installation

### 1. Installer les dépendances

```bash
cd c:\Users\igorm\OneDrive\Documents\Mes programmes\Claude\croco\croco-brasseur-website
npm install
```

Si l'installation échoue pour certains packages, installez-les manuellement:

```bash
npm install multer bcrypt jsonwebtoken
```

### 2. Configuration de la base de données

#### A. Créer la base de données

Connectez-vous à MySQL et créez la base de données:

```sql
CREATE DATABASE croco_brasseur_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### B. Importer le schéma

Exécutez le script SQL pour créer toutes les tables:

```bash
mysql -u root -p croco_brasseur_db < backend/database/schema.sql
```

Ou via MySQL Workbench/phpMyAdmin, exécutez le fichier `backend/database/schema.sql`

#### C. Créer un utilisateur admin

Le script crée automatiquement un admin par défaut:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Changez ce mot de passe après la première connexion!

Pour créer un nouvel admin manuellement:

```sql
-- Générez d'abord un hash bcrypt du mot de passe avec Node.js:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('votremotdepasse', 10, (err, hash) => console.log(hash));"

INSERT INTO admin_users (username, email, password_hash, nom_complet, role)
VALUES ('votre_username', 'votre@email.com', 'HASH_BCRYPT_ICI', 'Votre Nom', 'admin');
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=croco_brasseur_db

# Server
PORT=3000
NODE_ENV=development

# Email (pour les notifications)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# JWT Secret (générez une clé aléatoire forte)
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire
```

### 4. Créer les dossiers pour les uploads

```bash
mkdir -p frontend/assets/images/gallery
mkdir -p frontend/assets/images/menu
mkdir -p frontend/assets/videos
```

## Démarrage du serveur

### Mode développement (avec nodemon)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## Accès au panel d'administration

1. Ouvrez votre navigateur
2. Accédez à: `http://localhost:3000/admin/login.html`
3. Connectez-vous avec les identifiants par défaut:
   - **Username:** `admin`
   - **Password:** `admin123`

## Structure des fichiers admin

```
frontend/admin/
├── css/
│   └── admin.css          # Styles du panel admin
├── js/
│   ├── admin-auth.js      # Authentification et helpers
│   ├── dashboard.js       # Dashboard principal
│   ├── gallery.js         # Gestion de la galerie
│   ├── reservations.js    # Gestion des réservations
│   └── (autres fichiers JS pour menu et vidéos)
├── login.html             # Page de connexion
├── dashboard.html         # Dashboard principal
├── gallery.html           # Gestion de la galerie
├── videos.html            # Gestion des vidéos
├── menu.html              # Gestion du menu
└── reservations.html      # Visualisation des réservations

backend/
├── config/
│   └── database.js        # Configuration BDD
├── controllers/
│   ├── authController.js  # Authentification admin
│   ├── galleryController.js
│   ├── videoController.js
│   ├── menuController.js
│   └── bookingController.js
├── middleware/
│   └── auth.js            # Middleware JWT
├── routes/
│   ├── admin.js           # Routes admin
│   └── booking.js         # Routes réservations publiques
├── database/
│   └── schema.sql         # Schéma de la base de données
└── server.js              # Serveur Express principal
```

## Fonctionnalités

### 1. Gestion de la Galerie

**Ajouter une image:**
- Cliquez sur "Ajouter une Image"
- Sélectionnez l'image (max 10MB)
- Remplissez le titre et la description
- Choisissez une catégorie (Intérieur, Cuisine, Bières, Événements, Autre)
- Définissez l'ordre d'affichage
- Activez/désactivez l'image

**Catégories disponibles:**
- `interieur` - Photos de l'intérieur du restaurant
- `food` - Photos des plats et de la cuisine
- `beers` - Photos des bières artisanales
- `events` - Photos des événements
- `other` - Autres photos

**Modifier/Supprimer:**
- Cliquez sur l'icône d'édition pour modifier
- Cliquez sur l'icône de suppression pour supprimer

### 2. Gestion des Vidéos

**Types de vidéos supportés:**
- **Upload local:** MP4, AVI, MOV, WEBM (max 100MB)
- **YouTube:** Collez l'URL de la vidéo YouTube
- **Vimeo:** Collez l'URL de la vidéo Vimeo

**Catégories:**
- `hero` - Vidéo d'en-tête du site
- `gallery` - Galerie de vidéos
- `promo` - Vidéos promotionnelles
- `event` - Vidéos d'événements

### 3. Gestion du Menu

**Structure:**
- **Catégories de menu:** Organisez vos plats par catégorie
- **Items du menu:** Plats individuels avec détails

**Informations pour chaque plat:**
- Nom (français et anglais)
- Description
- Prix (en BIF ou autre devise)
- Image
- Ingrédients et allergènes
- Options: Végétarien, Vegan, Sans gluten
- Niveau d'épices
- Badges: Populaire, Nouveau

### 4. Visualisation des Réservations

**Informations affichées:**
- Nom du client
- Coordonnées (email, téléphone)
- Date et heure
- Nombre de personnes
- Occasion spéciale
- Messages spéciaux
- Statut

**Gestion des statuts:**
- `en_attente` - Réservation en attente de confirmation
- `confirmee` - Réservation confirmée
- `annulee` - Réservation annulée
- `terminee` - Réservation terminée

**Actions:**
- Voir les détails complets
- Changer le statut
- Supprimer la réservation

## API Endpoints

### Authentification

```
POST /api/admin/auth/login        - Connexion admin
GET  /api/admin/auth/profile      - Profil admin (protégé)
POST /api/admin/auth/change-password - Changer mot de passe (protégé)
POST /api/admin/auth/logout       - Déconnexion (protégé)
```

### Galerie

```
GET    /api/admin/gallery         - Liste des images (protégé)
GET    /api/admin/gallery/:id     - Détails d'une image (protégé)
POST   /api/admin/gallery         - Upload image (protégé, admin)
PUT    /api/admin/gallery/:id     - Modifier image (protégé, admin)
DELETE /api/admin/gallery/:id     - Supprimer image (protégé, admin)
POST   /api/admin/gallery/reorder - Réorganiser images (protégé, admin)
```

### Vidéos

```
GET    /api/admin/videos          - Liste des vidéos (protégé)
GET    /api/admin/videos/:id      - Détails d'une vidéo (protégé)
POST   /api/admin/videos          - Ajouter vidéo (protégé, admin)
PUT    /api/admin/videos/:id      - Modifier vidéo (protégé, admin)
DELETE /api/admin/videos/:id      - Supprimer vidéo (protégé, admin)
```

### Menu

```
GET    /api/admin/menu/categories     - Liste des catégories (protégé)
POST   /api/admin/menu/categories     - Créer catégorie (protégé, admin)
PUT    /api/admin/menu/categories/:id - Modifier catégorie (protégé, admin)
DELETE /api/admin/menu/categories/:id - Supprimer catégorie (protégé, admin)

GET    /api/admin/menu/items          - Liste des items (protégé)
GET    /api/admin/menu/items/:id      - Détails d'un item (protégé)
POST   /api/admin/menu/items          - Créer item (protégé, admin)
PUT    /api/admin/menu/items/:id      - Modifier item (protégé, admin)
DELETE /api/admin/menu/items/:id      - Supprimer item (protégé, admin)

GET    /api/menu                      - Menu public (pour le site)
```

### Réservations

```
GET    /api/admin/reservations            - Liste des réservations (protégé)
GET    /api/admin/reservations/:id        - Détails réservation (protégé)
PUT    /api/admin/reservations/:id/status - Changer statut (protégé, admin)
DELETE /api/admin/reservations/:id        - Supprimer (protégé, admin)
```

### Dashboard

```
GET    /api/admin/dashboard/stats    - Statistiques dashboard (protégé)
```

## Sécurité

### Authentification JWT

- Les tokens JWT expirent après 24 heures
- Le token est stocké dans le localStorage du navigateur
- Chaque requête API inclut le token dans l'en-tête `Authorization: Bearer TOKEN`

### Protection des routes

- Toutes les routes admin sont protégées par le middleware `verifyToken`
- Certaines actions nécessitent le rôle `admin` ou `super_admin`

### Bonnes pratiques

1. **Changez le mot de passe par défaut**
2. **Utilisez une clé JWT_SECRET forte** (minimum 32 caractères aléatoires)
3. **Configurez HTTPS en production**
4. **Limitez les tailles de fichiers** (déjà configuré: 10MB images, 100MB vidéos)
5. **Sauvegardez régulièrement la base de données**

## Intégration au site public

### Afficher les images de la galerie

```javascript
// Dans votre code frontend public
fetch('http://localhost:3000/api/gallery?actif=true')
    .then(res => res.json())
    .then(data => {
        // Utilisez data.data pour afficher les images
    });
```

### Afficher le menu

```javascript
fetch('http://localhost:3000/api/menu')
    .then(res => res.json())
    .then(data => {
        // data.data contient les catégories avec leurs items
    });
```

### Vidéos de la galerie

```javascript
fetch('http://localhost:3000/api/videos?actif=true&category=gallery')
    .then(res => res.json())
    .then(data => {
        // Utilisez data.data pour afficher les vidéos
    });
```

## Dépannage

### Erreur de connexion à la base de données

Vérifiez:
- MySQL est démarré
- Les identifiants dans `.env` sont corrects
- La base de données `croco_brasseur_db` existe

### Erreur "Token invalide"

- Le token JWT a expiré, reconnectez-vous
- Vérifiez que `JWT_SECRET` est le même entre les sessions

### Upload d'image échoue

- Vérifiez que le dossier `frontend/assets/images/gallery` existe
- Vérifiez les permissions d'écriture du dossier
- Vérifiez la taille du fichier (max 10MB pour images)

### Erreur CORS

Si vous accédez depuis un domaine différent, ajoutez dans `server.js`:

```javascript
app.use(cors({
    origin: 'http://votre-domaine.com',
    credentials: true
}));
```

## Support et Maintenance

### Logs

Les logs du serveur apparaissent dans la console où vous avez démarré le serveur.

### Sauvegarde de la base de données

```bash
mysqldump -u root -p croco_brasseur_db > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
mysql -u root -p croco_brasseur_db < backup_20250101.sql
```

## Améliorations futures possibles

- [ ] Système de rôles plus granulaire
- [ ] Export des réservations en CSV/Excel
- [ ] Statistiques avancées avec graphiques
- [ ] Envoi de notifications par WhatsApp
- [ ] Gestion des événements
- [ ] Système de newsletter
- [ ] Multi-langue pour le panel admin
- [ ] Upload en masse pour la galerie
- [ ] Éditeur WYSIWYG pour les descriptions

---

**Développé pour Le Croco Brasseur**
*Bujumbura's Premier Gastro-Brewpub*

Pour toute question ou assistance, contactez l'équipe technique.
