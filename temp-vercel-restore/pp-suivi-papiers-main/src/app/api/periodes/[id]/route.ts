import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

const prisma = db;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Fallback to JSON file since periode model doesn't exist in schema
    const file = path.join(process.cwd(), 'prisma', 'db', 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const found = list.find((x: any) => x.id === id);
    if (!found) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json(found);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, startDate, endDate } = body || {};
    // Fallback to JSON file since periode model doesn't exist in schema
    const file = path.join(process.cwd(), 'prisma', 'db', 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const idx = list.findIndex((x: any) => x.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    
    const updated = {
      ...list[idx],
      name: name !== undefined ? name : list[idx].name,
      description: description !== undefined ? description : list[idx].description,
      startDate: startDate !== undefined ? startDate : list[idx].startDate,
      endDate: endDate !== undefined ? endDate : list[idx].endDate,
      updatedAt: new Date().toISOString()
    };
    
    list[idx] = updated;
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Fallback to JSON file since periode model doesn't exist in schema
    const file = path.join(process.cwd(), 'prisma', 'db', 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const idx = list.findIndex((x: any) => x.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    
    const periode = list[idx];
    
    // Supprimer les tâches associées dans la base de données Prisma
    if (periode.taskTypes && periode.taskTypes.length > 0) {
      for (const taskType of periode.taskTypes) {
        try {
          // Supprimer toutes les tâches étudiantes de ce type pour cette période
          await prisma.studentTask.deleteMany({
            where: {
              taskTypeId: taskType.taskTypeId,
            }
          });
        } catch (taskError) {
          console.log(`Tâches déjà supprimées ou inexistantes pour le type ${taskType.taskTypeId}`);
        }
      }
    }
    
    // Supprimer les documents associés dans la base de données Prisma
    if (periode.documentTypes && periode.documentTypes.length > 0) {
      for (const docType of periode.documentTypes) {
        try {
          // Supprimer tous les documents étudiants de ce type pour cette période
          await prisma.studentDocument.deleteMany({
            where: {
              documentId: docType.documentTypeId,
            }
          });
        } catch (docError) {
          console.log(`Documents déjà supprimés ou inexistants pour le type ${docType.documentTypeId}`);
        }
      }
    }
    
    // Supprimer la période du fichier JSON
    list.splice(idx, 1);
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Erreur lors de la suppression de la période:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
