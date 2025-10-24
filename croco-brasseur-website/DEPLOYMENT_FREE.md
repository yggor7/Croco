# D�ploiement 100% GRATUIT - Le Croco Brasseur

Guide complet pour d�ployer votre site **totalement gratuitement** avec Render + Railway.

## <� Solution 100% Gratuite

- **H�bergement Web:** Render (Plan Free)
- **Base de donn�es MySQL:** Railway (500h/mois gratuit)
- **Co�t total:** 0�/mois

## � D�ploiement Rapide (15 minutes)

### �tape 1: GitHub (2 min)

```bash
# Dans le dossier de votre projet
git add .
git commit -m "Pr�t pour d�ploiement gratuit"
git push origin master
```

Si vous n'avez pas encore de d�p�t GitHub:
1. Cr�ez un compte sur [github.com](https://github.com)
2. Cr�ez un nouveau d�p�t (PRIV� recommand�)
3. Suivez les instructions pour pousser votre code

### �tape 2: Railway - Base de donn�es MySQL GRATUITE (5 min)

#### 2.1 Cr�er le compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez "Start a New Project"
3. Connectez-vous avec GitHub (recommand�)
4. **Plan gratuit:** 500 heures/mois + 5$/mois de cr�dit

#### 2.2 Cr�er la base de donn�es MySQL

1. Cliquez sur "New Project"
2. S�lectionnez "Deploy MySQL"
3. Attendez 30 secondes que le d�ploiement se termine

#### 2.3 R�cup�rer les credentials

1. Cliquez sur votre service MySQL
2. Allez dans l'onglet "Variables"
3. Notez ces valeurs (vous en aurez besoin pour Render):

```
MYSQL_HOST (exemple: containers-us-west-123.railway.app)
MYSQL_PORT (g�n�ralement 3306 ou un port al�atoire)
MYSQL_USER (g�n�ralement root)
MYSQL_PASSWORD (une longue cha�ne al�atoire)
MYSQL_DATABASE (g�n�ralement railway)
```

**ASTUCE:** Cliquez sur l'ic�ne "=A" pour voir les valeurs compl�tes

#### 2.4 Importer le sch�ma de base de donn�es

**Option A - Via l'interface Railway (Recommand�):**
1. Dans Railway, cliquez sur votre MySQL
2. Allez dans l'onglet "Query"
3. Copiez le contenu de `scripts/setup-database.sql`
4. Collez et ex�cutez

**Option B - Via MySQL CLI:**
```bash
# Remplacez par vos vraies valeurs
mysql -h VOTRE_MYSQL_HOST -P VOTRE_MYSQL_PORT -u VOTRE_MYSQL_USER -p VOTRE_MYSQL_DATABASE < scripts/setup-database.sql
```

### �tape 3: Render - H�bergement Web GRATUIT (8 min)

#### 3.1 Cr�er le compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez "Get Started for Free"
3. Connectez-vous avec GitHub

#### 3.2 Cr�er le Web Service

1. Cliquez "New +" en haut � droite
2. S�lectionnez "Web Service"
3. Connectez votre d�p�t GitHub `croco-brasseur-website`
4. Configurez:

**Configuration de base:**
```
Name: croco-brasseur
Region: Frankfurt (ou proche de vous)
Branch: master
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: FREE
```

#### 3.3 Configurer les variables d'environnement

Avant de d�ployer, ajoutez ces variables (section "Environment"):

**OBLIGATOIRES (Base de donn�es):**
```
NODE_ENV=production
PORT=10000
DB_HOST=votre-host-railway.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre-mot-de-passe-railway
DB_NAME=railway
```

**OPTIONNELLES (Email - peut �tre ajout� plus tard):**
```
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password
JWT_SECRET=une-cle-secrete-aleatoire-longue
```

**IMPORTANT:** Utilisez les valeurs exactes de Railway (�tape 2.3)

#### 3.4 D�ployer

1. Cliquez "Create Web Service"
2. Attendez 2-3 minutes pendant le d�ploiement
3. Votre site sera disponible �: `https://croco-brasseur.onrender.com`

##  V�rification

1. Visitez votre URL Render
2. Testez la page d'accueil
3. Testez le formulaire de r�servation
4. V�rifiez dans Railway > MySQL > Data que les r�servations sont enregistr�es

## =� Configuration Email (Optionnel)

Pour recevoir les notifications de r�servation par email:

### Gmail App Password

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. S�curit� � Validation en 2 �tapes (activez si n�cessaire)
3. Mots de passe d'application
4. Cr�ez un mot de passe pour "Mail"
5. Copiez le code � 16 caract�res
6. Dans Render, ajoutez:
   - `EMAIL_USER`: votre-email@gmail.com
   - `EMAIL_PASS`: le code � 16 caract�res

### Test

Faites une r�servation sur votre site, vous devriez recevoir un email!

## =� Limitations du Plan Gratuit

### Render Free Plan

 **Avantages:**
- H�bergement illimit�
- SSL automatique (HTTPS)
- D�ploiement automatique � chaque push GitHub

� **Limitations:**
- **Mise en veille:** Apr�s 15 min d'inactivit�, le site s'endort
- **R�veil:** Premier chargement = 30-60 secondes
- **Bande passante:** 100 GB/mois (largement suffisant)

### Railway Free Plan

 **Avantages:**
- MySQL complet et performant
- 500 heures/mois (H 20 jours)
- 5$ de cr�dit/mois

� **Astuce pour �conomiser les heures:**
Le compteur tourne 24h/24. Si vous approchez de la limite:
- Suspendez temporairement le service MySQL dans Railway
- Ou utilisez PlanetScale (MySQL serverless, compte seulement quand utilis�)

## = �viter la mise en veille (Gratuit!)

### Option 1: UptimeRobot (Recommand�)

1. Cr�ez un compte sur [uptimerobot.com](https://uptimerobot.com) (GRATUIT)
2. Ajoutez un nouveau monitor:
   - Type: HTTP(s)
   - URL: `https://votre-app.onrender.com/api/health`
   - Interval: 5 minutes
3. UptimeRobot pingera votre site toutes les 5 minutes = pas de mise en veille!

### Option 2: Cron-job.org

1. Cr�ez un compte sur [cron-job.org](https://cron-job.org)
2. Cr�ez un cronjob qui appelle votre URL toutes les 5-10 minutes

### Option 3: Script GitHub Actions (Avanc�)

Cr�ez `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/10 * * * *'  # Toutes les 10 minutes
jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping site
        run: curl https://votre-app.onrender.com/api/health
```

## = Mises � jour

Pour mettre � jour votre site:

```bash
git add .
git commit -m "Mise � jour du site"
git push origin master
```

Render red�ploie automatiquement (2-3 min) (

## =� Sauvegardes

### Sauvegarder la base de donn�es Railway

**Via l'interface:**
1. Railway � MySQL � Data
2. Exportez les tables en SQL

**Via CLI:**
```bash
mysqldump -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p RAILWAY_DATABASE > backup.sql
```

**Planifiez des sauvegardes r�guli�res!** (une fois par semaine recommand�)

## = D�pannage

### "Application failed to respond"

1. V�rifiez les logs Render (Dashboard � Logs)
2. V�rifiez que `PORT=10000` est bien configur�
3. V�rifiez que toutes les variables DB sont correctes

### Erreur de connexion base de donn�es

1. V�rifiez les credentials Railway
2. Dans Railway, v�rifiez que MySQL est bien "Active" (pas suspendu)
3. Testez la connexion:
   ```bash
   mysql -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p
   ```

### Le site charge lentement

C'est normal sur le plan gratuit lors du premier acc�s (r�veil = 30-60 sec).
Solution: Utilisez UptimeRobot pour �viter la mise en veille.

### Railway: "500 hours exceeded"

Vous avez d�pass� les 500h/mois. Solutions:
1. Attendez le mois prochain (reset automatique)
2. Passez au plan Railway Hobby ($5/mois)
3. Ou migrez vers PlanetScale (gratuit, serverless)

## =� Alternative: PlanetScale (au lieu de Railway)

Si Railway ne vous convient pas:

1. Cr�ez un compte sur [planetscale.com](https://planetscale.com)
2. Cr�ez une database
3. **Avantage:** Vraiment gratuit � vie, serverless (compte seulement quand utilis�)
4. **Inconv�nient:** Pas de foreign keys (pas grave pour ce projet)

## =� Monitoring (Gratuit)

### Voir les visiteurs

**Google Analytics (Gratuit):**
1. Cr�ez un compte Google Analytics
2. Ajoutez le code de tracking dans `frontend/index.html`

### Voir les erreurs

**Render Logs:**
- Dashboard Render � Votre service � Logs
- Logs en temps r�el de votre application

## <� R�capitulatif - Checklist

- [ ] Code sur GitHub
- [ ] Compte Railway cr��
- [ ] MySQL d�ploy� sur Railway
- [ ] Credentials Railway not�s
- [ ] Sch�ma SQL import�
- [ ] Compte Render cr��
- [ ] Web Service cr��
- [ ] Variables d'environnement configur�es (DB + optionnel Email)
- [ ] Site d�ploy� avec succ�s
- [ ] Test: R�servation fonctionne
- [ ] UptimeRobot configur� (�viter mise en veille)
- [ ] Sauvegarde planifi�e (hebdomadaire)

## =� Votre site est en ligne!

- **URL:** https://votre-app.onrender.com
- **Co�t:** 0�/mois
- **Uptime:** 99.9% (avec UptimeRobot)
- **SSL:** Activ� automatiquement

## =� Support

**Render:**
- Docs: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)

**Railway:**
- Docs: [docs.railway.app](https://docs.railway.app)
- Discord: [discord.gg/railway](https://discord.gg/railway)

---

=
 **F�licitations!** Votre site Le Croco Brasseur est maintenant en ligne gratuitement! <z
