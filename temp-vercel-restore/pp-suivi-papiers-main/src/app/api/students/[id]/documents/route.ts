import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';

const prisma = db;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id: studentId } = resolvedParams;
  try {
    const body = await request.json();
    const { documentId, status, remarks, action } = body;

    // Si l'action est 'reset', réinitialiser tous les documents de l'étudiant
    if (action === 'reset') {
      await prisma.studentDocument.updateMany({
        where: { studentId },
        data: {
          status: 'not-submitted',
          remarks: null,
          submitted: null
        }
      });
      return NextResponse.json({ success: true, message: 'Documents réinitialisés' });
    }

    // Vérifier si le document existe déjà pour cet étudiant
    let studentDocument = await prisma.studentDocument.findFirst({
      where: {
        studentId,
        documentId
      }
    });

    if (studentDocument) {
      // Mettre à jour le statut existant
      const updateData: any = { 
        status,
        submitted: status === 'submitted' ? new Date() : null
      };
      if (remarks !== undefined) {
        updateData.remarks = remarks;
      }
      studentDocument = await prisma.studentDocument.update({
        where: { id: studentDocument.id },
        data: updateData
      });
    } else {
      // Créer un nouveau document pour l'étudiant
      const createData: any = {
        studentId,
        documentId,
        status,
        submitted: status === 'submitted' ? new Date() : null
      };
      if (remarks !== undefined) {
        createData.remarks = remarks;
      }
      studentDocument = await prisma.studentDocument.create({
        data: createData
      });
    }

    return NextResponse.json(studentDocument);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id: studentId } = resolvedParams;
  try {
    // Supprimer tous les documents de l'étudiant
    await prisma.studentDocument.deleteMany({
      where: {
        studentId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression des documents:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
