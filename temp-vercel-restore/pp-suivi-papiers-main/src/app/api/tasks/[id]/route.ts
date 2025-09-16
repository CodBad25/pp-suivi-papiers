import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';

const prisma = db;

// PATCH /api/tasks/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const body = await request.json();
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

// PUT /api/tasks/[id] - Alias pour PATCH pour compatibilité
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const body = await request.json();
    const { name, title, description, status, priority, dueDate, studentId } = body || {};

    // Support pour 'name' (taskTypes) et 'title' (tasks)
    const taskTitle = name || title;
    if (!taskTitle) {
      return NextResponse.json({ error: 'name ou title requis' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: taskTitle,
        description,
        status,
        priority,
        studentId,
        dueDate: typeof dueDate !== 'undefined' ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur PUT /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur DELETE /api/tasks/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

