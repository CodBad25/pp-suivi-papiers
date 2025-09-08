import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { sanitizeDataForDB, validateEncodingBeforeInsert } from '@/lib/encoding-utils'

const prisma = new PrismaClient()
const filePath = () => path.join(process.cwd(), 'prisma', 'db', 'task-types.json')

export async function GET() {
  try {
    const user = await prisma.user.findFirst()
    const types = await prisma.taskType.findMany({ where: user ? { userId: user.id } : undefined })
    return NextResponse.json(types)
  } catch {
    try {
      const fp = filePath()
      if (fs.existsSync(fp)) {
        const list = JSON.parse(fs.readFileSync(fp, 'utf8'))
        return NextResponse.json(Array.isArray(list) ? list : [])
      }
    } catch {}
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as any
  let name = body?.name
  let description = body?.description ?? null
  
  if (!name) return NextResponse.json({ error: 'name requis' }, { status: 400 })
  
  // Nettoyer et valider l'encodage
  try {
    const sanitizedData = sanitizeDataForDB({ name, description }) as { name: string; description?: string }
    validateEncodingBeforeInsert(sanitizedData)
    name = sanitizedData.name
    description = sanitizedData.description
  } catch (encodingError) {
    console.error('Erreur d\'encodage:', encodingError)
    return NextResponse.json({ 
      error: 'Problème d\'encodage détecté. Vérifiez les caractères spéciaux.',
      details: (encodingError as Error)?.message || String(encodingError)
    }, { status: 400 })
  }
  try {
    let user = await prisma.user.findFirst()
    if (!user) user = await prisma.user.create({ data: { email: 'professeur@example.com' } as any })
    const created = await prisma.taskType.create({ data: { name, description, userId: user.id } })
    return NextResponse.json(created, { status: 201 })
  } catch {
    try {
      const fp = filePath()
      const dir = path.dirname(fp)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const list = fs.existsSync(fp) ? (JSON.parse(fs.readFileSync(fp, 'utf8')) || []) : []
      const created = { id: randomUUID(), name, description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      list.unshift(created)
      fs.writeFileSync(fp, JSON.stringify(list, null, 2), 'utf8')
      return NextResponse.json(created, { status: 201 })
    } catch (w) {
      console.error('Fallback task-type create failed:', w)
      return NextResponse.json({ error: 'Création impossible (fallback)' }, { status: 500 })
    }
  }
}
