import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// POST { documentTypeId, dueDate? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { documentTypeId, dueDate } = await req.json();
    if (!documentTypeId) return NextResponse.json({ error: 'documentTypeId requis' }, { status: 400 });
    // Fallback to JSON file since periodeDocumentType model doesn't exist in schema
    const dir = path.join(process.cwd(), 'prisma', 'db');
    const file = path.join(dir, 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const periode = list.find((p: any) => p.id === id);
    if (!periode) return NextResponse.json({ error: 'Période non trouvée' }, { status: 404 });
    
    const existing = (periode.documentTypes || []).find((dt: any) => dt.documentTypeId === documentTypeId);
    if (existing) {
      existing.dueDate = dueDate || null;
      existing.updatedAt = new Date().toISOString();
    } else {
      if (!periode.documentTypes) periode.documentTypes = [];
      periode.documentTypes.push({
        id: Math.random().toString(36).substr(2, 9),
        periodeId: id,
        documentTypeId,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
    const created = existing || periode.documentTypes[periode.documentTypes.length - 1];
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/unable to open the database file|no such table|SQLITE_ERROR/i.test(msg)) {
      try {
        const dir = path.join(process.cwd(), 'prisma', 'db');
        const file = path.join(dir, 'periodes.json');
        const body = await req.json().catch(() => null) as any;
        const documentTypeId = body?.documentTypeId;
        const dueDate = body?.dueDate || null;
        if (!documentTypeId) return NextResponse.json({ error: 'documentTypeId requis' }, { status: 400 });
        const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
        const idx = list.findIndex((p: any) => p.id === id);
        if (idx === -1) return NextResponse.json({ error: 'Période introuvable' }, { status: 404 });
        const p = list[idx];
        p.documentTypes = Array.isArray(p.documentTypes) ? p.documentTypes : [];
        const exists = p.documentTypes.find((x: any) => x.documentTypeId === documentTypeId);
        if (!exists) p.documentTypes.push({ documentTypeId, dueDate }); else exists.dueDate = dueDate;
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
        return NextResponse.json({ periodeId: id, documentTypeId, dueDate }, { status: 201 });
      } catch (w) {
        console.error('Fallback periode document-type failed:', w);
        return NextResponse.json({ error: 'Erreur serveur (fallback)' }, { status: 500 });
      }
    }
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE ?documentTypeId=...
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const documentTypeId = searchParams.get('documentTypeId');
    if (!documentTypeId) return NextResponse.json({ error: 'documentTypeId requis' }, { status: 400 });
    // Fallback to JSON file since periodeDocumentType model doesn't exist in schema
    const dir = path.join(process.cwd(), 'prisma', 'db');
    const file = path.join(dir, 'periodes.json');
    const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    const periode = list.find((p: any) => p.id === id);
    if (!periode) return NextResponse.json({ error: 'Période non trouvée' }, { status: 404 });
    
    if (periode.documentTypes) {
      periode.documentTypes = periode.documentTypes.filter((dt: any) => dt.documentTypeId !== documentTypeId);
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
        const documentTypeId = searchParams.get('documentTypeId');
        const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
        const idx = list.findIndex((p: any) => p.id === id);
        if (idx === -1) return NextResponse.json({ error: 'Période introuvable' }, { status: 404 });
        const p = list[idx];
        p.documentTypes = (p.documentTypes || []).filter((x: any) => x.documentTypeId !== documentTypeId);
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
        return NextResponse.json({ ok: true });
      } catch (w) {
        console.error('Fallback periode document-type delete failed:', w);
        return NextResponse.json({ error: 'Erreur serveur (fallback)' }, { status: 500 });
      }
    }
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
