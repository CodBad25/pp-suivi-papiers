import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, gender, class: studentClass } = body;
    
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        gender,
        class: studentClass,
        userId: 'default-user' // Pour l'instant, utilisateur par défaut
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
    await prisma.student.deleteMany();
    return NextResponse.json({ message: 'Tous les étudiants ont été supprimés' });
  } catch (error) {
    console.error('Erreur lors de la suppression des étudiants:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

