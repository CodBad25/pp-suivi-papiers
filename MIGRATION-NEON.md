# Migration vers Neon PostgreSQL

Ce guide vous accompagne dans la migration de votre base de données SQLite vers Neon PostgreSQL pour un déploiement en production.

## 🎯 Pourquoi migrer vers Neon ?

- **Production-ready** : Base de données cloud fiable et scalable
- **Serverless** : Pas de gestion d'infrastructure
- **Branching** : Création de branches de base de données pour les tests
- **Connection pooling** : Optimisé pour les applications serverless
- **Backups automatiques** : Sauvegardes et restauration intégrées

## 📋 Prérequis

1. Compte Neon (gratuit) : https://neon.tech
2. Application Next.js fonctionnelle avec Prisma
3. Données SQLite existantes à migrer

## 🚀 Étapes de migration

### 1. Créer un projet Neon

1. Allez sur https://neon.tech et créez un compte
2. Créez un nouveau projet
3. Choisissez la région la plus proche de vos utilisateurs
4. Notez les informations de connexion

### 2. Configurer les variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Neon PostgreSQL (production)
NEON_DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Pour la migration, gardez temporairement SQLite
DATABASE_URL="file:./prisma/dev.db"
```

### 3. Mettre à jour le schéma Prisma

Modifiez `prisma/schema.prisma` pour supporter PostgreSQL :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Changé de "sqlite" à "postgresql"
  url      = env("DATABASE_URL")
}

// Vos modèles restent identiques
```

### 4. Installer les dépendances PostgreSQL

```bash
npm install pg @types/pg
```

### 5. Générer et appliquer les migrations

```bash
# Générer le client Prisma pour PostgreSQL
npx prisma generate

# Créer les tables sur Neon (avec NEON_DATABASE_URL)
DATABASE_URL=$NEON_DATABASE_URL npx prisma db push
```

### 6. Exécuter la migration des données

```bash
# Installer ts-node si pas déjà fait
npm install -D ts-node

# Exécuter le script de migration
NEON_DATABASE_URL="votre_url_neon" npx ts-node scripts/migrate-from-sqlite-to-neon.ts
```

### 7. Vérifier la migration

```bash
# Se connecter à Neon pour vérifier
DATABASE_URL=$NEON_DATABASE_URL npx prisma studio
```

### 8. Mettre à jour la production

1. Mettez à jour votre `.env.production` :
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

2. Redéployez sur Vercel :
```bash
vercel --prod
```

## 🔧 Configuration Vercel

Dans votre dashboard Vercel, ajoutez la variable d'environnement :
- **Nom** : `DATABASE_URL`
- **Valeur** : Votre URL de connexion Neon
- **Environnements** : Production, Preview, Development

## 📊 Optimisations pour Neon

### Connection Pooling

Pour les applications serverless, utilisez le pooling :

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1"
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Variables d'environnement recommandées

```env
# Production
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require&pgbouncer=true&connection_limit=1"

# Direct connection pour les migrations
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
```

## 🛠️ Dépannage

### Erreur de connexion
- Vérifiez que l'URL contient `?sslmode=require`
- Assurez-vous que les credentials sont corrects
- Vérifiez que la base de données est active sur Neon

### Timeout de connexion
- Utilisez le connection pooling
- Réduisez `connection_limit=1` pour Vercel

### Erreurs de migration
- Vérifiez que les types de données sont compatibles
- Les `DateTime` SQLite deviennent `TIMESTAMP` en PostgreSQL
- Les `Boolean` sont natifs en PostgreSQL

## 📈 Monitoring

Neon fournit :
- Dashboard de monitoring
- Métriques de performance
- Logs de requêtes
- Alertes automatiques

## 🔄 Rollback

En cas de problème, vous pouvez revenir à SQLite :

1. Restaurez le backup créé automatiquement
2. Remettez `provider = "sqlite"` dans le schema
3. Utilisez `DATABASE_URL="file:./prisma/dev.db"`

## 📚 Ressources

- [Documentation Neon](https://neon.tech/docs)
- [Prisma avec PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Déploiement Vercel](https://vercel.com/guides/nextjs-prisma-postgres)

---

**Note** : Ce processus est irréversible une fois en production. Assurez-vous de tester en local avant de déployer.