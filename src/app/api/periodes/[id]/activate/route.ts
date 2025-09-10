import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

const prisma = db;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const classes: string[] = body?.classes || [];
    const options = body?.options || {};
    const dryRun: boolean = !!options.dryRun;
    const onlyMissing: boolean = options.onlyMissing !== false; // défaut: true
    const reset: boolean = !!options.reset;

    if (!Array.isArray(classes) || classes.length === 0) {
      return NextResponse.json({ error: 'classes requis (array)' }, { status: 400 });
    }

    // Fallback to JSON file since periode model doesn't exist in schema
    const periodesFile = path.join(process.cwd(), 'prisma', 'db', 'periodes.json');
    const periodes = fs.existsSync(periodesFile) ? JSON.parse(fs.readFileSync(periodesFile, 'utf8')) : [];
    const periode = periodes.find((p: any) => p.id === id);
    if (!periode) return NextResponse.json({ error: 'Période introuvable' }, { status: 404 });

    const students = await prisma.student.findMany({ where: { class: { in: classes } }, select: { id: true } });
    const studentIds = students.map(s => s.id);

    let createdTasks = 0, updatedTasks = 0, createdDocs = 0, updatedDocs = 0;

    if (dryRun) {
      for (const ptt of (periode.taskTypes || [])) {
        const existing = await prisma.studentTask.findMany({ where: { studentId: { in: studentIds }, taskTypeId: ptt.taskTypeId }, select: { studentId: true, dueDate: true } });
        const byStudent = new Map(existing.map(e => [e.studentId, e]));
        for (const sid of studentIds) {
          const cur = byStudent.get(sid);
          if (!cur) createdTasks++;
          else if (ptt.dueDate && (!cur.dueDate || cur.dueDate.getTime() !== ptt.dueDate.getTime())) updatedTasks++;
        }
      }
      for (const pdt of (periode.documentTypes || [])) {
        const existing = await prisma.studentDocument.findMany({ where: { studentId: { in: studentIds }, documentId: pdt.documentId }, select: { studentId: true } });
        const set = new Set(existing.map(e => e.studentId));
        for (const sid of studentIds) if (!set.has(sid)) createdDocs++;
      }
      return NextResponse.json({ dryRun: true, students: studentIds.length, createdTasks, updatedTasks, createdDocs, updatedDocs });
    }

    for (const sid of studentIds) {
      for (const ptt of (periode.taskTypes || [])) {
        if (onlyMissing) {
          try {
            await prisma.studentTask.create({ data: { studentId: sid, taskTypeId: ptt.taskTypeId, dueDate: ptt.dueDate || undefined } });
            createdTasks++;
          } catch {
            const updated = await prisma.studentTask.updateMany({
              where: { studentId: sid, taskTypeId: ptt.taskTypeId },
              data: { dueDate: ptt.dueDate || null, ...(reset ? { status: 'todo', exempted: false } : {}) },
            });
            if (updated.count > 0) updatedTasks += updated.count;
          }
        } else {
          const up = await prisma.studentTask.upsert({
            where: { studentId_taskTypeId: { studentId: sid, taskTypeId: ptt.taskTypeId } },
            update: { dueDate: ptt.dueDate || null, ...(reset ? { status: 'todo', exempted: false } : {}) },
            create: { studentId: sid, taskTypeId: ptt.taskTypeId, dueDate: ptt.dueDate || undefined },
          });
          if (up) updatedTasks += 1;
        }
      }
      for (const pdt of (periode.documentTypes || [])) {
        if (onlyMissing) {
          try {
            await prisma.studentDocument.create({ data: { studentId: sid, documentId: pdt.documentTypeId } });
            createdDocs++;
          } catch {
            if (reset) {
              const upd = await prisma.studentDocument.updateMany({ where: { studentId: sid, documentId: pdt.documentTypeId }, data: { status: 'pending', submitted: null } });
              if (upd.count > 0) updatedDocs += upd.count;
            }
          }
        } else {
          try {
            const existing = await prisma.studentDocument.findFirst({
              where: { studentId: sid, documentId: pdt.documentTypeId }
            });
            if (existing) {
              if (reset) {
                await prisma.studentDocument.update({
                  where: { id: existing.id },
                  data: { status: 'pending', submitted: null }
                });
              }
            } else {
              await prisma.studentDocument.create({
                data: { studentId: sid, documentId: pdt.documentTypeId }
              });
            }
            updatedDocs += 1;
          } catch {}
        }
      }
    }

    return NextResponse.json({ students: studentIds.length, createdTasks, updatedTasks, createdDocs, updatedDocs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

