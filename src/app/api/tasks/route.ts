import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sanitizeDataForDB, validateEncodingBeforeInsert } from '@/lib/encoding-utils';

const prisma = new PrismaClient();

// GET /api/tasks?studentId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || undefined;

    const where = studentId ? { studentId } : {};
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Erreur GET /api/tasks:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { title, description, status = 'todo', priority = 'medium', dueDate, studentId } = body || {};

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    }
    
    // Nettoyer et valider l'encodage
    try {
      const sanitizedData = sanitizeDataForDB({ title, description });
      validateEncodingBeforeInsert(sanitizedData);
      title = sanitizedData.title;
      description = sanitizedData.description;
    } catch (encodingError) {
      console.error('Erreur d\'encodage:', encodingError);
      return NextResponse.json({ 
        error: 'Problème d\'encodage détecté. Vérifiez les caractères spéciaux.',
        details: encodingError.message 
      }, { status: 400 });
    }

    // Create default user if missing (align with upload route behavior)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { email: 'professeur@example.com', name: 'Professeur Principal' } });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
        studentId: studentId || null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/tasks:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

