"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  class: string;
  documents?: StudentDocument[];
}

interface StudentDocument {
  id: string;
  status: 'not-submitted' | 'pending' | 'submitted';
  remarks?: string;
  submitted?: string;
  document: {
    id: string;
    name: string;
    description?: string;
    dueDate?: string;
  };
}

interface DocumentType {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  studentId?: string | null;
}

interface StudentTaskUI {
  id: string;
  status: 'todo' | 'in_progress' | 'done';
  exempted?: boolean;
  dueDate?: string | null;
  taskType: { id: string; name: string };
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showImportAnimation, setShowImportAnimation] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedNames, setImportedNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDetailOpen, setIsStudentDetailOpen] = useState(false);
  const [localDocumentStates, setLocalDocumentStates] = useState<{[key: string]: string}>({});
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);
  const [tasksByStudent, setTasksByStudent] = useState<{[studentId: string]: TaskItem[]}>({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskCounts, setTaskCounts] = useState<{[studentId: string]: { done: number; total: number }}>({});
  const [taskFilterStatus, setTaskFilterStatus] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [taskSort, setTaskSort] = useState<'dueAsc' | 'dueDesc'>('dueAsc');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high', dueDate: '' });
  const [newDocument, setNewDocument] = useState({ name: '', description: '', dueDate: '' });
  const [showRemarks, setShowRemarks] = useState<{[key: string]: boolean}>({});

  const router = useRouter();

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les étudiants depuis l'API
      const studentsResponse = await fetch('/api/students');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
      }

      // Charger les documents depuis l'API
      const documentsResponse = await fetch('/api/documents');
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData);
      } else {
        // Utiliser les documents par défaut si aucun document n'existe
        setDocuments([
          { id: '1', name: 'Fiche de renseignements', description: 'Fiche administrative de début d\'année' },
          { id: '2', name: 'Evasco', description: 'Évaluation scolaire' },
          { id: '3', name: 'Assurance scolaire', description: 'Attestation d\'assurance' },
          { id: '4', name: 'FSE', description: 'Foyer Socio-Éducatif' },
          { id: '5', name: 'Demande de bourse', description: 'Dossier de bourse' }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Précharge les compteurs de tâches pour les cartes
  useEffect(() => {
    students.forEach((s) => {
      if (!taskCounts[s.id]) {
        loadTasksForStudent(s.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  const loadTasksForStudent = async (studentId: string) => {
    try {
      const res = await fetch(`/api/student-tasks?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setTasksByStudent(prev => ({ ...prev, [studentId]: data }));
        const visible = (data || []).filter((t: any) => !t.exempted);
        const done = visible.filter((t: any) => t.status === 'done').length;
        setTaskCounts(prev => ({ ...prev, [studentId]: { done, total: visible.length } }));
      }
    } catch (e) {
      console.error('Erreur chargement tâches:', e);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowImportAnimation(true);
    setImportProgress(0);
    setImportedNames([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Animation de progression
      const animationInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(animationInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(animationInterval);

      if (response.ok) {
        const result = await response.json();
        setImportProgress(100);
        setImportedNames(result.details?.importedNames || []);

        setTimeout(() => {
          setShowImportAnimation(false);
          setIsUploading(false);
          loadData(); // Recharger les données
        }, 2000);

        console.log("Import réussi !", `${result.details?.importedNames?.length || 0} élèves importés`);
      } else {
        const error = await response.json();
        console.error('Erreur lors de l\'import:', error);
        setShowImportAnimation(false);
        setIsUploading(false);
        console.error("Erreur d'import", error.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setShowImportAnimation(false);
      setIsUploading(false);
      console.error("Erreur d'import", "Une erreur est survenue lors de l'import");
    }
  };

  const handleDeleteAllStudents = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les élèves ?')) {
      try {
        const response = await fetch('/api/students', { method: 'DELETE' });
        if (response.ok) {
          setStudents([]);
          console.log("Suppression réussie", "Tous les élèves ont été supprimés");
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        console.error("Erreur de suppression", "Une erreur est survenue");
      }
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert('Le titre de la tâche est obligatoire');
      return;
    }

    try {
      const response = await fetch('/api/task-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate || null
        })
      });

      if (response.ok) {
        console.log('Tâche créée avec succès');
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
        setShowCreateTaskModal(false);
        // Recharger les données si nécessaire
        loadData();
      } else {
        console.error('Erreur lors de la création de la tâche');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocument.name.trim()) {
      alert('Le nom du document est obligatoire');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDocument.name,
          description: newDocument.description,
          dueDate: newDocument.dueDate || null
        })
      });

      if (response.ok) {
        console.log('Document créé avec succès');
        setNewDocument({ name: '', description: '', dueDate: '' });
        setShowCreateDocumentModal(false);
        // Recharger les données
        loadData();
      } else {
        console.error('Erreur lors de la création du document');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateDocumentStatus = async (studentId: string, documentId: string, status: string, remarks?: string) => {
    // Mise à jour immédiate de l'état local
    const key = `${studentId}-${documentId}`;
    setLocalDocumentStates(prev => ({
      ...prev,
      [key]: status
    }));

    // Déclencher la mise à jour des statistiques
    setStatsUpdateTrigger(prev => prev + 1);

    try {
      const response = await fetch(`/api/students/${studentId}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks }),
      });

      if (response.ok) {
        loadData(); // Recharger les données
        console.log("Document mis à jour", "Le statut du document a été modifié");
      } else {
        // En cas d'erreur API, on garde l'état local
        console.log("API non disponible, état sauvegardé localement");
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      console.log("API non disponible, état sauvegardé localement");
    }
  };

  const updateDocumentRemarks = async (studentId: string, documentId: string, remarks: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks }),
      });

      if (response.ok) {
        // Mise à jour locale des données
        setStudents(prevStudents => 
          prevStudents.map(student => {
            if (student.id === studentId) {
              return {
                ...student,
                documents: student.documents?.map(doc => {
                  if (doc.document.id === documentId) {
                    return { ...doc, remarks };
                  }
                  return doc;
                }) || []
              };
            }
            return student;
          })
        );
        console.log("Remarques mises à jour");
      } else {
        console.log("Erreur lors de la mise à jour des remarques");
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des remarques:', error);
    }
  };

  const cycleDocumentStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'not-submitted':
        return 'pending';
      case 'pending':
        return 'submitted';
      case 'submitted':
        return 'not-submitted';
      default:
        return 'not-submitted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-submitted': return '❌';
      case 'pending': return '⏳';
      case 'submitted': return '✅';
      default: return '❌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-submitted': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'submitted': return '#10b981';
      default: return '#ef4444';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'not-submitted': return '#fef2f2';
      case 'pending': return '#fffbeb';
      case 'submitted': return '#f0fdf4';
      default: return '#fef2f2';
    }
  };

  const getDocumentStatus = (studentId: string, documentId: string, defaultStatus: string) => {
    const key = `${studentId}-${documentId}`;
    return localDocumentStates[key] || defaultStatus;
  };

  const getDocumentIcon = (documentName: string) => {
    const name = documentName.toLowerCase();
    if (name.includes('fiche') && name.includes('renseignement')) return '📝';
    if (name.includes('assurance')) return '🛡️';
    if (name.includes('photo') || name.includes('autorisation')) return '📸';
    if (name.includes('fse') || name.includes('foyer')) return '🏫';
    if (name.includes('bourse')) return '💰';
    if (name.includes('règlement') || name.includes('reglement')) return '📋';
    if (name.includes('evasco') || name.includes('évacuation')) return '🚨';
    // Icône par défaut
    return '📄';
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query)
    );
  });

  const stats = useMemo(() => ({
    totalStudents: students.length,
    submittedDocs: students.reduce((acc, student) => {
      return acc + documents.filter(document => {
        const currentStatus = getDocumentStatus(student.id, document.id, 'not-submitted');
        return currentStatus === 'submitted';
      }).length;
    }, 0),
    pendingDocs: students.reduce((acc, student) => {
      return acc + documents.filter(document => {
        const currentStatus = getDocumentStatus(student.id, document.id, 'not-submitted');
        return currentStatus === 'pending';
      }).length;
    }, 0),
    notSubmittedDocs: students.reduce((acc, student) => {
      return acc + documents.filter(document => {
        const currentStatus = getDocumentStatus(student.id, document.id, 'not-submitted');
        return currentStatus === 'not-submitted';
      }).length;
    }, 0),
  }), [students, documents, localDocumentStates]);

  const completionPercentage = stats.totalStudents > 0 && documents.length > 0 ?
    Math.round((stats.submittedDocs / (stats.totalStudents * documents.length)) * 100) : 0;

  // Animation d'import
  const ImportAnimation = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}>
          <div style={{ color: 'white', fontSize: '2rem' }}>⟳</div>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🚀 Import en cours...
        </h3>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${importProgress}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#3b82f6', marginBottom: '1rem' }}>
          {importProgress.toFixed(0)}% complété
        </p>

        {importedNames.length > 0 && (
          <div>
            <p style={{ fontSize: '1rem', fontWeight: '500', color: '#10b981', marginBottom: '0.5rem' }}>
              ✅ Élèves importés :
            </p>
            <div style={{
              maxHeight: '160px',
              overflowY: 'auto',
            overflowX: 'hidden',
              backgroundColor: '#f0fdf4',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}>
              {importedNames.map((name, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.8rem',
                    backgroundColor: 'white',
                    borderRadius: '0.25rem',
                    padding: '0.25rem',
                    marginBottom: '0.25rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span style={{ fontWeight: '500' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Animation d'import */}
      {showImportAnimation && <ImportAnimation />}

      {/* Header compact */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 1rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: '0 0 0.25rem 0'
              }}>
                Suivi Administratif
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0
              }}>
                Gérez les documents et tâches de votre classe
              </p>
            </div>

            {/* Stats compactes */}
            {students.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {stats.totalStudents}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Élèves</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {stats.notSubmittedDocs}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Non rendus</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {stats.pendingDocs}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>En attente</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' }}>
                    {stats.submittedDocs}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rendus</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {completionPercentage}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Complétion</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv';
                  input.onchange = (e) => handleFileUpload(e as any);
                  input.click();
                }}
                disabled={isUploading}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  opacity: isUploading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                📁 Importer
              </button>
              <button
                onClick={() => router.push('/tasks')}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                ✅ Gérer les tâches
              </button>
              <button
                onClick={() => router.push('/documents')}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                📄 Gérer les documents
              </button>
              <button
                onClick={async () => {
                  const header = ['Eleve','Classe','Tache','Etat','Echeance','Dispense'];
                  const rows: string[] = [];
                  for (const s of students) {
                    try {
                      const res = await fetch(`/api/student-tasks?studentId=${s.id}`);
                      if (!res.ok) continue;
                      const tasks = await res.json();
                      (tasks || []).forEach((t: any) => {
                        const etat = t.status === 'done' ? 'Fait' : t.status === 'in_progress' ? 'En cours' : 'A faire';
                        const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '';
                        const disp = t.exempted ? 'Oui' : 'Non';
                        const name = (t.taskType && t.taskType.name) ? t.taskType.name : (t.title || '');
                        rows.push([`${s.lastName} ${s.firstName}`, s.class, name, etat, due, disp].map((v) => `"${(v||'').toString().replace(/"/g,'""')}"`).join(','));
                      });
                    } catch {}
                  }
                  const csv = [header.join(','), ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'tasks_export.csv'; a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: 'white',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Exporter tâches
              </button>
              {students.length > 0 && (
                <button
                  onClick={handleDeleteAllStudents}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  🗑️ Vider
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
        {students.length === 0 ? (
          // Section d'import
          <div style={{
            maxWidth: '600px',
            margin: '2rem auto',
            background: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              📁
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1e293b'
            }}>
              Commencez par importer votre classe
            </h3>
            <p style={{
              color: '#64748b',
              marginBottom: '1.5rem'
            }}>
              Importez un fichier CSV avec la liste de vos élèves
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px dashed #cbd5e1',
                borderRadius: '0.5rem',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                backgroundColor: '#f8fafc',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.borderColor = '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
            />
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#dbeafe',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#1e40af'
            }}>
              <strong>Format CSV requis :</strong> Nom, Prénom, Sexe, Classe
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Barre de recherche compacte */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1', maxWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="🔍 Rechercher un élève..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: '2.25rem',
                    padding: '0 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div style={{
                padding: '0.25rem 0.5rem',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                {filteredStudents.length}/{students.length} élèves
              </div>
            </div>

            {/* Grille ultra-compacte des élèves */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '0.5rem'
            }}>
              {filteredStudents.map((student) => {
                // Calculer les stats avec l'état local
                const completedDocs = documents.filter(document => {
                  const currentStatus = getDocumentStatus(student.id, document.id, 'not-submitted');
                  return currentStatus === 'submitted';
                }).length;
                const totalDocs = documents.length;
                const completion = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

                // Calculer les tâches terminées pour cet élève
                const studentTasks = tasksByStudent[student.id] || [];
                const completedTasks = studentTasks.filter(task => task.status === 'done').length;
                const totalTasks = studentTasks.length;
                const tasksCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100; // 100% si pas de tâches

                // Déterminer si TOUT est terminé (documents ET tâches)
                const allCompleted = completion === 100 && tasksCompletion === 100;
                const hasProgress = completion > 0 || (totalTasks > 0 && completedTasks > 0);

                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsStudentDetailOpen(true);
                      loadTasksForStudent(student.id);
                    }}
                    style={{
                      background: allCompleted ? '#bbf7d0' : completion === 100 ? '#f0fdf4' : hasProgress ? '#fef3c7' : 'white',
                      border: `${allCompleted ? '5px' : '2px'} solid ${allCompleted ? '#4ade80' : completion === 100 ? '#86efac' : hasProgress ? '#f59e0b' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Header élève */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem'
                    }}>
                      <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                        {/* NOM prénom et classe sur une seule ligne */}
                        <div style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: student.gender === 'M' ? '#2563eb' : '#ec4899',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '0.5rem'
                        }}>
                          {student.lastName.toUpperCase()} {student.firstName} - {student.class}
                        </div>

                      </div>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        color: allCompleted ? '#ffffff' : completion === 100 ? '#10b981' : hasProgress ? '#f59e0b' : '#9ca3af'
                      }}>
                        {completion}%
                      </div>
                    </div>

                    {/* Section Documents administratifs */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.375rem'
                      }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: allCompleted ? '#065f46' : '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          📄 Documents
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            color: allCompleted ? '#065f46' : '#6b7280',
                            background: allCompleted ? '#ffffff' : '#f3f4f6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem'
                          }}>
                            {completedDocs}/{totalDocs}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              documents.forEach(document => {
                                const currentStatus = getDocumentStatus(student.id, document.id, 'not-submitted');
                                if (currentStatus !== 'submitted') {
                                  updateDocumentStatus(student.id, document.id, 'submitted');
                                }
                              });
                            }}
                            style={{
                              width: '1.75rem',
                              height: '1.75rem',
                              borderRadius: '0.375rem',
                              border: allCompleted ? '1.5px solid #065f46' : '1.5px solid #4ade80',
                              background: allCompleted ? '#ffffff' : 'white',
                              color: allCompleted ? '#065f46' : '#4ade80',
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#10b981';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.color = '#10b981';
                            }}
                            title="Marquer tous les documents comme rendus"
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))',
                        gap: '0.375rem',
                        maxWidth: '100%'
                      }}>
                        {documents.map((document, index) => {
                          const studentDoc = student.documents?.find(
                            doc => doc.document.id === document.id
                          );
                          const apiStatus = studentDoc?.status || 'not-submitted';
                          const currentStatus = getDocumentStatus(student.id, document.id, apiStatus);

                          return (
                            <button
                              key={document.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStatus = cycleDocumentStatus(currentStatus);
                                updateDocumentStatus(student.id, document.id, newStatus);
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '0.5rem',
                                border: `3px solid ${getStatusColor(currentStatus)}`,
                                background: getStatusBackground(currentStatus),
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                minWidth: '32px',
                                filter: currentStatus === 'not-submitted' ? 'grayscale(0.3)' : 'none',
                                boxShadow: `0 0 0 1px ${getStatusColor(currentStatus)}20`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.15)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${getStatusColor(currentStatus)}40`;
                                e.currentTarget.style.filter = 'none';
                                e.currentTarget.style.borderWidth = '4px';
                                e.currentTarget.style.background = getStatusColor(currentStatus);
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = `0 0 0 1px ${getStatusColor(currentStatus)}20`;
                                e.currentTarget.style.filter = currentStatus === 'not-submitted' ? 'grayscale(0.3)' : 'none';
                                e.currentTarget.style.borderWidth = '3px';
                                e.currentTarget.style.background = getStatusBackground(currentStatus);
                                e.currentTarget.style.color = 'inherit';
                              }}
                              title={`${document.name}\nStatut: ${
                                currentStatus === 'not-submitted' ? 'Non rendu' :
                                currentStatus === 'pending' ? 'En attente' : 'Rendu'
                              }\nCliquer pour changer`}
                            >
                              {getDocumentIcon(document.name)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section Tâches */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.375rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flex: 1
                        }}>
                          <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                            ⚡ Tâches
                          </span>
                          {/* Barre de progression des tâches */}
                          <div style={{
                            flex: 1,
                            maxWidth: '90px',
                            height: '6px',
                            background: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              background: (() => {
                                const c = taskCounts[student.id] || { done: 0, total: 0 };
                                const progress = c.total > 0 ? (c.done / c.total) * 100 : 0;
                                return progress === 100 ? '#059669' : '#10b981';
                              })(),
                              width: (() => {
                                const c = taskCounts[student.id] || { done: 0, total: 0 };
                                return c.total > 0 ? `${(c.done / c.total) * 100}%` : '0%';
                              })(),
                              transition: 'all 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            color: allCompleted ? '#059669' : '#6b7280',
                            background: allCompleted ? '#ffffff' : '#f3f4f6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem'
                          }}>
                            {(() => {
                              const c = taskCounts[student.id] || { done: 0, total: 0 };
                              return `${c.done}/${c.total}`;
                            })()}
                          </span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const prevTasks = tasksByStudent[student.id] || [];
                              // Optimistic UI: marquer toutes les tâches non exemptées comme faites
                              const updated = (prevTasks || []).map((t: any) => t?.exempted ? t : (t.status === 'done' ? t : { ...t, status: 'done' }));
                              setTasksByStudent(prev => ({ ...prev, [student.id]: updated }));
                              // Mettre à jour immédiatement la barre (taskCounts)
                              const visibleNow = updated.filter((t: any) => !t.exempted);
                              const doneNow = visibleNow.filter((t: any) => t.status === 'done').length;
                              setTaskCounts(prev => ({ ...prev, [student.id]: { done: doneNow, total: visibleNow.length } }));
                              try {
                                const res = await fetch('/api/student-tasks', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ studentId: student.id, action: 'all_done' })
                                });
                                if (!res.ok) throw new Error('Bulk update failed');
                              } catch (error) {
                                console.error('Erreur:', error);
                                // Rollback si échec
                                setTasksByStudent(prev => ({ ...prev, [student.id]: prevTasks }));
                                const visible = (prevTasks || []).filter((t: any) => !t.exempted);
                                const done = visible.filter((t: any) => t.status === 'done').length;
                                setTaskCounts(prev => ({ ...prev, [student.id]: { done, total: visible.length } }));
                              }
                            }}
                            style={(() => {
                              const c = taskCounts[student.id] || { done: 0, total: 0 };
                              const isComplete = c.total > 0 && c.done === c.total;
                              const borderColor = isComplete ? '#059669' : '#8b5cf6';
                              const textColor = isComplete ? '#059669' : '#8b5cf6';
                              return {
                                width: '1.75rem',
                                height: '1.75rem',
                                borderRadius: '0.375rem',
                                border: `1.5px solid ${borderColor}`,
                                background: 'white',
                                color: textColor,
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              };
                            })()}
                            onMouseEnter={(e) => {
                              const c = taskCounts[student.id] || { done: 0, total: 0 };
                              const isComplete = c.total > 0 && c.done === c.total;
                              const bgColor = isComplete ? '#059669' : '#8b5cf6';
                              e.currentTarget.style.background = bgColor;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              const c = taskCounts[student.id] || { done: 0, total: 0 };
                              const isComplete = c.total > 0 && c.done === c.total;
                              const textColor = isComplete ? '#059669' : '#8b5cf6';
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.color = textColor;
                            }}
                            title="Marquer toutes les tâches comme faites"
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(32px, 1fr))',
                        gap: '0.25rem',
                        maxWidth: '100%'
                      }}>
                        {(() => {
                          const studentTasks = tasksByStudent[student.id] || [];
                          return studentTasks.slice(0, 6).map((task) => {
                            const getTaskStatusColor = (status: string) => {
                              switch (status) {
                                case 'todo': return '#9ca3af';
                                case 'in_progress': return '#f59e0b';
                                case 'done': return '#10b981';
                                default: return '#9ca3af';
                              }
                            };
                            
                            const getTaskStatusBackground = (status: string) => {
                              switch (status) {
                                case 'todo': return '#f3f4f6';
                                case 'in_progress': return '#fffbeb';
                                case 'done': return '#ecfdf5';
                                default: return '#f3f4f6';
                              }
                            };
                            
                            const getTaskIcon = (status: string) => {
                              switch (status) {
                                case 'todo': return '⭕';
                                case 'in_progress': return '🔄';
                                case 'done': return '✅';
                                default: return '⭕';
                              }
                            };
                            
                            const cycleTaskStatus = (currentStatus: string) => {
                              switch (currentStatus) {
                                case 'todo': return 'in_progress';
                                case 'in_progress': return 'done';
                                case 'done': return 'todo';
                                default: return 'in_progress';
                              }
                            };

                            return (
                              <button
                                key={task.id}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const oldStatus = task.status;
                                  const newStatus = cycleTaskStatus(task.status);
                                  // Optimistic UI update
                                  const prevArr = tasksByStudent[student.id] || [];
                                  const updated = prevArr.map((t: any) => t.id === task.id ? { ...t, status: newStatus } : t);
                                  setTasksByStudent(prev => ({ ...prev, [student.id]: updated }));
                                  // Mettre à jour immédiatement la barre (taskCounts)
                                  const visibleNow = updated.filter((t: any) => !t.exempted);
                                  const doneNow = visibleNow.filter((t: any) => t.status === 'done').length;
                                  setTaskCounts(prev => ({ ...prev, [student.id]: { done: doneNow, total: visibleNow.length } }));
                                  try {
                                    const res = await fetch(`/api/student-tasks/${task.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ status: newStatus })
                                    });
                                    if (!res.ok) throw new Error('Mise à jour de la tâche échouée');
                                  } catch (error) {
                                    console.error('Erreur lors de la mise à jour de la tâche:', error);
                                    // Rollback si échec
                                    const rolled = prevArr.map((t: any) => t.id === task.id ? { ...t, status: oldStatus } : t);
                                    setTasksByStudent(prev => ({ ...prev, [student.id]: rolled }));
                                    const visible = rolled.filter((t: any) => !t.exempted);
                                    const done = visible.filter((t: any) => t.status === 'done').length;
                                    setTaskCounts(prev => ({ ...prev, [student.id]: { done, total: visible.length } }));
                                  }
                                }}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '0.375rem',
                                  border: `3px solid ${getTaskStatusColor(task.status)}`,
                                  background: getTaskStatusBackground(task.status),
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease',
                                  minWidth: '28px',
                                  filter: task.status === 'todo' ? 'grayscale(0.3)' : 'none',
                                  boxShadow: `0 0 0 1px ${getTaskStatusColor(task.status)}20`
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.15)';
                                  e.currentTarget.style.boxShadow = `0 4px 12px ${getTaskStatusColor(task.status)}40`;
                                  e.currentTarget.style.filter = 'none';
                                  e.currentTarget.style.borderWidth = '4px';
                                  e.currentTarget.style.background = getTaskStatusColor(task.status);
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = `0 0 0 1px ${getTaskStatusColor(task.status)}20`;
                                  e.currentTarget.style.filter = task.status === 'todo' ? 'grayscale(0.3)' : 'none';
                                  e.currentTarget.style.borderWidth = '3px';
                                  e.currentTarget.style.background = getTaskStatusBackground(task.status);
                                  e.currentTarget.style.color = 'inherit';
                                }}
                                title={`${(task as any).taskType?.name || (task as any).title}\nStatut: ${
                                  task.status === 'todo' ? 'À faire' :
                                  task.status === 'in_progress' ? 'En cours' : 'Terminé'
                                }\nCliquer pour changer`}
                              >
                                {getTaskIcon(task.status)}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>



                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de détail élève */}
      {isStudentDetailOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Header */}
            <div style={{
              padding: '0.75rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {selectedStudent.gender === 'M' ? '👨' : '👩'}
                </span>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h2>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  marginLeft: '0.5rem'
                }}>
                  {selectedStudent.class}
                </span>
              </div>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.875rem'
              }}>
                Gestion des documents et tâches administratives
              </p>
            </div>

            {/* Contenu */}
            <div style={{ 
              padding: '0.75rem 1.5rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Statistiques élève */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.375rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: '#dbeafe',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }}>
                    {documents.length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#1e40af'
                  }}>
                    Documents total
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: '#dcfce7',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#16a34a'
                  }}>
                    {documents.filter(document => {
                      const currentStatus = getDocumentStatus(selectedStudent.id, document.id, 'not-submitted');
                      return currentStatus === 'submitted';
                    }).length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#15803d'
                  }}>
                    Rendus
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: '#fee2e2',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#dc2626'
                  }}>
                    {documents.filter(document => {
                      const currentStatus = getDocumentStatus(selectedStudent.id, document.id, 'not-submitted');
                      return currentStatus === 'not-submitted';
                    }).length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#b91c1c'
                  }}>
                    Non rendus
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: '#fed7aa',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#ea580c'
                  }}>
                    {documents.filter(document => {
                      const currentStatus = getDocumentStatus(selectedStudent.id, document.id, 'not-submitted');
                      return currentStatus === 'pending';
                    }).length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#c2410c'
                  }}>
                    En attente
                  </div>
                </div>
              </div>

              {/* Contenu en deux colonnes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                gap: '0.5rem',
                alignItems: 'start'
              }}>
                {/* Colonne gauche - Documents */}
                <div>
                  {/* Liste des documents */}
                  <div>
                <h4 style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📄 Documents administratifs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {documents.map((document) => {
                    const studentDoc = selectedStudent.documents?.find(
                      doc => doc.document.id === document.id
                    );
                    const apiStatus = studentDoc?.status || 'not-submitted';
                    const currentStatus = getDocumentStatus(selectedStudent.id, document.id, apiStatus);

                    return (
                      <div
                        key={document.id}
                        style={{
                          padding: '0.25rem',
                          borderRadius: '0.5rem',
                          border: `2px solid ${
                            currentStatus === 'submitted' ? '#bbf7d0' :
                            currentStatus === 'pending' ? '#fed7aa' : '#fecaca'
                          }`,
                          background:
                            currentStatus === 'submitted' ? '#f0fdf4' :
                            currentStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: getStatusColor(currentStatus)
                            }}></div>
                            <div>
                              <div style={{ fontWeight: '500' }}>{document.name}</div>
                              {document.description && (
                                <div style={{
                                  fontSize: '0.875rem',
                                  color: '#6b7280'
                                }}>
                                  {document.description}
                                </div>
                              )}
                              {studentDoc?.submitted && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#16a34a'
                                }}>
                                  Rendu le {new Date(studentDoc.submitted).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newStatus = cycleDocumentStatus(currentStatus);
                              updateDocumentStatus(selectedStudent.id, document.id, newStatus);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              border: `1px solid ${getStatusColor(currentStatus)}`,
                              background: getStatusBackground(currentStatus),
                              color: getStatusColor(currentStatus),
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = getStatusColor(currentStatus);
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = getStatusBackground(currentStatus);
                              e.currentTarget.style.color = getStatusColor(currentStatus);
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            title={`Cliquer pour changer le statut (actuellement: ${
                              currentStatus === 'not-submitted' ? 'Non rendu' :
                              currentStatus === 'pending' ? 'En attente' : 'Rendu'
                            })`}
                          >
                            <span>{getDocumentIcon(document.name)}</span>
                            <span>{getStatusIcon(currentStatus)}</span>
                            <span>
                              {currentStatus === 'not-submitted' ? 'Non rendu' :
                               currentStatus === 'pending' ? 'En attente' : 'Rendu'}
                            </span>
                          </button>
                        </div>
                        {studentDoc?.remarks && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.375rem 0.5rem',
                            background: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem'
                          }}>
                            <strong>💬</strong> {studentDoc.remarks}
                          </div>
                        )}
                        
                        {/* Bouton remarques au survol */}
                        <div 
                          style={{
                            position: 'relative',
                            marginTop: '0.25rem'
                          }}
                          onMouseEnter={(e) => {
                            const btn = e.currentTarget.querySelector('.remarks-btn') as HTMLElement;
                            if (btn) btn.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const btn = e.currentTarget.querySelector('.remarks-btn') as HTMLElement;
                            if (btn) btn.style.opacity = '0';
                          }}
                        >
                          <button
                            className="remarks-btn"
                            onClick={() => {
                              const remarksKey = `${selectedStudent.id}-${document.id}`;
                              setShowRemarks(prev => ({
                                ...prev,
                                [remarksKey]: !prev[remarksKey]
                              }));
                            }}
                            style={{
                              opacity: '0',
                              transition: 'opacity 0.2s ease',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              color: '#6b7280'
                            }}
                          >
                            💬 Remarques
                          </button>
                          {showRemarks[`${selectedStudent.id}-${document.id}`] && (
                            <textarea
                              placeholder="Ajouter des remarques..."
                              value={studentDoc?.remarks || ''}
                              onChange={(e) => {
                                const newRemarks = e.target.value;
                                updateDocumentRemarks(selectedStudent.id, document.id, newRemarks);
                              }}
                              style={{
                                width: '100%',
                                minHeight: '40px',
                                padding: '0.375rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                marginTop: '0.25rem'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  </div>
                </div>

                {/* Colonne droite - Tâches */}
                <div>
                  {/* Tâches */}
                  <div>
                <h4 style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ✅ Tâches
                </h4>

                {/* Ajout rapide */}
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.375rem' }}>
                  <input
                    type="text"
                    placeholder="Nouvelle tâche..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{
                      flex: 1,
                      height: '1.75rem',
                      padding: '0 0.5rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (!selectedStudent) return;
                      if (!newTaskTitle.trim()) return;
                      const res = await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newTaskTitle.trim(), studentId: selectedStudent.id })
                      });
                      if (res.ok) {
                        setNewTaskTitle('');
                        await loadTasksForStudent(selectedStudent.id);
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '2px solid #3b82f6',
                      background: '#3b82f6',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Ajouter
                  </button>
                </div>

                {/* Filtres / actions tâches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                  <select
                    value={taskFilterStatus}
                    onChange={(e) => setTaskFilterStatus(e.target.value as any)}
                    style={{ height: '1.75rem', border: '2px solid #d1d5db', borderRadius: '0.375rem', padding: '0 0.375rem', fontSize: '0.8rem', background: 'white' }}
                  >
                    <option value="all">Tous les états</option>
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Fait</option>
                  </select>
                  <select
                    value={taskSort}
                    onChange={(e) => setTaskSort(e.target.value as any)}
                    style={{ height: '2rem', border: '2px solid #d1d5db', borderRadius: '0.375rem', padding: '0 0.5rem', fontSize: '0.875rem', background: 'white' }}
                  >
                    <option value="dueAsc">Échéance ↑</option>
                    <option value="dueDesc">Échéance ↓</option>
                  </select>
                  <button
                    onClick={async () => {
                      if (!selectedStudent) return;
                      await fetch('/api/student-tasks', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentId: selectedStudent.id, action: 'all_in_progress' })
                      });
                      await loadTasksForStudent(selectedStudent.id);
                    }}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '2px solid #f59e0b', background: 'white', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Toutes en cours
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedStudent) return;
                      await fetch('/api/student-tasks', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentId: selectedStudent.id, action: 'all_done' })
                      });
                      await loadTasksForStudent(selectedStudent.id);
                    }}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '2px solid #10b981', background: 'white', color: '#10b981', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Toutes faites
                  </button>
                </div>

                {/* Liste des tâches */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(() => {
                    const base = selectedStudent ? (tasksByStudent[selectedStudent.id] || []) : [];
                    let list = base as any[];
                    if (taskFilterStatus !== 'all') list = list.filter(t => t.status === taskFilterStatus);
                    list = list.sort((a, b) => {
                      const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                      const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                      return taskSort === 'dueAsc' ? ad - bd : bd - ad;
                    });
                    return list;
                  })().map((task) => {
                    const nextStatus = (s: 'todo' | 'in_progress' | 'done') => s === 'todo' ? 'in_progress' : s === 'in_progress' ? 'done' : 'todo';
                    const statusColor = (s: 'todo' | 'in_progress' | 'done') => s === 'done' ? '#10b981' : s === 'in_progress' ? '#f59e0b' : '#9ca3af';
                    const statusBg = (s: 'todo' | 'in_progress' | 'done') => s === 'done' ? '#ecfdf5' : s === 'in_progress' ? '#fffbeb' : '#f3f4f6';
                    const statusLabel = (s: 'todo' | 'in_progress' | 'done') => s === 'done' ? 'Fait' : s === 'in_progress' ? 'En cours' : 'À faire';

                    return (
                      <div key={task.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: `2px solid ${statusColor(task.status as any)}`,
                        background: statusBg(task.status as any)
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(task.status as any) }} />
                          <div style={{ fontWeight: 500 }}>{(task as any).taskType?.name || (task as any).title}</div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                            <input
                              type="checkbox"
                              checked={(task as any).exempted || false}
                              onChange={async (e) => {
                                await fetch(`/api/student-tasks/${(task as any).id}` , {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ exempted: e.target.checked })
                                });
                                if (selectedStudent) await loadTasksForStudent(selectedStudent.id);
                              }}
                            />
                            Dispensé
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            title="Changer le statut"
                            onClick={async () => {
                              const ns = nextStatus(task.status as any);
                              await fetch(`/api/student-tasks/${task.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: ns })
                              });
                              if (selectedStudent) await loadTasksForStudent(selectedStudent.id);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: `2px solid ${statusColor(task.status as any)}`,
                              background: 'white',
                              color: statusColor(task.status as any),
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            {statusLabel(task.status as any)}
                          </button>
                          <button
                            title="Supprimer la tâche"
                            onClick={async () => {
                              await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
                              if (selectedStudent) await loadTasksForStudent(selectedStudent.id);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '2px solid #ef4444',
                              background: 'white',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {selectedStudent && (!tasksByStudent[selectedStudent.id] || tasksByStudent[selectedStudent.id].length === 0) && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Aucune tâche pour cet élève.</div>
                  )}
                </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setIsStudentDetailOpen(false)}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#f3f4f6',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de création de tâche */}
      {false && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                ✅ Créer une nouvelle tâche
              </h2>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Ex: Remplir le carnet de correspondance"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Description optionnelle de la tâche"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Priorité
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTask}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Créer la tâche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de création de document */}
      {false && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                📄 Créer un nouveau document
              </h2>
              <button
                onClick={() => setShowCreateDocumentModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nom du document *
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                  placeholder="Ex: Autorisation de sortie"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                  placeholder="Description du document à rendre"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Date limite de rendu
                </label>
                <input
                  type="date"
                  value={newDocument.dueDate}
                  onChange={(e) => setNewDocument({...newDocument, dueDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateDocumentModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateDocument}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Créer le document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
