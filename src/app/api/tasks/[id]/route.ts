import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/tasks/[id]
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await _req.json();
    const { title, description, status, priority, dueDate, studentId } = body || {};

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        studentId,
        dueDate: typeof dueDate !== 'undefined' ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur PATCH /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur DELETE /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

