import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const classesParam = searchParams.get('classes') || '';
    const classes = classesParam.split(',').map(s => s.trim()).filter(Boolean);
    if (classes.length === 0) return NextResponse.json({ error: 'classes requis (comma separated)' }, { status: 400 });

    const periode = await prisma.periode.findUnique({
      where: { id: id },
      include: { taskTypes: true, documentTypes: true },
    });
    if (!periode) return NextResponse.json({ error: 'Période introuvable' }, { status: 404 });

    const students = await prisma.student.findMany({ where: { class: { in: classes } }, select: { id: true } });
    const studentIds = students.map(s => s.id);

    let missingTasks = 0;
    let updateTasksDue = 0;
    let missingDocs = 0;

    // Tasks: count missing and dueDate updates
    for (const ptt of periode.taskTypes) {
      if (studentIds.length === 0) break;
      // Existing tasks for these students and this type
      const existing = await prisma.studentTask.findMany({
        where: { studentId: { in: studentIds }, taskTypeId: ptt.taskTypeId },
        select: { id: true, dueDate: true, studentId: true },
      });
      const existingByStudent = new Map(existing.map(e => [e.studentId, e]));
      for (const sid of studentIds) {
        const cur = existingByStudent.get(sid);
        if (!cur) missingTasks++;
        else if (ptt.dueDate && (!cur.dueDate || cur.dueDate.getTime() !== ptt.dueDate.getTime())) updateTasksDue++;
      }
    }

    // Documents: count missing instances
    for (const pdt of periode.documentTypes) {
      if (studentIds.length === 0) break;
      const existing = await prisma.studentDocument.findMany({
        where: { studentId: { in: studentIds }, documentId: pdt.documentTypeId },
        select: { id: true, studentId: true },
      });
      const existingByStudent = new Set(existing.map(e => e.studentId));
      for (const sid of studentIds) if (!existingByStudent.has(sid)) missingDocs++;
    }

    return NextResponse.json({
      students: studentIds.length,
      tasks: { missing: missingTasks, dueUpdates: updateTasksDue },
      documents: { missing: missingDocs },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

