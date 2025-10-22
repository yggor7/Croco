# 🚀 Démarrage Rapide - Le Croco Brasseur Admin

## ✅ Le serveur démarre maintenant!

Votre serveur backend démarre correctement. Il reste juste à configurer la base de données.

## 📝 Étapes pour terminer la configuration

### 1. Créer le fichier .env

Copiez le fichier `.env.example` en `.env`:

```bash
copy .env.example .env
```

Puis ouvrez `.env` et configurez au minimum:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=croco_brasseur_db
PORT=3000
JWT_SECRET=une_cle_tres_longue_et_aleatoire
```

### 2. Créer la base de données MySQL

Ouvrez MySQL (via cmd, phpMyAdmin, ou MySQL Workbench):

```sql
CREATE DATABASE croco_brasseur_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Importer le schéma

**Option A - Via ligne de commande:**
```bash
mysql -u root -p croco_brasseur_db < backend/database/schema.sql
```

**Option B - Via phpMyAdmin:**
1. Sélectionnez la base `croco_brasseur_db`
2. Cliquez sur "Importer"
3. Choisissez le fichier `backend/database/schema.sql`
4. Cliquez sur "Exécuter"

**Option C - Copier/coller le SQL:**
Ouvrez `backend/database/schema.sql` et exécutez le contenu dans votre client MySQL

### 4. Redémarrer le serveur

Le serveur devrait redémarrer automatiquement avec nodemon. Vous verrez:

```
✅ Database connected successfully
🐊 Le Croco Brasseur - Server Running
🐊 Port: 3000
🐊 URL: http://localhost:3000
```

### 5. Accéder au panel admin

Ouvrez votre navigateur et allez sur:
```
http://localhost:3000/admin/login.html
```

**Identifiants par défaut:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Changez ce mot de passe après la première connexion!

## 📊 Structure des pages admin

Une fois connecté, vous aurez accès à:

- **Dashboard** - Vue d'ensemble avec statistiques
- **Réservations** - Gestion des réservations clients
- **Galerie** - Upload et gestion des photos
- **Vidéos** - Upload et gestion des vidéos
- **Menu** - Gestion du menu et des catégories

## 🔧 Commandes utiles

```bash
# Démarrer le serveur (dev avec auto-reload)
npm run dev

# Démarrer le serveur (production)
npm start

# Arrêter le serveur
Ctrl + C

# Voir les logs
# Les logs s'affichent directement dans la console
```

## ⚠️ Problèmes courants

### Le serveur ne se connecte pas à MySQL

Vérifiez:
1. MySQL est démarré
2. Le mot de passe dans `.env` est correct
3. La base de données existe: `SHOW DATABASES;`

### "Token invalide" dans le panel admin

Le token JWT a expiré (24h). Reconnectez-vous.

### Upload d'images ne fonctionne pas

Vérifiez que ces dossiers existent:
```bash
mkdir frontend\assets\images\gallery
mkdir frontend\assets\images\menu
mkdir frontend\assets\videos
```

## 📚 Documentation complète

Voir [ADMIN_SETUP.md](ADMIN_SETUP.md) pour:
- Configuration avancée
- API endpoints
- Sécurité
- Intégration au site public
- Et plus encore...

## 💡 Note sur les emails

Les emails sont **optionnels**. Le système fonctionne sans configuration email.

Pour activer les emails:
1. Décommentez `EMAIL_USER` et `EMAIL_PASS` dans `.env`
2. Utilisez un mot de passe d'application Gmail
3. Redémarrez le serveur

## ✅ Checklist de démarrage

- [ ] Copier `.env.example` en `.env`
- [ ] Configurer les identifiants MySQL dans `.env`
- [ ] Créer la base de données `croco_brasseur_db`
- [ ] Importer le schéma SQL
- [ ] Redémarrer le serveur
- [ ] Accéder à `http://localhost:3000/admin/login.html`
- [ ] Se connecter avec `admin / admin123`
- [ ] Changer le mot de passe par défaut

---

**Besoin d'aide?** Consultez [ADMIN_SETUP.md](ADMIN_SETUP.md) pour plus de détails.
