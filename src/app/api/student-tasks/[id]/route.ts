import { NextRequest, NextResponse } from 'next/server';

// Prisma is lazy-loaded per request
async function getPrisma() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const g = globalThis as any;
    if (!g.__prisma) g.__prisma = new PrismaClient();
    return g.__prisma as any;
  } catch {
    return null;
  }
}

// PATCH /api/student-tasks/[id]
// Body can include: { status?: 'todo'|'in_progress'|'done', exempted?: boolean, dueDate?: string|null }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const prisma = await getPrisma();
    if (!prisma) return NextResponse.json({ error: 'Base de données indisponible' }, { status: 503 });
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const prisma = await getPrisma();
    if (!prisma) return NextResponse.json({ error: 'Base de données indisponible' }, { status: 503 });
    await prisma.studentTask.delete({
      where: { id }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

