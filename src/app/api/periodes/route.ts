import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    const periodes = await prisma.periode.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { taskTypes: { include: { taskType: true } }, documentTypes: { include: { documentType: true } } }
    });
    return NextResponse.json(periodes);
  } catch (e) {
    try {
      const dir = path.join(process.cwd(), 'prisma', 'db');
      const file = path.join(dir, 'periodes.json');
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        return NextResponse.json(Array.isArray(data) ? data : []);
      }
    } catch {}
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, description, startDate, endDate } = (body || {}) as any;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  try {
    let user = await prisma.user.findFirst();
    if (!user) user = await prisma.user.create({ data: { email: 'professeur@example.com', name: 'Professeur Principal' } });
    const created = await prisma.periode.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: user.id,
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/unable to open the database file|no such table|SQLITE_ERROR/i.test(msg)) {
      try {
        const dir = path.join(process.cwd(), 'prisma', 'db');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'periodes.json');
        const list = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) || []) : [];
        const created = {
          id: randomUUID(),
          name,
          description: description || null,
          startDate: startDate || null,
          endDate: endDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          taskTypes: [],
          documentTypes: []
        };
        list.unshift(created);
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
        return NextResponse.json(created, { status: 201 });
      } catch (w) {
        console.error('Fallback pÃ©riode failed:', w);
        return NextResponse.json({ error: 'CrÃ©ation impossible (fallback)' }, { status: 500 });
      }
    }
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

