import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { sanitizeDataForDB, validateEncodingBeforeInsert } from '@/lib/encoding-utils'

const defaultDocs = [
  { id: 'd1', name: 'Fiche de renseignements', description: "Fiche administrative de début d'année", dueDate: null },
  { id: 'd2', name: 'Evasco', description: 'Évaluation scolaire', dueDate: null },
  { id: 'd3', name: 'Assurance scolaire', description: "Attestation d'assurance", dueDate: null },
  { id: 'd4', name: 'FSE', description: 'Foyer Socio-Ã‰ducatif', dueDate: null },
  { id: 'd5', name: 'Demande de bourse', description: 'Dossier de bourse', dueDate: null },
]

const filePath = () => path.join(process.cwd(), 'prisma', 'db', 'document-types.json')

export async function GET() {
  try {
    const { db } = await import('@/lib/db').catch(() => ({ db: null as any }))
    const prisma = db
    if (prisma) {
      const docs = await prisma.documentType.findMany()
      if (docs && docs.length > 0) return NextResponse.json(docs)
    }
  } catch {}

  try {
    const fp = filePath()
    if (fs.existsSync(fp)) {
      const list = JSON.parse(fs.readFileSync(fp, 'utf8'))
      return NextResponse.json(Array.isArray(list) ? list : [])
    }
  } catch {}

  return NextResponse.json(defaultDocs)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { name, description, dueDate } = body || {}

    if (!name) {
      return NextResponse.json({ error: 'name requis' }, { status: 400 })
    }

    // Nettoyer et valider l'encodage
    try {
      const sanitizedData = sanitizeDataForDB({ name, description }) as { name: string; description: string }
      validateEncodingBeforeInsert(sanitizedData)
      name = sanitizedData.name
      description = sanitizedData.description
    } catch (encodingError) {
      console.error('Erreur d\'encodage:', encodingError)
      return NextResponse.json({ 
        error: 'Problème d\'encodage détecté. Vérifiez les caractères spéciaux.',
        details: encodingError instanceof Error ? encodingError.message : String(encodingError)
      }, { status: 400 })
    }

    const { db } = await import('@/lib/db').catch(() => ({ db: null as any }))
    if (!db) throw new Error('DB indisponible')
    const prisma = db

    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({ data: { email: 'professeur@example.com', name: 'Professeur Principal' } })
    }

    const created = await prisma.documentType.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    // Fallback fichier si DB indisponible
    try {
      const body = await request.json().catch(() => null) as any
      let name = body?.name
      let description = body?.description ?? null
      const dueDate = body?.dueDate ?? null

      if (!name) return NextResponse.json({ error: 'name requis' }, { status: 400 })

      // Nettoyer et valider l'encodage pour le fallback aussi
      try {
        const sanitizedData = sanitizeDataForDB({ name, description }) as { name: string; description: string }
        validateEncodingBeforeInsert(sanitizedData)
        name = sanitizedData.name
        description = sanitizedData.description
      } catch (encodingError) {
        console.error('Erreur d\'encodage (fallback):', encodingError)
        return NextResponse.json({ 
          error: 'Problème d\'encodage détecté. Vérifiez les caractères spéciaux.',
          details: encodingError instanceof Error ? encodingError.message : String(encodingError)
        }, { status: 400 })
      }
      const fp = filePath()
      const dir = path.dirname(fp)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const list = fs.existsSync(fp) ? (JSON.parse(fs.readFileSync(fp, 'utf8')) || []) : []
      const doc = { id: randomUUID(), name, description, dueDate }
      list.unshift(doc)
      fs.writeFileSync(fp, JSON.stringify(list, null, 2), 'utf8')
      return NextResponse.json(doc, { status: 201 })
    } catch (w) {
      console.error('Fallback document create failed:', w)
      return NextResponse.json({ error: 'Création impossible' }, { status: 500 })
    }
  }
}


