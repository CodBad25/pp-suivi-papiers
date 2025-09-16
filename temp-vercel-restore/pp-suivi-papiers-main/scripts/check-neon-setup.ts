import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkEnvironmentVariables() {
  log('\n🔍 Vérification des variables d\'environnement...', 'bold');
  
  const requiredVars = ['DATABASE_URL'];
  const optionalVars = ['NEON_DATABASE_URL', 'NEON_DIRECT_URL'];
  
  let hasErrors = false;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} est définie`);
      
      // Vérifier si c'est une URL PostgreSQL
      if (process.env[varName]?.startsWith('postgresql://')) {
        logSuccess(`${varName} utilise PostgreSQL`);
      } else if (process.env[varName]?.startsWith('file:')) {
        logWarning(`${varName} utilise encore SQLite`);
      }
    } else {
      logError(`${varName} n'est pas définie`);
      hasErrors = true;
    }
  }
  
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} est définie`);
    } else {
      logInfo(`${varName} n'est pas définie (optionnel)`);
    }
  }
  
  return !hasErrors;
}

async function checkDatabaseConnection() {
  log('\n🔗 Test de connexion à la base de données...', 'bold');
  
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Tester une requête simple
    const userCount = await prisma.user.count();
    logSuccess(`Connexion réussie - ${userCount} utilisateur(s) trouvé(s)`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    logError(`Échec de la connexion: ${error}`);
    return false;
  }
}

async function checkPrismaSchema() {
  log('\n📋 Vérification du schéma Prisma...', 'bold');
  
  try {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    if (schemaContent.includes('provider = "postgresql"')) {
      logSuccess('Schéma configuré pour PostgreSQL');
    } else if (schemaContent.includes('provider = "sqlite"')) {
      logWarning('Schéma encore configuré pour SQLite');
      logInfo('Changez provider = "sqlite" en provider = "postgresql"');
    }
    
    return true;
  } catch (error) {
    logError(`Erreur lors de la lecture du schéma: ${error}`);
    return false;
  }
}

async function checkPrismaClient() {
  log('\n🔧 Vérification du client Prisma...', 'bold');
  
  try {
    await execAsync('npx prisma --version');
    logSuccess('Prisma CLI disponible');
    
    // Vérifier si le client est généré
    const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
    if (fs.existsSync(clientPath)) {
      logSuccess('Client Prisma généré');
    } else {
      logWarning('Client Prisma non généré');
      logInfo('Exécutez: npx prisma generate');
    }
    
    return true;
  } catch (error) {
    logError(`Prisma CLI non disponible: ${error}`);
    return false;
  }
}

async function checkMigrationFiles() {
  log('\n📁 Vérification des fichiers de migration...', 'bold');
  
  const sqliteDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const migrationScript = path.join(process.cwd(), 'scripts', 'migrate-from-sqlite-to-neon.ts');
  
  if (fs.existsSync(sqliteDbPath)) {
    logSuccess('Base de données SQLite trouvée');
  } else {
    logWarning('Aucune base SQLite trouvée');
  }
  
  if (fs.existsSync(migrationScript)) {
    logSuccess('Script de migration disponible');
  } else {
    logError('Script de migration manquant');
  }
  
  return true;
}

async function checkDependencies() {
  log('\n📦 Vérification des dépendances...', 'bold');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['@prisma/client', 'prisma'];
  const optionalDeps = ['pg', '@types/pg'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      logSuccess(`${dep} installé`);
    } else {
      logError(`${dep} manquant`);
    }
  }
  
  for (const dep of optionalDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      logSuccess(`${dep} installé`);
    } else {
      logInfo(`${dep} non installé (recommandé pour PostgreSQL)`);
    }
  }
  
  return true;
}

async function generateMigrationPlan() {
  log('\n📋 Plan de migration recommandé:', 'bold');
  
  const steps = [
    '1. Créer un compte sur https://neon.tech',
    '2. Créer un nouveau projet PostgreSQL',
    '3. Copier l\'URL de connexion',
    '4. Mettre à jour .env avec NEON_DATABASE_URL',
    '5. Installer les dépendances PostgreSQL: npm install pg @types/pg',
    '6. Générer le client Prisma: npx prisma generate',
    '7. Créer les tables sur Neon: DATABASE_URL=$NEON_DATABASE_URL npx prisma db push',
    '8. Exécuter la migration: npm run migrate:sqlite-to-neon',
    '9. Vérifier les données: DATABASE_URL=$NEON_DATABASE_URL npx prisma studio',
    '10. Mettre à jour DATABASE_URL vers Neon',
    '11. Redéployer sur Vercel'
  ];
  
  steps.forEach(step => {
    logInfo(step);
  });
}

async function main() {
  log('🚀 Vérification de la configuration Neon PostgreSQL', 'bold');
  log('=' .repeat(60), 'blue');
  
  const checks = [
    checkEnvironmentVariables,
    checkPrismaSchema,
    checkPrismaClient,
    checkDependencies,
    checkMigrationFiles,
    checkDatabaseConnection
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await check();
      if (!result) allPassed = false;
    } catch (error) {
      logError(`Erreur lors de la vérification: ${error}`);
      allPassed = false;
    }
  }
  
  log('\n' + '=' .repeat(60), 'blue');
  
  if (allPassed) {
    logSuccess('✨ Toutes les vérifications sont passées!');
    logInfo('Vous êtes prêt pour la migration vers Neon.');
  } else {
    logWarning('⚠️  Certaines vérifications ont échoué.');
    logInfo('Consultez les messages ci-dessus pour corriger les problèmes.');
  }
  
  await generateMigrationPlan();
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as checkNeonSetup };