import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });

    const text = await file.text();

    // Détection simple du délimiteur
    const firstLine = text.split(/\r?\n/)[0] || '';
    const delimiter = (firstLine.split(';').length - 1) > (firstLine.split(',').length - 1) ? ';' : ',';

    // Parse CSV
    const rawRecords: any[] = parse(text, {
      skip_empty_lines: true,
      trim: true,
      columns: true,
      encoding: 'utf8',
      delimiter,
      relax_column_count: true
    });

    const normalizeKey = (s: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[`'â€™]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_{2,}/g, '_');

    const normalizeGender = (val: any) => {
      const v = String(val ?? '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim();
      if (!v) return '';
      if (['m', 'masculin', 'homme', 'garcon', 'h', 'male', 'man', 'm.'].includes(v)) return 'M';
      if (['f', 'feminin', 'femme', 'fille', 'female', 'woman', 'w', 'f.'].includes(v)) return 'F';
      return v.startsWith('m') ? 'M' : v.startsWith('f') ? 'F' : '';
    };

    const records = rawRecords.map((rec) => {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(rec)) out[normalizeKey(String(k))] = v;
      return out;
    });

    const students: { firstName: string; lastName: string; gender: 'M'|'F'; class: string }[] = [];
    for (const record of records) {
      const lastName = record['nom'];
      const firstName = record['prenom'];
      const gender = record['sexe'];
      const studentClass = record['classe'];
      if (!lastName || !firstName || !gender || !studentClass) {
        return NextResponse.json({ error: 'Format CSV invalide. Nom, Prénom, Sexe, Classe requis.' }, { status: 400 });
      }
      const normalizedGender = normalizeGender(gender);
      if (normalizedGender !== 'M' && normalizedGender !== 'F') {
        return NextResponse.json({ error: `Le sexe doit Ãªtre 'M' ou 'F'. Valeur: ${gender}` }, { status: 400 });
      }
      students.push({
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        gender: normalizedGender as 'M'|'F',
        class: String(studentClass).trim()
      });
    }

    // Tentative de persistance DB (lazy-load Prisma)
    try {
      let prisma: any = null;
      try {
        const { PrismaClient } = await import('@prisma/client');
        const g = globalThis as any;
        prisma = g.__prisma || new PrismaClient();
        g.__prisma = prisma;
      } catch (e) {
        prisma = null;
      }

      if (!prisma) throw new Error('PRISMA_UNAVAILABLE');

      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({ data: { email: 'professeur@example.com', name: 'Professeur Principal' } });
      }
      const createdStudents = await prisma.student.createMany({ data: students.map(s => ({ ...s, userId: user.id })) });
      const allStudents = await prisma.student.findMany({ where: { userId: user.id }, select: { id: true } });
      const taskTypes = await prisma.taskType.findMany({ where: { userId: user.id } });
      for (const s of allStudents) {
        for (const tt of taskTypes) { try { await prisma.studentTask.create({ data: { studentId: s.id, taskTypeId: tt.id } }); } catch {}
        }
      }
      return NextResponse.json({
        message: `${createdStudents.count} élèves importés avec succès`,
        count: createdStudents.count,
        details: {
          totalProcessed: records.length,
          successful: createdStudents.count,
          failed: records.length - createdStudents.count,
          importedNames: students.map(s => `${s.lastName} ${s.firstName}`)
        }
      });
    } catch (dbErr) {
      // Fallback: écrire le CSV importé pour que GET /api/students le serve
      try {
        const dir = path.join(process.cwd(), 'prisma', 'db');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'last-import.csv'), text, 'utf8');
      } catch {}
      return NextResponse.json({
        message: `Import simulé (fallback sans DB)`,
        count: students.length,
        details: {
          totalProcessed: records.length,
          successful: students.length,
          failed: records.length - students.length,
          importedNames: students.map(s => `${s.lastName} ${s.firstName}`)
        }
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'importation du fichier CSV: ' + (error as Error).message }, { status: 500 });
  }
}

