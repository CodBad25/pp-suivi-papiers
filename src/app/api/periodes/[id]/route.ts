import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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
    
    list.splice(idx, 1);
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
