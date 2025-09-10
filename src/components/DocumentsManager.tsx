"use client";

import { useState, useMemo } from 'react';
import { usePeriods } from '../contexts/PeriodsContext';
import UnifiedPeriodManager from './UnifiedPeriodManager';

interface DocumentType {
  id: string;
  name: string;
  description?: string;
  category?: string;
  required?: boolean;
}

interface DocumentsManagerProps {
  embedded?: boolean;
  showPeriodManager?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function DocumentsManager({ 
  embedded = false,
  showPeriodManager = true,
  className = '',
  style = {}
}: DocumentsManagerProps) {
  const { state, selectPeriode, refreshData } = usePeriods();
  const { selectedPeriode, documentTypes, loading, error } = state;
  
  const [newDocName, setNewDocName] = useState('');
  const [editingDoc, setEditingDoc] = useState<{id: string, name: string} | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<{id: string, name: string} | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Filtrer les documents de la période sélectionnée
  const periodeDocuments = useMemo(() => {
    if (!selectedPeriode) return [];
    return (selectedPeriode.documentTypes || []).map((pd: any) => ({
      id: pd.documentTypeId,
      name: pd.documentType?.name || 'Document sans nom',
      description: pd.documentType?.description,
      category: pd.documentType?.category,
      required: pd.required || false
    }));
  }, [selectedPeriode]);

  const periodeDocIds = useMemo(() => 
    new Set(periodeDocuments.map(d => d.id)), 
    [periodeDocuments]
  );

  const availableDocuments = useMemo(() => 
    documentTypes.filter((doc: any) => !periodeDocIds.has(doc.id)),
    [documentTypes, periodeDocIds]
  );

  const createDocument = async () => {
    if (!newDocName.trim()) return;
    
    try {
      setLocalLoading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newDocName.trim(),
          description: '',
          category: 'general'
        })
      });
      
      if (response.ok) {
        setNewDocName('');
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la création du document:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const updateDocument = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
    }
  };

  const addDocumentToPeriode = async (documentTypeId: string, required: boolean = false) => {
    if (!selectedPeriode) return;
    
    try {
      const response = await fetch(`/api/periodes/${selectedPeriode.id}/document-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentTypeId, required })
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document à la période:', error);
    }
  };

  const removeDocumentFromPeriode = async (documentTypeId: string) => {
    if (!selectedPeriode) return;
    
    try {
      const response = await fetch(`/api/periodes/${selectedPeriode.id}/document-types/${documentTypeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du document de la période:', error);
    }
  };

  const toggleDocumentRequired = async (documentTypeId: string, currentRequired: boolean) => {
    if (!selectedPeriode) return;
    
    try {
      const response = await fetch(`/api/periodes/${selectedPeriode.id}/document-types/${documentTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ required: !currentRequired })
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut requis:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
    if (e.key === 'Escape') {
      setEditingDoc(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'administrative': return '#8b5cf6';
      case 'pedagogique': return '#10b981';
      case 'evaluation': return '#f59e0b';
      case 'communication': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'administrative': return '📋';
      case 'pedagogique': return '📚';
      case 'evaluation': return '📊';
      case 'communication': return '💬';
      default: return '📄';
    }
  };

  if (error) {
    return (
      <div style={{
        padding: 20,
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 8,
        color: '#dc2626'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>❌ Erreur</h3>
        <p style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* Gestionnaire de périodes */}
      {showPeriodManager && (
        <UnifiedPeriodManager
          selectedPeriode={selectedPeriode}
          onPeriodeSelect={selectPeriode}
          onPeriodeChange={refreshData}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Gestion des documents */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16
      }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 16,
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📄 Gestion des Documents
          {(loading || localLoading) && (
            <span style={{ fontSize: 12, color: '#6b7280' }}>Chargement...</span>
          )}
        </h2>

        {/* Création rapide de document */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="Nom du document (ex: Bulletin de notes)"
            style={{
              flex: 1,
              height: 36,
              padding: '0 10px',
              border: '2px solid #d1d5db',
              borderRadius: 6,
              outline: 'none',
              fontSize: 14
            }}
            onKeyDown={(e) => handleKeyDown(e, createDocument)}
          />
          <button
            onClick={createDocument}
            disabled={!newDocName.trim() || localLoading}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '2px solid #8b5cf6',
              background: newDocName.trim() && !localLoading ? '#8b5cf6' : '#d1d5db',
              color: '#fff',
              fontWeight: 600,
              cursor: newDocName.trim() && !localLoading ? 'pointer' : 'not-allowed',
              fontSize: 14
            }}
          >
            ➕ Créer
          </button>
        </div>

        {selectedPeriode ? (
          <>
            {/* Documents de la période sélectionnée */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                📋 Documents de la période "{selectedPeriode.name}"
                <span style={{
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {periodeDocuments.length}
                </span>
              </h3>
              
              {periodeDocuments.length === 0 ? (
                <div style={{
                  padding: 20,
                  textAlign: 'center',
                  color: '#6b7280',
                  background: '#f8fafc',
                  border: '2px dashed #e2e8f0',
                  borderRadius: 8
                }}>
                  Aucun document assigné à cette période
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {periodeDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        padding: '12px 16px',
                        background: '#fff',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {editingDoc?.id === doc.id ? (
                        <div style={{ display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
                          <input
                            value={editingDoc?.name || ''}
                            onChange={(e) => editingDoc && setEditingDoc({...editingDoc, name: e.target.value})}
                            style={{
                              flex: 1,
                              height: 32,
                              padding: '0 8px',
                              border: '2px solid #8b5cf6',
                              borderRadius: 6,
                              outline: 'none',
                              fontSize: 14
                            }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingDoc?.name?.trim() && editingDoc.name.trim() !== doc.name) {
                                  updateDocument(doc.id, editingDoc.name);
                                }
                                setEditingDoc(null);
                              }
                              if (e.key === 'Escape') setEditingDoc(null);
                            }}
                          />
                          <button
                            onClick={() => {
                              if (editingDoc.name.trim() && editingDoc.name.trim() !== doc.name) {
                                updateDocument(doc.id, editingDoc.name);
                              }
                              setEditingDoc(null);
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '2px solid #10b981',
                              background: '#10b981',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingDoc(null)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '2px solid #6b7280',
                              background: '#6b7280',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: 12
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <span style={{ fontSize: 16 }}>{getCategoryIcon(doc.category || 'general')}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}>
                                {doc.name}
                                {doc.required && (
                                  <span style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    padding: '1px 6px',
                                    borderRadius: 8,
                                    fontSize: 10,
                                    fontWeight: 600
                                  }}>
                                    REQUIS
                                  </span>
                                )}
                              </div>
                              {doc.description && (
                                <div style={{
                                  fontSize: 12,
                                  color: '#6b7280',
                                  marginTop: 2
                                }}>
                                  {doc.description}
                                </div>
                              )}
                            </div>
                            <div style={{
                              padding: '2px 8px',
                              borderRadius: 12,
                              background: getCategoryColor(doc.category || 'general'),
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {doc.category || 'general'}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => toggleDocumentRequired(doc.id, doc.required)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: `2px solid ${doc.required ? '#ef4444' : '#10b981'}`,
                                background: doc.required ? '#ef4444' : '#10b981',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title={doc.required ? 'Marquer comme optionnel' : 'Marquer comme requis'}
                            >
                              {doc.required ? '❗' : '✅'}
                            </button>
                            <button
                              onClick={() => setEditingDoc({id: doc.id, name: doc.name})}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '2px solid #f59e0b',
                                background: '#f59e0b',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => removeDocumentFromPeriode(doc.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '2px solid #ef4444',
                                background: '#ef4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Retirer de la période"
                            >
                              ➖
                            </button>
                            <button
                              onClick={() => setDeletingDoc({id: doc.id, name: doc.name})}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '2px solid #dc2626',
                                background: '#dc2626',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Supprimer définitivement"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents disponibles à ajouter */}
            {availableDocuments.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  ➕ Documents disponibles
                  <span style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    {availableDocuments.length}
                  </span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {availableDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        padding: '8px 12px',
                        background: '#f8fafc'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flex: 1
                      }}>
                        <span style={{ fontSize: 14 }}>{getCategoryIcon(doc.category)}</span>
                        <span style={{
                          fontSize: 14,
                          color: '#374151'
                        }}>
                          {doc.name}
                        </span>
                        <div style={{
                          padding: '1px 6px',
                          borderRadius: 8,
                          background: getCategoryColor(doc.category),
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {doc.category}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => addDocumentToPeriode(doc.id, false)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '2px solid #10b981',
                            background: '#10b981',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                          title="Ajouter comme optionnel"
                        >
                          ➕
                        </button>
                        <button
                          onClick={() => addDocumentToPeriode(doc.id, true)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '2px solid #ef4444',
                            background: '#ef4444',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                          title="Ajouter comme requis"
                        >
                          ❗➕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{
            padding: 20,
            textAlign: 'center',
            color: '#6b7280',
            background: '#f8fafc',
            border: '2px dashed #e2e8f0',
            borderRadius: 8
          }}>
            Sélectionnez une période pour gérer les documents
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {deletingDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 18 }}>
              🗑️ Confirmer la suppression
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: 14 }}>
              Êtes-vous sûr de vouloir supprimer définitivement le document <strong>"{deletingDoc.name}"</strong> ?
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeletingDoc(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '2px solid #6b7280',
                  background: '#fff',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteDocument(deletingDoc.id);
                  setDeletingDoc(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '2px solid #ef4444',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}