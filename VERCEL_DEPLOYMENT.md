# 🚀 Guide de Déploiement Vercel

## Préparation du Projet

Votre projet est maintenant **optimisé pour Vercel** ! Toutes les modifications nécessaires ont été apportées :

### ✅ Modifications Effectuées

1. **Scripts package.json mis à jour** :
   - `"start": "next start"` (au lieu de `tsx server.ts`)
   - `"dev": "next dev"` (au lieu du serveur custom)

2. **Route API Socket.IO créée** :
   - `/src/app/api/socketio/route.ts` compatible Vercel
   - Remplace le serveur custom `server.ts`

3. **Variables d'environnement documentées** :
   - `.env.example` créé avec toutes les variables nécessaires

4. **Configuration Prisma optimisée** :
   - Schema compatible avec les bases de données cloud
   - Configuration SQLite pour le développement local

## 🔧 Étapes de Déploiement

### 1. Préparer la Base de Données

**Pour la production, vous devez utiliser une base de données cloud :**

- **Option 1 - PlanetScale (MySQL)** :
  ```bash
  DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"
  ```

- **Option 2 - Neon (PostgreSQL)** :
  ```bash
  DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
  ```

- **Option 3 - Railway (PostgreSQL/MySQL)** :
  ```bash
  DATABASE_URL="postgresql://username:password@host:port/database"
  ```

### 2. Configurer les Variables d'Environnement sur Vercel

Dans votre dashboard Vercel, ajoutez ces variables :

```bash
# Base de données (remplacez par votre URL de production)
DATABASE_URL=your_production_database_url

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### 3. Déployer sur Vercel

**Option A - Via GitHub :**
1. Poussez votre code sur GitHub
2. Connectez votre repo à Vercel
3. Vercel détectera automatiquement Next.js
4. Ajoutez les variables d'environnement
5. Déployez !

**Option B - Via CLI Vercel :**
```bash
npm i -g vercel
vercel
# Suivez les instructions
```

### 4. Initialiser la Base de Données

Après le déploiement :

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schema vers la base de données
npx prisma db push

# (Optionnel) Seeder la base avec des données de test
npx prisma db seed
```

## 🎯 Points Importants

### ✅ Ce qui fonctionne maintenant :
- ✅ Build Next.js standard
- ✅ Routes API optimisées
- ✅ Socket.IO compatible Vercel
- ✅ Configuration Prisma flexible
- ✅ Variables d'environnement documentées

### ⚠️ À retenir :
- SQLite ne fonctionne pas en production sur Vercel
- Utilisez une base de données cloud (PlanetScale, Neon, Railway)
- Les WebSockets ont des limitations sur Vercel (utilisez des alternatives comme Pusher si nécessaire)

## 🔍 Vérification Post-Déploiement

1. **Testez les routes principales** :
   - `/` - Page d'accueil
   - `/api/students` - API des étudiants
   - `/api/documents` - API des documents

2. **Vérifiez les logs Vercel** pour détecter d'éventuelles erreurs

3. **Testez la base de données** en créant un étudiant ou un document

## 🆘 Dépannage

**Erreur de build :**
- Vérifiez que `npm run build` fonctionne localement
- Consultez les logs de build Vercel

**Erreur de base de données :**
- Vérifiez la variable `DATABASE_URL`
- Assurez-vous que `npx prisma generate` a été exécuté

**Erreur 500 :**
- Consultez les logs de fonction Vercel
- Vérifiez les variables d'environnement

Votre projet est maintenant **prêt pour Vercel** ! 🎉