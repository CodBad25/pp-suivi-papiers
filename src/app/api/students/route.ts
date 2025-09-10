import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy-load Prisma to avoid MODULE_NOT_FOUND when client isn't generated
    let prisma: any = null;
    try {
      const { PrismaClient } = await import('@prisma/client');
      const g = globalThis as any;
      prisma = g.__prisma || new PrismaClient();
      g.__prisma = prisma;
    } catch (e) {
      prisma = null;
    }

    if (!prisma) {
      // Fallback when DB/prisma is unavailable
      return NextResponse.json([]);
    }

    const students = await prisma.student.findMany({
      include: {
        documents: {
          include: {
            document: true
          }
        }
      }
    });
    
    return NextResponse.json(students);
  } catch (error) {
    const msg = String((error as Error)?.message || error);
    if (/no such table|does not exist|unable to open the database file|SQLITE_ERROR/i.test(msg)) {
      return NextResponse.json([]);
    }
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lazy-load Prisma
    let prisma: any = null;
    try {
      const { PrismaClient } = await import('@prisma/client');
      const g = globalThis as any;
      prisma = g.__prisma || new PrismaClient();
      g.__prisma = prisma;
    } catch (e) {
      prisma = null;
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Base de données indisponible' }, { status: 503 });
    }

    const body = await request.json();
    const { firstName, lastName, gender, class: studentClass } = body;
    
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        gender,
        class: studentClass,
        userId: 'default-user'
      }
    });
    
    return NextResponse.json(student);
  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Lazy-load Prisma
    let prisma: any = null;
    try {
      const { PrismaClient } = await import('@prisma/client');
      const g = globalThis as any;
      prisma = g.__prisma || new PrismaClient();
      g.__prisma = prisma;
    } catch (e) {
      prisma = null;
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Base de données indisponible' }, { status: 503 });
    }

    await prisma.student.deleteMany();
    return NextResponse.json({ message: 'Tous les étudiants ont été supprimés' });
  } catch (error) {
    console.error('Erreur lors de la suppression des étudiants:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

