import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { documentId, status } = body;
    const studentId = params.id;

    // Vérifier si le document existe déjà pour cet étudiant
    let studentDocument = await prisma.studentDocument.findFirst({
      where: {
        studentId,
        documentId
      }
    });

    if (studentDocument) {
      // Mettre à jour le statut existant
      studentDocument = await prisma.studentDocument.update({
        where: { id: studentDocument.id },
        data: { 
          status,
          submitted: status === 'submitted' ? new Date() : null
        }
      });
    } else {
      // Créer un nouveau document pour l'étudiant
      studentDocument = await prisma.studentDocument.create({
        data: {
          studentId,
          documentId,
          status,
          submitted: status === 'submitted' ? new Date() : null
        }
      });
    }

    return NextResponse.json(studentDocument);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
