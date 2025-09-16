import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

const prisma = db;

// POST { taskTypeId, dueDate? } to attach
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { taskTypeId, dueDate } = await req.json();
    if (!taskTypeId) return NextResponse.json({ error: 'taskTypeId requis' }, { status: 400 });
    // Fallback to JSON file since periodeTaskType model doesn't exist in schema
    const dir = path.join(process.cwd(), 'prisma', 'db');
    const file = path.join(dir, 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const periode = list.find((p: any) => p.id === id);
    if (!periode) return NextResponse.json({ error: 'Période non trouvée' }, { status: 404 });
    
    const existing = (periode.taskTypes || []).find((tt: any) => tt.taskTypeId === taskTypeId);
    if (existing) {
      existing.dueDate = dueDate || null;
      existing.updatedAt = new Date().toISOString();
    } else {
      if (!periode.taskTypes) periode.taskTypes = [];
      periode.taskTypes.push({
        id: Math.random().toString(36).substr(2, 9),
        periodeId: id,
        taskTypeId,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
    const created = existing || periode.taskTypes[periode.taskTypes.length - 1];
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/unable to open the database file|no such table|SQLITE_ERROR/i.test(msg)) {
      try {
        const dir = path.join(process.cwd(), 'prisma', 'db');
        const file = path.join(dir, 'periodes.json');
        const body = await req.json().catch(() => null) as any;
        const taskTypeId = body?.taskTypeId;
        const dueDate = body?.dueDate || null;
        if (!taskTypeId) return NextResponse.json({ error: 'taskTypeId requis' }, { status: 400 });
        const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
        const idx = list.findIndex((p: any) => p.id === id);
        if (idx === -1) return NextResponse.json({ error: 'Période introuvable' }, { status: 404 });
        const p = list[idx];
        p.taskTypes = Array.isArray(p.taskTypes) ? p.taskTypes : [];
        const exists = p.taskTypes.find((x: any) => x.taskTypeId === taskTypeId);
        if (!exists) p.taskTypes.push({ taskTypeId, dueDate }); else exists.dueDate = dueDate;
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
        return NextResponse.json({ periodeId: id, taskTypeId, dueDate }, { status: 201 });
      } catch (w) {
        console.error('Fallback periode task-type failed:', w);
        return NextResponse.json({ error: 'Erreur serveur (fallback)' }, { status: 500 });
      }
    }
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE ?taskTypeId=...
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const taskTypeId = searchParams.get('taskTypeId');
    if (!taskTypeId) return NextResponse.json({ error: 'taskTypeId requis' }, { status: 400 });
    // Fallback to JSON file since periodeTaskType model doesn't exist in schema
    const dir = path.join(process.cwd(), 'prisma', 'db');
    const file = path.join(dir, 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const periode = list.find((p: any) => p.id === id);
    if (!periode) return NextResponse.json({ error: 'Période non trouvée' }, { status: 404 });
    
    if (periode.taskTypes) {
      periode.taskTypes = periode.taskTypes.filter((tt: any) => tt.taskTypeId !== taskTypeId);
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/unable to open the database file|no such table|SQLITE_ERROR/i.test(msg)) {
      try {
        const dir = path.join(process.cwd(), 'prisma', 'db');
        const file = path.join(dir, 'periodes.json');
        const { searchParams } = new URL(req.url);
        const taskTypeId = searchParams.get('taskTypeId');
        const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
        const idx = list.findIndex((p: any) => p.id === id);
        if (idx === -1) return NextResponse.json({ error: 'Période introuvable' }, { status: 404 });
        const p = list[idx];
        p.taskTypes = (p.taskTypes || []).filter((x: any) => x.taskTypeId !== taskTypeId);
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
        return NextResponse.json({ ok: true });
      } catch (w) {
        console.error('Fallback periode task-type delete failed:', w);
        return NextResponse.json({ error: 'Erreur serveur (fallback)' }, { status: 500 });
      }
    }
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}


