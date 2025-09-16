import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur par défaut
  const user = await prisma.user.upsert({
    where: { email: 'professeur@example.com' },
    update: {},
    create: {
      email: 'professeur@example.com',
      name: 'Professeur Principal'
    }
  });

  // Créer des types de documents par défaut
  const documents = [
    { name: 'Fiche de renseignements', description: 'Fiche administrative de début d\'année' },
    { name: 'Evasco', description: 'Évaluation scolaire' },
    { name: 'Assurance scolaire', description: 'Attestation d\'assurance' },
    { name: 'FSE', description: 'Foyer Socio-Éducatif' },
    { name: 'Demande de bourse', description: 'Dossier de bourse' }
  ];

  for (const doc of documents) {
    await prisma.documentType.upsert({
      where: { 
        name_userId: {
          name: doc.name,
          userId: user.id
        }
      },
      update: {},
      create: {
        name: doc.name,
        description: doc.description,
        userId: user.id
      }
    });
  }

  // Default task types
  const taskTypes = [
    { name: 'Remise photo', description: "Apporter la photo d'identité" },
    { name: 'Autorisation sortie', description: 'Autorisation parentale signée' },
    { name: 'Carnet signé', description: 'Page des règles signée' },
    { name: 'Cotisation FSE', description: 'Payer la cotisation' },
  ];

  for (const t of taskTypes) {
    await prisma.taskType.upsert({
      where: { name_userId: { name: t.name, userId: user.id } },
      update: { description: t.description },
      create: { name: t.name, description: t.description, userId: user.id },
    });
  }

  // Assign tasks to all existing students
  const students = await prisma.student.findMany({ select: { id: true } });
  const allTypes = await prisma.taskType.findMany({ where: { userId: user.id } });
  for (const s of students) {
    for (const tt of allTypes) {
      await prisma.studentTask.upsert({
        where: { studentId_taskTypeId: { studentId: s.id, taskTypeId: tt.id } },
        update: {},
        create: { studentId: s.id, taskTypeId: tt.id },
      });
    }
  }

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
