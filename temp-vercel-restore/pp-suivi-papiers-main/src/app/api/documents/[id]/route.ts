import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { sanitizeDataForDB, validateEncodingBeforeInsert } from '@/lib/encoding-utils';
import { db } from '@/lib/db';

const prisma = db;

const filePath = () => path.join(process.cwd(), 'prisma', 'db', 'document-types.json');

// PUT - Modifier un document
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    let { name, description, dueDate } = body || {};
    
    if (!name) {
      return NextResponse.json({ error: 'name requis' }, { status: 400 });
    }
    
    // Nettoyer et valider l'encodage
    try {
      const sanitizedData = sanitizeDataForDB({ name, description }) as { name: string; description: string };
      validateEncodingBeforeInsert(sanitizedData);
      name = sanitizedData.name;
      description = sanitizedData.description;
    } catch (encodingError) {
      console.error('Erreur d\'encodage:', encodingError);
      return NextResponse.json({ 
        error: 'Problème d\'encodage détecté. Vérifiez les caractères spéciaux.',
        details: encodingError instanceof Error ? encodingError.message : String(encodingError)
      }, { status: 400 });
    }

    const updated = await prisma.documentType.update({
      where: { id },
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    // Fallback fichier si DB indisponible
    try {
      const body = await req.json().catch(() => null) as any;
      let name = body?.name;
      let description = body?.description ?? null;
      const dueDate = body?.dueDate ?? null;
      
      if (!name) return NextResponse.json({ error: 'name requis' }, { status: 400 });
      
      // Nettoyer et valider l'encodage pour le fallback aussi
      try {
        const sanitizedData = sanitizeDataForDB({ name, description }) as { name: string; description: string };
        validateEncodingBeforeInsert(sanitizedData);
        name = sanitizedData.name;
        description = sanitizedData.description;
      } catch (encodingError) {
        console.error('Erreur d\'encodage (fallback):', encodingError);
        return NextResponse.json({ 
          error: 'Problème d\'encodage détecté. Vérifiez les caractères spéciaux.',
          details: encodingError instanceof Error ? encodingError.message : String(encodingError)
        }, { status: 400 });
      }
      
      const fp = filePath();
      const list = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : [];
      const idx = list.findIndex((d: any) => d.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
      
      list[idx] = { ...list[idx], name, description, dueDate };
      fs.writeFileSync(fp, JSON.stringify(list, null, 2), 'utf8');
      return NextResponse.json(list[idx]);
    } catch (fallbackError) {
      console.error('Fallback document update failed:', fallbackError);
      return NextResponse.json({ error: 'Erreur serveur (fallback)' }, { status: 500 });
    }
  }
}

// DELETE - Supprimer un document
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.documentType.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Fallback fichier si DB indisponible
    try {
      const fp = filePath();
      const list = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : [];
      const filtered = list.filter((d: any) => d.id !== id);
      fs.writeFileSync(fp, JSON.stringify(filtered, null, 2), 'utf8');
      return NextResponse.json({ ok: true });
    } catch (fallbackError) {
      console.error('Fallback document delete failed:', fallbackError);
      return NextResponse.json({ error: 'Erreur serveur (fallback)' }, { status: 500 });
    }
  }
}