# Guide de D�ploiement - Le Croco Brasseur sur Render

Ce guide vous accompagne pas � pas pour d�ployer votre site web Le Croco Brasseur sur Render.

## Pr�requis

- Un compte GitHub (gratuit)
- Un compte Render (gratuit) - [render.com](https://render.com)
- Un service de base de donn�es MySQL (voir options ci-dessous)

## �tape 1: Pr�parer votre d�p�t GitHub

### 1.1 Initialiser Git (si ce n'est pas d�j� fait)

```bash
git add .
git commit -m "Pr�t pour le d�ploiement sur Render"
```

### 1.2 Cr�er un d�p�t sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le `croco-brasseur-website`
4. **IMPORTANT:** Gardez-le PRIV� si vous avez des donn�es sensibles
5. Ne pas initialiser avec README (vous en avez d�j� un)

### 1.3 Pousser votre code vers GitHub

```bash
git remote add origin https://github.com/VOTRE-USERNAME/croco-brasseur-website.git
git branch -M master
git push -u origin master
```

## �tape 2: Configurer la Base de Donn�es MySQL

Render ne propose pas MySQL en plan gratuit. Voici les meilleures alternatives GRATUITES:

### Option A: Railway (Recommand� - Simple et Gratuit)

1. Cr�ez un compte sur [railway.app](https://railway.app)
2. Cliquez sur "New Project"
3. S�lectionnez "Deploy MySQL"
4. Une fois cr��, allez dans l'onglet "Variables"
5. Notez ces informations:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT` (g�n�ralement 3306)

### Option B: PlanetScale (Serverless MySQL)

1. Cr�ez un compte sur [planetscale.com](https://planetscale.com)
2. Cr�ez une nouvelle database
3. R�cup�rez la connection string MySQL

### Option C: Aiven (MySQL manag�)

1. Cr�ez un compte sur [aiven.io](https://aiven.io)
2. Cr�ez un service MySQL (free tier)
3. R�cup�rez les credentials

### 2.1 Importer le sch�ma de base de donn�es

Une fois votre base de donn�es cr��e, ex�cutez le script SQL:

```bash
# Avec MySQL CLI
mysql -h VOTRE_HOST -u VOTRE_USER -p VOTRE_DATABASE < scripts/setup-database.sql

# Ou copiez-collez le contenu de scripts/setup-database.sql
# dans l'interface web de votre service de base de donn�es
```

## �tape 3: D�ployer sur Render

### 3.1 Cr�er le Web Service

1. Connectez-vous sur [render.com](https://render.com)
2. Cliquez sur "New +" � "Web Service"
3. Connectez votre d�p�t GitHub `croco-brasseur-website`
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
- Utilisez les credentials de votre base de donn�es (Railway/PlanetScale/Aiven)
- Pour `JWT_SECRET`, g�n�rez une cl� al�atoire longue et complexe
- Pour `EMAIL_PASS` avec Gmail, utilisez un "App Password" (pas votre mot de passe normal)

### 3.3 D�ployer

1. Cliquez sur "Create Web Service"
2. Render va automatiquement:
   - Cloner votre d�p�t
   - Installer les d�pendances
   - D�marrer votre application
3. Attendez quelques minutes...
4. Votre site sera accessible �: `https://croco-brasseur.onrender.com`

## �tape 4: Configurer l'Email (Gmail)

Pour que les notifications email fonctionnent:

1. Allez sur votre compte Google
2. Activez la validation en 2 �tapes
3. G�n�rez un "App Password":
   - Compte Google � S�curit� � Validation en 2 �tapes � Mots de passe d'application
   - S�lectionnez "Mail" et votre appareil
   - Copiez le mot de passe g�n�r� (16 caract�res)
4. Utilisez ce mot de passe pour `EMAIL_PASS` dans Render

## �tape 5: Tester votre d�ploiement

1. Visitez votre URL Render: `https://votre-app.onrender.com`
2. Testez les fonctionnalit�s:
   - Navigation du site
   - Formulaire de r�servation
   - Formulaire de contact
   - V�rifiez les emails de confirmation

## �tape 6: Configuration du Domaine Custom (Optionnel)

Si vous avez un domaine comme `croco-brasseur.com`:

1. Dans Render, allez dans "Settings" � "Custom Domain"
2. Ajoutez votre domaine
3. Configurez les DNS chez votre registrar (Namecheap, GoDaddy, etc.):
   - Type: CNAME
   - Name: www (ou @)
   - Value: `votre-app.onrender.com`
4. Render configurera automatiquement SSL (HTTPS)

## D�pannage

### Le site ne charge pas

- V�rifiez les logs dans Render (Dashboard � Logs)
- Assurez-vous que toutes les variables d'environnement sont d�finies
- V�rifiez que `PORT=10000` est bien configur�

### Erreur de connexion � la base de donn�es

- V�rifiez que vos credentials DB sont corrects
- Testez la connexion depuis un client MySQL
- V�rifiez que votre IP est autoris�e (pour Railway/Aiven)
- Pour PlanetScale, assurez-vous d'utiliser la connection string compl�te

### Les emails ne s'envoient pas

- V�rifiez `EMAIL_USER` et `EMAIL_PASS`
- Assurez-vous d'utiliser un App Password Gmail
- V�rifiez les logs Render pour les erreurs SMTP

### Le plan gratuit de Render s'endort

Le plan gratuit de Render met votre app en veille apr�s 15 minutes d'inactivit�:
- Premier chargement peut prendre 30-60 secondes
- Solution: passez au plan Starter ($7/mois) pour �viter la mise en veille
- Alternative: utilisez un service de "ping" comme [UptimeRobot](https://uptimerobot.com)

## Mises � Jour

Pour mettre � jour votre site:

```bash
# Faites vos modifications localement
git add .
git commit -m "Description de vos changements"
git push origin master
```

Render red�ploiera automatiquement votre site � chaque push!

## Sauvegardes

### Sauvegarder la base de donn�es

```bash
# Avec Railway/Aiven
mysqldump -h HOST -u USER -p DATABASE > backup.sql

# Avec PlanetScale
# Utilisez leur interface web pour cr�er des backups
```

## Co�ts Estim�s

- **Plan Gratuit:**
  - Render Web Service: Gratuit (avec limitations)
  - Railway MySQL: Gratuit (500h/mois)
  - Total: 0$/mois

- **Plan Production Recommand�:**
  - Render Starter: $7/mois
  - Railway Pro: $5/mois (ou PlanetScale Free)
  - Total: ~$12/mois

## Support

Si vous rencontrez des probl�mes:
1. Consultez les logs Render
2. V�rifiez la documentation Render: [render.com/docs](https://render.com/docs)
3. Consultez la communaut� Render Discord

## Checklist de D�ploiement

- [ ] Code pouss� sur GitHub
- [ ] Base de donn�es MySQL configur�e (Railway/PlanetScale/Aiven)
- [ ] Sch�ma SQL import�
- [ ] Web Service cr�� sur Render
- [ ] Variables d'environnement configur�es
- [ ] Email Gmail configur� (App Password)
- [ ] D�ploiement r�ussi
- [ ] Tests de fonctionnalit�s (r�servations, contact)
- [ ] Domaine custom configur� (optionnel)
- [ ] Backups configur�s

F�licitations! Votre site Le Croco Brasseur est maintenant en ligne! =
<z
