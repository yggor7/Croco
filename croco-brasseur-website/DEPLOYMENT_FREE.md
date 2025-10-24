# Déploiement 100% GRATUIT - Le Croco Brasseur

Guide complet pour déployer votre site **totalement gratuitement** avec Render + Railway.

## <¯ Solution 100% Gratuite

- **Hébergement Web:** Render (Plan Free)
- **Base de données MySQL:** Railway (500h/mois gratuit)
- **Coût total:** 0¬/mois

## ¡ Déploiement Rapide (15 minutes)

### Étape 1: GitHub (2 min)

```bash
# Dans le dossier de votre projet
git add .
git commit -m "Prêt pour déploiement gratuit"
git push origin master
```

Si vous n'avez pas encore de dépôt GitHub:
1. Créez un compte sur [github.com](https://github.com)
2. Créez un nouveau dépôt (PRIVÉ recommandé)
3. Suivez les instructions pour pousser votre code

### Étape 2: Railway - Base de données MySQL GRATUITE (5 min)

#### 2.1 Créer le compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez "Start a New Project"
3. Connectez-vous avec GitHub (recommandé)
4. **Plan gratuit:** 500 heures/mois + 5$/mois de crédit

#### 2.2 Créer la base de données MySQL

1. Cliquez sur "New Project"
2. Sélectionnez "Deploy MySQL"
3. Attendez 30 secondes que le déploiement se termine

#### 2.3 Récupérer les credentials

1. Cliquez sur votre service MySQL
2. Allez dans l'onglet "Variables"
3. Notez ces valeurs (vous en aurez besoin pour Render):

```
MYSQL_HOST (exemple: containers-us-west-123.railway.app)
MYSQL_PORT (généralement 3306 ou un port aléatoire)
MYSQL_USER (généralement root)
MYSQL_PASSWORD (une longue chaîne aléatoire)
MYSQL_DATABASE (généralement railway)
```

**ASTUCE:** Cliquez sur l'icône "=A" pour voir les valeurs complètes

#### 2.4 Importer le schéma de base de données

**Option A - Via l'interface Railway (Recommandé):**
1. Dans Railway, cliquez sur votre MySQL
2. Allez dans l'onglet "Query"
3. Copiez le contenu de `scripts/setup-database.sql`
4. Collez et exécutez

**Option B - Via MySQL CLI:**
```bash
# Remplacez par vos vraies valeurs
mysql -h VOTRE_MYSQL_HOST -P VOTRE_MYSQL_PORT -u VOTRE_MYSQL_USER -p VOTRE_MYSQL_DATABASE < scripts/setup-database.sql
```

### Étape 3: Render - Hébergement Web GRATUIT (8 min)

#### 3.1 Créer le compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez "Get Started for Free"
3. Connectez-vous avec GitHub

#### 3.2 Créer le Web Service

1. Cliquez "New +" en haut à droite
2. Sélectionnez "Web Service"
3. Connectez votre dépôt GitHub `croco-brasseur-website`
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

Avant de déployer, ajoutez ces variables (section "Environment"):

**OBLIGATOIRES (Base de données):**
```
NODE_ENV=production
PORT=10000
DB_HOST=votre-host-railway.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre-mot-de-passe-railway
DB_NAME=railway
```

**OPTIONNELLES (Email - peut être ajouté plus tard):**
```
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password
JWT_SECRET=une-cle-secrete-aleatoire-longue
```

**IMPORTANT:** Utilisez les valeurs exactes de Railway (Étape 2.3)

#### 3.4 Déployer

1. Cliquez "Create Web Service"
2. Attendez 2-3 minutes pendant le déploiement
3. Votre site sera disponible à: `https://croco-brasseur.onrender.com`

##  Vérification

1. Visitez votre URL Render
2. Testez la page d'accueil
3. Testez le formulaire de réservation
4. Vérifiez dans Railway > MySQL > Data que les réservations sont enregistrées

## =ç Configuration Email (Optionnel)

Pour recevoir les notifications de réservation par email:

### Gmail App Password

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité ’ Validation en 2 étapes (activez si nécessaire)
3. Mots de passe d'application
4. Créez un mot de passe pour "Mail"
5. Copiez le code à 16 caractères
6. Dans Render, ajoutez:
   - `EMAIL_USER`: votre-email@gmail.com
   - `EMAIL_PASS`: le code à 16 caractères

### Test

Faites une réservation sur votre site, vous devriez recevoir un email!

## =¨ Limitations du Plan Gratuit

### Render Free Plan

 **Avantages:**
- Hébergement illimité
- SSL automatique (HTTPS)
- Déploiement automatique à chaque push GitHub

  **Limitations:**
- **Mise en veille:** Après 15 min d'inactivité, le site s'endort
- **Réveil:** Premier chargement = 30-60 secondes
- **Bande passante:** 100 GB/mois (largement suffisant)

### Railway Free Plan

 **Avantages:**
- MySQL complet et performant
- 500 heures/mois (H 20 jours)
- 5$ de crédit/mois

  **Astuce pour économiser les heures:**
Le compteur tourne 24h/24. Si vous approchez de la limite:
- Suspendez temporairement le service MySQL dans Railway
- Ou utilisez PlanetScale (MySQL serverless, compte seulement quand utilisé)

## = Éviter la mise en veille (Gratuit!)

### Option 1: UptimeRobot (Recommandé)

1. Créez un compte sur [uptimerobot.com](https://uptimerobot.com) (GRATUIT)
2. Ajoutez un nouveau monitor:
   - Type: HTTP(s)
   - URL: `https://votre-app.onrender.com/api/health`
   - Interval: 5 minutes
3. UptimeRobot pingera votre site toutes les 5 minutes = pas de mise en veille!

### Option 2: Cron-job.org

1. Créez un compte sur [cron-job.org](https://cron-job.org)
2. Créez un cronjob qui appelle votre URL toutes les 5-10 minutes

### Option 3: Script GitHub Actions (Avancé)

Créez `.github/workflows/keep-alive.yml`:

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

## = Mises à jour

Pour mettre à jour votre site:

```bash
git add .
git commit -m "Mise à jour du site"
git push origin master
```

Render redéploie automatiquement (2-3 min) (

## =¾ Sauvegardes

### Sauvegarder la base de données Railway

**Via l'interface:**
1. Railway ’ MySQL ’ Data
2. Exportez les tables en SQL

**Via CLI:**
```bash
mysqldump -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p RAILWAY_DATABASE > backup.sql
```

**Planifiez des sauvegardes régulières!** (une fois par semaine recommandé)

## = Dépannage

### "Application failed to respond"

1. Vérifiez les logs Render (Dashboard ’ Logs)
2. Vérifiez que `PORT=10000` est bien configuré
3. Vérifiez que toutes les variables DB sont correctes

### Erreur de connexion base de données

1. Vérifiez les credentials Railway
2. Dans Railway, vérifiez que MySQL est bien "Active" (pas suspendu)
3. Testez la connexion:
   ```bash
   mysql -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p
   ```

### Le site charge lentement

C'est normal sur le plan gratuit lors du premier accès (réveil = 30-60 sec).
Solution: Utilisez UptimeRobot pour éviter la mise en veille.

### Railway: "500 hours exceeded"

Vous avez dépassé les 500h/mois. Solutions:
1. Attendez le mois prochain (reset automatique)
2. Passez au plan Railway Hobby ($5/mois)
3. Ou migrez vers PlanetScale (gratuit, serverless)

## =Ê Alternative: PlanetScale (au lieu de Railway)

Si Railway ne vous convient pas:

1. Créez un compte sur [planetscale.com](https://planetscale.com)
2. Créez une database
3. **Avantage:** Vraiment gratuit à vie, serverless (compte seulement quand utilisé)
4. **Inconvénient:** Pas de foreign keys (pas grave pour ce projet)

## =È Monitoring (Gratuit)

### Voir les visiteurs

**Google Analytics (Gratuit):**
1. Créez un compte Google Analytics
2. Ajoutez le code de tracking dans `frontend/index.html`

### Voir les erreurs

**Render Logs:**
- Dashboard Render ’ Votre service ’ Logs
- Logs en temps réel de votre application

## <‰ Récapitulatif - Checklist

- [ ] Code sur GitHub
- [ ] Compte Railway créé
- [ ] MySQL déployé sur Railway
- [ ] Credentials Railway notés
- [ ] Schéma SQL importé
- [ ] Compte Render créé
- [ ] Web Service créé
- [ ] Variables d'environnement configurées (DB + optionnel Email)
- [ ] Site déployé avec succès
- [ ] Test: Réservation fonctionne
- [ ] UptimeRobot configuré (éviter mise en veille)
- [ ] Sauvegarde planifiée (hebdomadaire)

## =€ Votre site est en ligne!

- **URL:** https://votre-app.onrender.com
- **Coût:** 0¬/mois
- **Uptime:** 99.9% (avec UptimeRobot)
- **SSL:** Activé automatiquement

## =Þ Support

**Render:**
- Docs: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)

**Railway:**
- Docs: [docs.railway.app](https://docs.railway.app)
- Discord: [discord.gg/railway](https://discord.gg/railway)

---

=
 **Félicitations!** Votre site Le Croco Brasseur est maintenant en ligne gratuitement! <z
