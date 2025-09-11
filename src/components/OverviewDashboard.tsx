"use client";

import { useState, useEffect } from 'react';
import { usePeriods } from '../contexts/PeriodsContext';

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

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  studentId?: string | null;
}

export default function OverviewDashboard() {
  const { state: { periodes, selectedPeriode } } = usePeriods();
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalDocuments: 0,
    submittedDocuments: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriode]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let studentsData: Student[] = [];
      let tasksData: TaskItem[] = [];
      
      // Charger les étudiants
      const studentsResponse = await fetch('/api/students');
      if (studentsResponse.ok) {
        studentsData = await studentsResponse.json();
        setStudents(studentsData);
      }

      // Charger les tâches
      const tasksResponse = await fetch('/api/tasks');
      if (tasksResponse.ok) {
        tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }

      // Calculer les statistiques
      calculateStats(studentsData, tasksData);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (studentsData: Student[], tasksData: TaskItem[]) => {
    const totalStudents = studentsData?.length || 0;
    const totalTasks = tasksData?.length || 0;
    const completedTasks = tasksData?.filter(task => task.status === 'done').length || 0;
    
    let totalDocuments = 0;
    let submittedDocuments = 0;
    
    studentsData?.forEach(student => {
      if (student.documents) {
        totalDocuments += student.documents.length;
        submittedDocuments += student.documents.filter(doc => doc.status === 'submitted').length;
      }
    });

    setStats({
      totalStudents,
      totalTasks,
      completedTasks,
      totalDocuments,
      submittedDocuments
    });
  };

  const getUpcomingTasks = () => {
    return (tasks || [])
      .filter(task => task.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  };

  // Fonction pour gérer l'import des étudiants
  const handleImportStudents = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Import réussi: ${result.count} élèves importés`);
        loadDashboardData();
      } else {
        const error = await response.json();
        alert(`Erreur d'import: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import du fichier');
    }

    // Reset input
    event.target.value = '';
  };



  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return '✅';
      case 'in_progress': return '🔄';
      case 'todo': return '📋';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* En-tête avec période sélectionnée */}
      <div style={{
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#374151',
          margin: '0 0 8px 0'
        }}>
          📊 Vue d'ensemble
        </h1>
        {selectedPeriode && (
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Période active: <strong>{selectedPeriode.name}</strong>
          </p>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>👥</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: 0
            }}>Étudiants</h3>
          </div>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: 0
          }}>{stats.totalStudents}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: 0
            }}>Tâches</h3>
          </div>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: 0
          }}>{stats.completedTasks}/{stats.totalTasks}</p>
          <p style={{
            fontSize: '12px',
            opacity: 0.9,
            margin: '4px 0 0 0'
          }}>
            {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% terminées
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>📄</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: 0
            }}>Documents</h3>
          </div>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: 0
          }}>{stats.submittedDocuments}/{stats.totalDocuments}</p>
          <p style={{
            fontSize: '12px',
            opacity: 0.9,
            margin: '4px 0 0 0'
          }}>
            {stats.totalDocuments > 0 ? Math.round((stats.submittedDocuments / stats.totalDocuments) * 100) : 0}% soumis
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>📅</span>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: 0
            }}>Périodes</h3>
          </div>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: 0
          }}>{periodes?.length || 0}</p>
          <p style={{
            fontSize: '12px',
            opacity: 0.9,
            margin: '4px 0 0 0'
          }}>
            {selectedPeriode ? 'Active' : 'Aucune sélectionnée'}
          </p>
        </div>
      </div>

      {/* Tâches récentes */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⏰ Tâches à venir
        </h2>
        
        {getUpcomingTasks().length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Aucune tâche avec échéance prochaine
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {getUpcomingTasks().map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {getTaskStatusIcon(task.status)}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    color: '#374151'
                  }}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: '0 0 4px 0'
                    }}>
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      Échéance: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getTaskPriorityColor(task.priority)
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cartes des étudiants */}
      {students.length > 0 && (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            👥 Étudiants ({students.length})
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {students.map((student) => (
              <div
                key={student.id}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.boxShadow = 'none';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: student.gender === 'M' ? '#3b82f6' : '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 auto 8px auto'
                }}>
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0',
                  color: '#374151'
                }}>
                  {student.firstName} {student.lastName}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚡ Actions rapides
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span>✅</span>
            Créer une tâche
          </button>
          
          <button
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span>📄</span>
            Ajouter un document
          </button>
          
          <button
            onClick={() => window.location.href = '/manage'}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span>⚙️</span>
            Gestion des documents et tâches
          </button>
          
          <button
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span>📅</span>
            Nouvelle période
          </button>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleImportStudents}
            style={{ display: 'none' }}
            id="import-students-input"
          />
          <button
            onClick={() => document.getElementById('import-students-input')?.click()}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span>👥</span>
            Importer étudiants
          </button>
        </div>
      </div>


    </div>
  );
}