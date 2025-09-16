"use client";

import { useState, useEffect } from "react";

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
  name: string;
  status: 'pending' | 'submitted';
  submittedAt?: Date;
}

interface DocumentType {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export default function SuiviAdministratif() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documentTypes] = useState<DocumentType[]>([
    { id: 'doc1', name: 'Fiche de renseignements', shortName: 'Fiche', color: '#3b82f6' },
    { id: 'doc2', name: 'Assurance scolaire', shortName: 'Assur', color: '#10b981' },
    { id: 'doc3', name: 'Autorisation photo', shortName: 'Photo', color: '#f59e0b' },
    { id: 'doc4', name: 'Règlement intérieur', shortName: 'Règle', color: '#ef4444' },
    { id: 'doc5', name: 'Demande de bourse', shortName: 'Bourse', color: '#8b5cf6' }
  ]);

  // Calcul des statistiques
  const stats = {
    totalStudents: students.length,
    submittedDocs: students.reduce((acc, student) => 
      acc + (student.documents?.filter(doc => doc.status === 'submitted').length || 0), 0),
    pendingDocs: students.reduce((acc, student) => 
      acc + (student.documents?.filter(doc => doc.status === 'pending').length || 0), 0),
  };

  const completionPercentage = stats.totalStudents > 0 
    ? Math.round((stats.submittedDocs / (stats.submittedDocs + stats.pendingDocs)) * 100) || 0
    : 0;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newStudents: Student[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const lastName = values[headers.indexOf('nom')] || values[0] || '';
        const firstName = values[headers.indexOf('prénom')] || values[headers.indexOf('prenom')] || values[1] || '';
        const gender = values[headers.indexOf('sexe')] || values[2] || '';
        const studentClass = values[headers.indexOf('classe')] || values[3] || '';
        
        return {
          id: `student-${Date.now()}-${index}`,
          lastName,
          firstName,
          gender,
          class: studentClass,
          documents: documentTypes.map(docType => ({
            id: `${docType.id}-${index}`,
            name: docType.name,
            status: 'pending' as const
          }))
        };
      });

      setStudents(prev => [...prev, ...newStudents]);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAllData = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les élèves ?')) {
      setStudents([]);
    }
  };

  const toggleDocumentStatus = (studentId: string, docId: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          documents: student.documents?.map(doc =>
            doc.id === docId
              ? {
                  ...doc,
                  status: doc.status === 'pending' ? 'submitted' : 'pending',
                  submittedAt: doc.status === 'pending' ? new Date() : undefined
                }
              : doc
          )
        };
      }
      return student;
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1.5rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1e293b',
          margin: '0 0 0.5rem 0'
        }}>
          Suivi Administratif
        </h1>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '1rem'
        }}>
          Gérez les documents et tâches de votre classe
        </p>
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalStudents}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Élèves</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.submittedDocs}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Rendus</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingDocs}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>En attente</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{completionPercentage}%</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Complétion</div>
          </div>
        </div>
      )}

      <div style={{ padding: '2rem' }}>
        {students.length === 0 ? (
          // Section d'import
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '0.5rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              🚀 Commencez par importer votre classe
            </h3>
            <p style={{
              color: '#64748b',
              marginBottom: '2rem'
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
                padding: '1rem',
                border: '2px dashed #cbd5e1',
                borderRadius: '0.5rem',
                background: '#f8fafc',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            />
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f1f5f9',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#475569'
            }}>
              <strong>Format CSV requis :</strong> Nom, Prénom, Sexe, Classe
            </div>
          </div>
        ) : (
          // Interface principale avec cartes d'élèves
          <div>
            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1rem', fontWeight: '500', color: '#374151' }}>
                  {stats.totalStudents} élèves
                </span>
                <span style={{ fontSize: '1rem', fontWeight: '500', color: '#374151' }}>
                  {completionPercentage}% complétion
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv';
                    input.onchange = (e) => handleFileUpload(e as any);
                    input.click();
                  }}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  📁 Importer plus
                </button>
                <button
                  onClick={clearAllData}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Tout supprimer
                </button>
              </div>
            </div>

            {/* Grille des élèves - Style exact de votre image */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {students.map((student) => {
                const completedDocs = student.documents?.filter(doc => doc.status === 'submitted').length || 0;
                const totalDocs = student.documents?.length || 0;
                const studentCompletion = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

                return (
                  <div
                    key={student.id}
                    style={{
                      background: 'white',
                      border: `2px solid ${studentCompletion === 100 ? '#10b981' : studentCompletion > 0 ? '#f59e0b' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      position: 'relative'
                    }}
                  >
                    {/* Header de la carte */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          {student.gender === 'M' ? '👨' : '👩'} {student.firstName}
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {student.lastName}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          {student.class}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: studentCompletion === 100 ? '#10b981' : studentCompletion > 0 ? '#f59e0b' : '#6b7280'
                      }}>
                        {studentCompletion}%
                      </div>
                    </div>

                    {/* Section Documents */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Documents
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: completedDocs > 0 ? '#10b981' : '#e5e7eb'
                        }}></span>
                        Tâches
                        <span style={{ marginLeft: 'auto' }}>
                          {completedDocs}/{totalDocs}
                        </span>
                      </div>
                    </div>

                    {/* Section Tâches avec boutons */}
                    <div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Tâches
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '0.25rem'
                      }}>
                        {student.documents?.map((doc, index) => (
                          <button
                            key={doc.id}
                            onClick={() => toggleDocumentStatus(student.id, doc.id)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: 'none',
                              background: doc.status === 'submitted' ? '#10b981' : '#e5e7eb',
                              color: doc.status === 'submitted' ? 'white' : '#6b7280',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (doc.status === 'pending') {
                                e.currentTarget.style.background = '#d1d5db';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (doc.status === 'pending') {
                                e.currentTarget.style.background = '#e5e7eb';
                              }
                            }}
                          >
                            {doc.status === 'submitted' ? '✓' : index + 1}
                          </button>
                        ))}
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginLeft: '0.5rem',
                          alignSelf: 'center'
                        }}>
                          {completedDocs}/{totalDocs}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
