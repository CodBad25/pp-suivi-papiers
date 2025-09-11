import { PrismaClient as SQLitePrismaClient } from '@prisma/client';
import { PrismaClient as PostgresPrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Configuration pour SQLite (source)
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Configuration pour Neon PostgreSQL (destination)
const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Début de la migration SQLite vers Neon PostgreSQL...');
  
  try {
    // 1. Vérifier la connexion à Neon
    console.log('📡 Test de connexion à Neon...');
    await postgresClient.$connect();
    console.log('✅ Connexion à Neon réussie');
    
    // 2. Vérifier la connexion à SQLite
    console.log('📂 Test de connexion à SQLite...');
    await sqliteClient.$connect();
    console.log('✅ Connexion à SQLite réussie');
    
    // 3. Migrer les utilisateurs
    console.log('👤 Migration des utilisateurs...');
    const users = await sqliteClient.user.findMany();
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          updatedAt: new Date()
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log(`✅ ${users.length} utilisateurs migrés`);
    
    // 4. Migrer les étudiants
    console.log('🎓 Migration des étudiants...');
    const students = await sqliteClient.student.findMany();
    for (const student of students) {
      await postgresClient.student.upsert({
        where: { id: student.id },
        update: {
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          class: student.class,
          updatedAt: new Date()
        },
        create: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          class: student.class,
          userId: student.userId,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt
        }
      });
    }
    console.log(`✅ ${students.length} étudiants migrés`);
    
    // 5. Migrer les types de documents
    console.log('📄 Migration des types de documents...');
    const documentTypes = await sqliteClient.documentType.findMany();
    for (const docType of documentTypes) {
      await postgresClient.documentType.upsert({
        where: { id: docType.id },
        update: {
          name: docType.name,
          description: docType.description,
          dueDate: docType.dueDate,
          updatedAt: new Date()
        },
        create: {
          id: docType.id,
          name: docType.name,
          description: docType.description,
          dueDate: docType.dueDate,
          userId: docType.userId,
          createdAt: docType.createdAt,
          updatedAt: docType.updatedAt
        }
      });
    }
    console.log(`✅ ${documentTypes.length} types de documents migrés`);
    
    // 6. Migrer les types de tâches
    console.log('✅ Migration des types de tâches...');
    const taskTypes = await sqliteClient.taskType.findMany();
    for (const taskType of taskTypes) {
      await postgresClient.taskType.upsert({
        where: { id: taskType.id },
        update: {
          name: taskType.name,
          description: taskType.description,
          dueDate: taskType.dueDate,
          updatedAt: new Date()
        },
        create: {
          id: taskType.id,
          name: taskType.name,
          description: taskType.description,
          dueDate: taskType.dueDate,
          userId: taskType.userId,
          createdAt: taskType.createdAt,
          updatedAt: taskType.updatedAt
        }
      });
    }
    console.log(`✅ ${taskTypes.length} types de tâches migrés`);
    
    // 7. Migrer les documents des étudiants
    console.log('📋 Migration des documents des étudiants...');
    const studentDocuments = await sqliteClient.studentDocument.findMany();
    for (const studentDoc of studentDocuments) {
      await postgresClient.studentDocument.upsert({
        where: { id: studentDoc.id },
        update: {
          status: studentDoc.status,
          remarks: studentDoc.remarks,
          submitted: studentDoc.submitted,
          updatedAt: new Date()
        },
        create: {
          id: studentDoc.id,
          status: studentDoc.status,
          remarks: studentDoc.remarks,
          submitted: studentDoc.submitted,
          studentId: studentDoc.studentId,
          documentId: studentDoc.documentId,
          createdAt: studentDoc.createdAt,
          updatedAt: studentDoc.updatedAt
        }
      });
    }
    console.log(`✅ ${studentDocuments.length} documents d'étudiants migrés`);
    
    // 8. Migrer les tâches
    console.log('📝 Migration des tâches...');
    const tasks = await sqliteClient.task.findMany();
    for (const task of tasks) {
      await postgresClient.task.upsert({
        where: { id: task.id },
        update: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          comments: task.comments,
          updatedAt: new Date()
        },
        create: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          comments: task.comments,
          userId: task.userId,
          studentId: task.studentId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }
      });
    }
    console.log(`✅ ${tasks.length} tâches migrées`);
    
    // 9. Migrer les tâches des étudiants
    console.log('🎯 Migration des tâches des étudiants...');
    const studentTasks = await sqliteClient.studentTask.findMany();
    for (const studentTask of studentTasks) {
      await postgresClient.studentTask.upsert({
        where: { id: studentTask.id },
        update: {
          status: studentTask.status,
          exempted: studentTask.exempted,
          dueDate: studentTask.dueDate,
          updatedAt: new Date()
        },
        create: {
          id: studentTask.id,
          status: studentTask.status,
          exempted: studentTask.exempted,
          dueDate: studentTask.dueDate,
          studentId: studentTask.studentId,
          taskTypeId: studentTask.taskTypeId,
          createdAt: studentTask.createdAt,
          updatedAt: studentTask.updatedAt
        }
      });
    }
    console.log(`✅ ${studentTasks.length} tâches d'étudiants migrées`);
    
    // 10. Migrer les dispensations
    console.log('🏥 Migration des dispensations...');
    const dispensations = await sqliteClient.dispensation.findMany();
    for (const dispensation of dispensations) {
      await postgresClient.dispensation.upsert({
        where: { id: dispensation.id },
        update: {
          reason: dispensation.reason,
          updatedAt: new Date()
        },
        create: {
          id: dispensation.id,
          reason: dispensation.reason,
          studentId: dispensation.studentId,
          documentId: dispensation.documentId,
          createdAt: dispensation.createdAt,
          updatedAt: dispensation.updatedAt
        }
      });
    }
    console.log(`✅ ${dispensations.length} dispensations migrées`);
    
    // 11. Migrer les rappels
    console.log('⏰ Migration des rappels...');
    const reminders = await sqliteClient.reminder.findMany();
    for (const reminder of reminders) {
      await postgresClient.reminder.upsert({
        where: { id: reminder.id },
        update: {
          title: reminder.title,
          message: reminder.message,
          dueDate: reminder.dueDate,
          sent: reminder.sent,
          sentAt: reminder.sentAt,
          updatedAt: new Date()
        },
        create: {
          id: reminder.id,
          title: reminder.title,
          message: reminder.message,
          dueDate: reminder.dueDate,
          sent: reminder.sent,
          sentAt: reminder.sentAt,
          userId: reminder.userId,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt
        }
      });
    }
    console.log(`✅ ${reminders.length} rappels migrés`);
    
    // 12. Migrer les données JSON des périodes si elles existent
    console.log('📅 Migration des données de périodes...');
    const periodesJsonPath = path.join(process.cwd(), 'prisma', 'db', 'periodes.json');
    if (fs.existsSync(periodesJsonPath)) {
      const periodesData = JSON.parse(fs.readFileSync(periodesJsonPath, 'utf8'));
      console.log(`📄 ${periodesData.length} périodes trouvées dans le fichier JSON`);
      // Note: Les périodes sont stockées en JSON, pas en base de données
      // Elles seront migrées automatiquement avec le fichier
    }
    
    console.log('🎉 Migration terminée avec succès!');
    console.log('📊 Résumé de la migration:');
    console.log(`   - ${users.length} utilisateurs`);
    console.log(`   - ${students.length} étudiants`);
    console.log(`   - ${documentTypes.length} types de documents`);
    console.log(`   - ${taskTypes.length} types de tâches`);
    console.log(`   - ${studentDocuments.length} documents d'étudiants`);
    console.log(`   - ${tasks.length} tâches`);
    console.log(`   - ${studentTasks.length} tâches d'étudiants`);
    console.log(`   - ${dispensations.length} dispensations`);
    console.log(`   - ${reminders.length} rappels`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Fonction pour créer une sauvegarde avant migration
async function createBackup() {
  console.log('💾 Création d\'une sauvegarde...');
  const backupDir = path.join(process.cwd(), 'backups', `migration-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Copier la base SQLite
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, path.join(backupDir, 'dev.db'));
  }
  
  // Copier les fichiers JSON
  const jsonDir = path.join(process.cwd(), 'prisma', 'db');
  if (fs.existsSync(jsonDir)) {
    const backupJsonDir = path.join(backupDir, 'db');
    fs.mkdirSync(backupJsonDir, { recursive: true });
    
    const files = fs.readdirSync(jsonDir);
    files.forEach(file => {
      fs.copyFileSync(path.join(jsonDir, file), path.join(backupJsonDir, file));
    });
  }
  
  console.log(`✅ Sauvegarde créée dans: ${backupDir}`);
}

// Script principal
async function main() {
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    console.error('❌ Variable d\'environnement NEON_DATABASE_URL ou DATABASE_URL requise');
    console.log('💡 Exemple: NEON_DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"');
    process.exit(1);
  }
  
  try {
    await createBackup();
    await migrateData();
    console.log('🚀 Migration terminée! Vous pouvez maintenant mettre à jour votre .env pour utiliser Neon.');
  } catch (error) {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { migrateData, createBackup };