import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const p = await prisma.periode.findUnique({ where: { id: params.id }, include: { taskTypes: { include: { taskType: true } }, documentTypes: { include: { documentType: true } } } });
    if (!p) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json(p);
  } catch (e) {
    // Fallback JSON
    try {
      const file = path.join(process.cwd(), 'prisma', 'db', 'periodes.json');
      const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
      const found = list.find((x: any) => x.id === params.id);
      if (!found) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
      return NextResponse.json(found);
    } catch (w) {
      console.error(w);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, description, startDate, endDate } = body || {};
    const p = await prisma.periode.update({
      where: { id: params.id },
      data: {
        name,
        description,
        startDate: typeof startDate !== 'undefined' ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: typeof endDate !== 'undefined' ? (endDate ? new Date(endDate) : null) : undefined,
      },
    });
    return NextResponse.json(p);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.periode.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
