import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// DELETE /api/task-types/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  try {
    // Supprimer d'abord toutes les tâches étudiantes associées à ce type
    await prisma.studentTask.deleteMany({
      where: { taskTypeId: id }
    });
    
    // Ensuite supprimer le type de tâche lui-même
    await prisma.taskType.delete({ 
      where: { id } 
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur DELETE /api/task-types/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/task-types/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  try {
    const body = await request.json();
    const { name, description, dueDate } = body;
    
    const updatedTask = await prisma.taskType.update({
      where: { id },
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erreur PUT /api/task-types/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}