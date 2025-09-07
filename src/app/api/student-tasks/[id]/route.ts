import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/student-tasks/[id]
// Body can include: { status?: 'todo'|'in_progress'|'done', exempted?: boolean, dueDate?: string|null }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { status, exempted, dueDate } = body || {};
    const updated = await prisma.studentTask.update({
      where: { id },
      data: {
        status,
        exempted,
        dueDate: typeof dueDate !== 'undefined' ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
      include: { taskType: true }
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/student-tasks/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.studentTask.delete({
      where: { id }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

