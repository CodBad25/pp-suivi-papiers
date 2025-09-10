import { PrismaClient } from '@prisma/client'
import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

async function run() {
  const argPath = process.argv[2]
  const backupsDir = path.join(process.cwd(), 'backups')

  let sqlitePath = argPath
  if (!sqlitePath) {
    const entries = fs.existsSync(backupsDir) ? fs.readdirSync(backupsDir).filter((d) => fs.statSync(path.join(backupsDir, d)).isDirectory()) : []
    if (entries.length === 0) throw new Error('Aucun backup trouvé. Fournissez un chemin vers dev.db en argument.')
    const latest = entries.sort().pop()!
    sqlitePath = path.join(backupsDir, latest, 'dev.db')
  }
  if (!fs.existsSync(sqlitePath)) throw new Error(`Fichier SQLite introuvable: ${sqlitePath}`)

  console.log('Migration depuis SQLite =>', sqlitePath)

  // Lire SQLite via sql.js
  const fileBuffer = fs.readFileSync(sqlitePath)
  const SQL = await initSqlJs({ locateFile: (file) => require.resolve('sql.js/dist/' + file) })
  const sdb = new SQL.Database(new Uint8Array(fileBuffer))
  const all = (sql: string) => {
    const stmt = sdb.prepare(sql)
    const rows: any[] = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  }
  const parseDate = (v: any) => (v ? new Date(v as any) : null)

  // 1) Users
  const users = all('SELECT * FROM User')
  console.log(`Users: ${users.length}`)
  if (users.length) {
    await prisma.user.createMany({ data: users.map((u: any) => ({ id: String(u.id), email: String(u.email), name: u.name ? String(u.name) : null, createdAt: parseDate(u.createdAt)!, updatedAt: parseDate(u.updatedAt)! })), skipDuplicates: true })
  }

  // 2) Students
  const students = all('SELECT * FROM Student')
  console.log(`Students: ${students.length}`)
  if (students.length) {
    await prisma.student.createMany({
      data: students.map((s: any) => ({
        id: String(s.id),
        firstName: String(s.firstName),
        lastName: String(s.lastName),
        gender: String(s.gender),
        class: String(s.class),
        createdAt: parseDate(s.createdAt)!,
        updatedAt: parseDate(s.updatedAt)!,
        userId: String(s.userId),
      })),
      skipDuplicates: true,
    })
  }

  // 3) DocumentType
  const docTypes = all('SELECT * FROM DocumentType')
  console.log(`DocumentType: ${docTypes.length}`)
  if (docTypes.length) {
    await prisma.documentType.createMany({
      data: docTypes.map((d: any) => ({
        id: String(d.id),
        name: String(d.name),
        description: d.description ? String(d.description) : null,
        dueDate: parseDate(d.dueDate),
        createdAt: parseDate(d.createdAt)!,
        updatedAt: parseDate(d.updatedAt)!,
        userId: String(d.userId),
      })),
      skipDuplicates: true,
    })
  }

  // 4) TaskType
  const taskTypes = all('SELECT * FROM TaskType')
  console.log(`TaskType: ${taskTypes.length}`)
  if (taskTypes.length) {
    await prisma.taskType.createMany({
      data: taskTypes.map((t: any) => ({
        id: String(t.id),
        name: String(t.name),
        description: t.description ? String(t.description) : null,
        dueDate: parseDate(t.dueDate),
        createdAt: parseDate(t.createdAt)!,
        updatedAt: parseDate(t.updatedAt)!,
        userId: String(t.userId),
      })),
      skipDuplicates: true,
    })
  }

  // 5) StudentDocument
  const studentDocs = all('SELECT * FROM StudentDocument')
  console.log(`StudentDocument: ${studentDocs.length}`)
  if (studentDocs.length) {
    await prisma.studentDocument.createMany({
      data: studentDocs.map((r: any) => ({
        id: String(r.id),
        status: String(r.status),
        remarks: r.remarks ? String(r.remarks) : null,
        submitted: parseDate(r.submitted),
        createdAt: parseDate(r.createdAt)!,
        updatedAt: parseDate(r.updatedAt)!,
        studentId: String(r.studentId),
        documentId: String(r.documentId),
      })),
      skipDuplicates: true,
    })
  }

  // 6) Dispensation
  const dispensations = all('SELECT * FROM Dispensation')
  console.log(`Dispensation: ${dispensations.length}`)
  if (dispensations.length) {
    await prisma.dispensation.createMany({
      data: dispensations.map((r: any) => ({
        id: String(r.id),
        reason: r.reason ? String(r.reason) : null,
        createdAt: parseDate(r.createdAt)!,
        updatedAt: parseDate(r.updatedAt)!,
        studentId: String(r.studentId),
        documentId: String(r.documentId),
      })),
      skipDuplicates: true,
    })
  }

  // 7) Reminder
  const reminders = all('SELECT * FROM Reminder')
  console.log(`Reminder: ${reminders.length}`)
  if (reminders.length) {
    await prisma.reminder.createMany({
      data: reminders.map((r: any) => ({
        id: String(r.id),
        title: String(r.title),
        message: String(r.message),
        dueDate: parseDate(r.dueDate)!,
        sent: !!r.sent,
        sentAt: parseDate(r.sentAt),
        createdAt: parseDate(r.createdAt)!,
        updatedAt: parseDate(r.updatedAt)!,
        userId: String(r.userId),
      })),
      skipDuplicates: true,
    })
  }

  // 8) Task
  const tasks = all('SELECT * FROM Task')
  console.log(`Task: ${tasks.length}`)
  if (tasks.length) {
    await prisma.task.createMany({
      data: tasks.map((t: any) => ({
        id: String(t.id),
        title: String(t.title),
        description: t.description ? String(t.description) : null,
        status: String(t.status),
        priority: String(t.priority),
        dueDate: parseDate(t.dueDate),
        comments: t.comments ? String(t.comments) : null,
        createdAt: parseDate(t.createdAt)!,
        updatedAt: parseDate(t.updatedAt)!,
        userId: String(t.userId),
        studentId: t.studentId ? String(t.studentId) : null,
      })),
      skipDuplicates: true,
    })
  }

  // 9) StudentTask
  const studentTasks = all('SELECT * FROM StudentTask')
  console.log(`StudentTask: ${studentTasks.length}`)
  if (studentTasks.length) {
    await prisma.studentTask.createMany({
      data: studentTasks.map((st: any) => ({
        id: String(st.id),
        status: String(st.status),
        exempted: !!st.exempted,
        dueDate: parseDate(st.dueDate),
        createdAt: parseDate(st.createdAt)!,
        updatedAt: parseDate(st.updatedAt)!,
        studentId: String(st.studentId),
        taskTypeId: String(st.taskTypeId),
      })),
      skipDuplicates: true,
    })
  }

  console.log('Migration terminée avec succès ✅')
}

run().catch((e) => {
  console.error('Erreur migration:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})