# Guide de Déploiement - Le Croco Brasseur sur Render

Ce guide vous accompagne pas à pas pour déployer votre site web Le Croco Brasseur sur Render.

## Prérequis

- Un compte GitHub (gratuit)
- Un compte Render (gratuit) - [render.com](https://render.com)
- Un service de base de données MySQL (voir options ci-dessous)

## Étape 1: Préparer votre dépôt GitHub

### 1.1 Initialiser Git (si ce n'est pas déjà fait)

```bash
git add .
git commit -m "Prêt pour le déploiement sur Render"
```

### 1.2 Créer un dépôt sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le `croco-brasseur-website`
4. **IMPORTANT:** Gardez-le PRIVÉ si vous avez des données sensibles
5. Ne pas initialiser avec README (vous en avez déjà un)

### 1.3 Pousser votre code vers GitHub

```bash
git remote add origin https://github.com/VOTRE-USERNAME/croco-brasseur-website.git
git branch -M master
git push -u origin master
```

## Étape 2: Configurer la Base de Données MySQL

Render ne propose pas MySQL en plan gratuit. Voici les meilleures alternatives GRATUITES:

### Option A: Railway (Recommandé - Simple et Gratuit)

1. Créez un compte sur [railway.app](https://railway.app)
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy MySQL"
4. Une fois créé, allez dans l'onglet "Variables"
5. Notez ces informations:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT` (généralement 3306)

### Option B: PlanetScale (Serverless MySQL)

1. Créez un compte sur [planetscale.com](https://planetscale.com)
2. Créez une nouvelle database
3. Récupérez la connection string MySQL

### Option C: Aiven (MySQL managé)

1. Créez un compte sur [aiven.io](https://aiven.io)
2. Créez un service MySQL (free tier)
3. Récupérez les credentials

### 2.1 Importer le schéma de base de données

Une fois votre base de données créée, exécutez le script SQL:

```bash
# Avec MySQL CLI
mysql -h VOTRE_HOST -u VOTRE_USER -p VOTRE_DATABASE < scripts/setup-database.sql

# Ou copiez-collez le contenu de scripts/setup-database.sql
# dans l'interface web de votre service de base de données
```

## Étape 3: Déployer sur Render

### 3.1 Créer le Web Service

1. Connectez-vous sur [render.com](https://render.com)
2. Cliquez sur "New +" ’ "Web Service"
3. Connectez votre dépôt GitHub `croco-brasseur-website`
4. Configurez comme suit:

**Configuration de base:**
- **Name:** `croco-brasseur` (ou votre choix)
- **Region:** Frankfurt (Europe) ou Oregon (US)
- **Branch:** `master`
- **Root Directory:** (laisser vide)
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (ou Starter si vous voulez un domaine custom)

### 3.2 Configurer les Variables d'Environnement

Dans la section "Environment" de Render, ajoutez ces variables:

```
NODE_ENV=production
PORT=10000
DB_HOST=votre-database-host.com
DB_USER=votre-database-user
DB_PASSWORD=votre-database-password
DB_NAME=croco_brasseur_db
DB_PORT=3306
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password-gmail
JWT_SECRET=une-cle-secrete-aleatoire-tres-longue
```

**IMPORTANT:**
- Utilisez les credentials de votre base de données (Railway/PlanetScale/Aiven)
- Pour `JWT_SECRET`, générez une clé aléatoire longue et complexe
- Pour `EMAIL_PASS` avec Gmail, utilisez un "App Password" (pas votre mot de passe normal)

### 3.3 Déployer

1. Cliquez sur "Create Web Service"
2. Render va automatiquement:
   - Cloner votre dépôt
   - Installer les dépendances
   - Démarrer votre application
3. Attendez quelques minutes...
4. Votre site sera accessible à: `https://croco-brasseur.onrender.com`

## Étape 4: Configurer l'Email (Gmail)

Pour que les notifications email fonctionnent:

1. Allez sur votre compte Google
2. Activez la validation en 2 étapes
3. Générez un "App Password":
   - Compte Google ’ Sécurité ’ Validation en 2 étapes ’ Mots de passe d'application
   - Sélectionnez "Mail" et votre appareil
   - Copiez le mot de passe généré (16 caractères)
4. Utilisez ce mot de passe pour `EMAIL_PASS` dans Render

## Étape 5: Tester votre déploiement

1. Visitez votre URL Render: `https://votre-app.onrender.com`
2. Testez les fonctionnalités:
   - Navigation du site
   - Formulaire de réservation
   - Formulaire de contact
   - Vérifiez les emails de confirmation

## Étape 6: Configuration du Domaine Custom (Optionnel)

Si vous avez un domaine comme `croco-brasseur.com`:

1. Dans Render, allez dans "Settings" ’ "Custom Domain"
2. Ajoutez votre domaine
3. Configurez les DNS chez votre registrar (Namecheap, GoDaddy, etc.):
   - Type: CNAME
   - Name: www (ou @)
   - Value: `votre-app.onrender.com`
4. Render configurera automatiquement SSL (HTTPS)

## Dépannage

### Le site ne charge pas

- Vérifiez les logs dans Render (Dashboard ’ Logs)
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `PORT=10000` est bien configuré

### Erreur de connexion à la base de données

- Vérifiez que vos credentials DB sont corrects
- Testez la connexion depuis un client MySQL
- Vérifiez que votre IP est autorisée (pour Railway/Aiven)
- Pour PlanetScale, assurez-vous d'utiliser la connection string complète

### Les emails ne s'envoient pas

- Vérifiez `EMAIL_USER` et `EMAIL_PASS`
- Assurez-vous d'utiliser un App Password Gmail
- Vérifiez les logs Render pour les erreurs SMTP

### Le plan gratuit de Render s'endort

Le plan gratuit de Render met votre app en veille après 15 minutes d'inactivité:
- Premier chargement peut prendre 30-60 secondes
- Solution: passez au plan Starter ($7/mois) pour éviter la mise en veille
- Alternative: utilisez un service de "ping" comme [UptimeRobot](https://uptimerobot.com)

## Mises à Jour

Pour mettre à jour votre site:

```bash
# Faites vos modifications localement
git add .
git commit -m "Description de vos changements"
git push origin master
```

Render redéploiera automatiquement votre site à chaque push!

## Sauvegardes

### Sauvegarder la base de données

```bash
# Avec Railway/Aiven
mysqldump -h HOST -u USER -p DATABASE > backup.sql

# Avec PlanetScale
# Utilisez leur interface web pour créer des backups
```

## Coûts Estimés

- **Plan Gratuit:**
  - Render Web Service: Gratuit (avec limitations)
  - Railway MySQL: Gratuit (500h/mois)
  - Total: 0$/mois

- **Plan Production Recommandé:**
  - Render Starter: $7/mois
  - Railway Pro: $5/mois (ou PlanetScale Free)
  - Total: ~$12/mois

## Support

Si vous rencontrez des problèmes:
1. Consultez les logs Render
2. Vérifiez la documentation Render: [render.com/docs](https://render.com/docs)
3. Consultez la communauté Render Discord

## Checklist de Déploiement

- [ ] Code poussé sur GitHub
- [ ] Base de données MySQL configurée (Railway/PlanetScale/Aiven)
- [ ] Schéma SQL importé
- [ ] Web Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] Email Gmail configuré (App Password)
- [ ] Déploiement réussi
- [ ] Tests de fonctionnalités (réservations, contact)
- [ ] Domaine custom configuré (optionnel)
- [ ] Backups configurés

Félicitations! Votre site Le Croco Brasseur est maintenant en ligne! =
<z
