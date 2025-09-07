import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/student-tasks?studentId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
    const tasks = await prisma.studentTask.findMany({
      where: { studentId },
      include: { taskType: true },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json(tasks);
  } catch (e) {
    // Si la table n'existe pas encore (premier lancement), retourner une liste vide
    const msg = String(e?.toString?.() || e);
    if ((msg.includes('StudentTask') && msg.includes('does not exist')) || /unable to open the database file|no such table|SQLITE_ERROR/i.test(msg)) {
      return NextResponse.json([]);
    }
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/student-tasks  { action: 'align' | 'create_single' }
export async function POST(req: NextRequest) {
  try {
    const { action, studentId, taskTypeId } = await req.json();
    
    if (action === 'create_single') {
      // Créer une StudentTask individuelle
      if (!studentId || !taskTypeId) {
        return NextResponse.json({ error: 'studentId et taskTypeId requis' }, { status: 400 });
      }
      
      try {
        const studentTask = await prisma.studentTask.create({
          data: { studentId, taskTypeId },
          include: { taskType: true }
        });
        return NextResponse.json(studentTask, { status: 201 });
      } catch (error) {
        // Si la tâche existe déjà, retourner la tâche existante
        const existing = await prisma.studentTask.findUnique({
          where: { studentId_taskTypeId: { studentId, taskTypeId } },
          include: { taskType: true }
        });
        if (existing) {
          return NextResponse.json(existing);
        }
        throw error;
      }
    }
    
    if (action === 'align') {
      const user = await prisma.user.findFirst();
      if (!user) return NextResponse.json({ error: 'Aucun utilisateur' }, { status: 400 });

      const students = await prisma.student.findMany({ select: { id: true } });
      const types = await prisma.taskType.findMany({ where: { userId: user.id } });
      let created = 0;
      for (const s of students) {
        for (const tt of types) {
          try {
            await prisma.studentTask.create({ data: { studentId: s.id, taskTypeId: tt.id } });
            created++;
          } catch {}
        }
      }
      return NextResponse.json({ created });
    }
    
    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/student-tasks  bulk status update
// Body: { studentId: string, action: 'all_in_progress' | 'all_done' }
export async function PATCH(req: NextRequest) {
  try {
    const { studentId, action } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
    if (action !== 'all_in_progress' && action !== 'all_done') {
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
    }
    const status = action === 'all_in_progress' ? 'in_progress' : 'done';
    const result = await prisma.studentTask.updateMany({
      where: { studentId, exempted: false },
      data: { status }
    });
    return NextResponse.json({ updated: result.count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

