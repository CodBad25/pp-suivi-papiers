# 🚀 Guide Complet de Déploiement sur Vercel

## Étape 1 : Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up" (S'inscrire)
3. Choisissez "Continue with GitHub" pour vous connecter avec votre compte GitHub
4. Autorisez Vercel à accéder à vos repositories GitHub

## Étape 2 : Importer votre projet

1. Une fois connecté, cliquez sur "New Project" (Nouveau Projet)
2. Vous verrez la liste de vos repositories GitHub
3. Trouvez "pp-suivi-papiers" et cliquez sur "Import" (Importer)
4. Vercel détectera automatiquement que c'est un projet Next.js

## Étape 3 : Configuration du projet

### Paramètres de base :
- **Project Name** : Laissez "pp-suivi-papiers" ou changez si vous voulez
- **Framework Preset** : Next.js (détecté automatiquement)
- **Root Directory** : Laissez vide (racine du projet)
- **Build Command** : `npm run build` (automatique)
- **Output Directory** : `.next` (automatique)
- **Install Command** : `npm install` (automatique)

### Variables d'environnement :
AVANT de cliquer "Deploy", vous devez configurer les variables d'environnement :

1. Cliquez sur "Environment Variables" (Variables d'environnement)
2. Ajoutez ces 3 variables :

#### Variable 1 : DATABASE_URL
- **Name** : `DATABASE_URL`
- **Value** : Vous devez d'abord créer une base de données cloud (voir étape 4)
- **Environment** : Production, Preview, Development

#### Variable 2 : NEXTAUTH_SECRET
- **Name** : `NEXTAUTH_SECRET`
- **Value** : Générez une clé secrète aléatoire (voir ci-dessous)
- **Environment** : Production, Preview, Development

#### Variable 3 : NEXTAUTH_URL
- **Name** : `NEXTAUTH_URL`
- **Value** : Sera automatiquement fournie par Vercel après le déploiement
- **Environment** : Production

## Étape 4 : Créer une base de données cloud

### Option A : Neon (Recommandé)

1. Allez sur https://neon.tech
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez l'URL de connexion PostgreSQL
5. Utilisez cette URL pour la variable `DATABASE_URL`

### Option B : Supabase

1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Allez dans Settings > Database
5. Copiez l'URL de connexion
6. Utilisez cette URL pour la variable `DATABASE_URL`

## Étape 5 : Générer NEXTAUTH_SECRET

### Méthode 1 : En ligne
1. Allez sur https://generate-secret.vercel.app/
2. Copiez la clé générée

### Méthode 2 : Terminal
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Étape 6 : Déployer

1. Une fois toutes les variables configurées, cliquez sur "Deploy"
2. Attendez que le déploiement se termine (2-3 minutes)
3. Vercel vous donnera une URL comme : `https://pp-suivi-papiers.vercel.app`

## Étape 7 : Configurer NEXTAUTH_URL

1. Retournez dans les paramètres de votre projet Vercel
2. Allez dans "Environment Variables"
3. Ajoutez ou modifiez `NEXTAUTH_URL` avec l'URL fournie par Vercel
4. Redéployez le projet

## Étape 8 : Initialiser la base de données

1. Allez dans l'onglet "Functions" de votre projet Vercel
2. Ou utilisez le terminal local :
```bash
# Assurez-vous que DATABASE_URL pointe vers votre base cloud
npx prisma db push
```

## Étape 9 : Vérification

1. Visitez votre URL Vercel
2. Testez les fonctionnalités principales
3. Vérifiez que la base de données fonctionne

## 🔧 Dépannage

### Erreur de build :
- Vérifiez les logs dans l'onglet "Functions" de Vercel
- Assurez-vous que toutes les variables d'environnement sont définies

### Erreur de base de données :
- Vérifiez que `DATABASE_URL` est correcte
- Assurez-vous que la base de données cloud est accessible
- Exécutez `npx prisma db push` pour créer les tables

### Erreur d'authentification :
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL Vercel

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs dans Vercel
2. Vérifiez la documentation Vercel : https://vercel.com/docs
3. Demandez de l'aide si nécessaire

---

**Votre application sera accessible à l'adresse fournie par Vercel !** 🎉