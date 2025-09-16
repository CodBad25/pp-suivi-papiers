"use client";

import React, { useState } from 'react';

// Simulation d'un document
interface Document {
  id: string;
  name: string;
  status: 'pending' | 'submitted';
}

const DemoButtons = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Fiche de renseignements', status: 'pending' },
    { id: '2', name: 'Assurance scolaire', status: 'submitted' },
    { id: '3', name: 'Autorisation photo', status: 'pending' },
    { id: '4', name: 'Règlement intérieur', status: 'submitted' },
    { id: '5', name: 'Demande de bourse', status: 'pending' }
  ]);

  const toggleDocumentStatus = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, status: doc.status === 'pending' ? 'submitted' : 'pending' }
        : doc
    ));
  };

  const completedCount = documents.filter(doc => doc.status === 'submitted').length;
  const totalCount = documents.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#1e293b'
        }}>
          🎯 Interface Améliorée - Gestion des Documents
        </h1>

        {/* Statistiques */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: percentage === 100 ? '#10b981' : percentage > 0 ? '#f59e0b' : '#6b7280',
            marginBottom: '0.5rem'
          }}>
            {percentage}%
          </div>
          <div style={{
            fontSize: '1.125rem',
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            Complétion des documents ({completedCount}/{totalCount})
          </div>
          
          {/* Barre de progression visuelle */}
          <div style={{
            width: '100%',
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              background: percentage === 100 ? '#10b981' : percentage > 0 ? '#f59e0b' : '#6b7280',
              borderRadius: '6px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>

          {/* Icônes de statut rapide */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {documents.map((doc, index) => (
              <button
                key={doc.id}
                onClick={() => toggleDocumentStatus(doc.id)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: doc.status === 'submitted' ? '#10b981' : '#e5e7eb',
                  color: doc.status === 'submitted' ? 'white' : '#6b7280',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  if (doc.status === 'pending') {
                    e.currentTarget.style.background = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  if (doc.status === 'pending') {
                    e.currentTarget.style.background = '#e5e7eb';
                  }
                }}
                title={`${doc.name}: ${doc.status === 'submitted' ? 'Rendu' : 'En attente'}`}
              >
                {doc.status === 'submitted' ? '✓' : index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Liste détaillée des documents */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Documents administratifs
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${doc.status === 'submitted' ? '#bbf7d0' : '#e5e7eb'}`,
                  background: doc.status === 'submitted' ? '#f0fdf4' : 'white',
                  transition: 'all 0.3s ease'
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
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: doc.status === 'submitted' ? '#10b981' : '#d1d5db'
                    }}></div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '1rem' }}>
                        {doc.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: doc.status === 'submitted' ? '#15803d' : '#6b7280'
                      }}>
                        {doc.status === 'submitted' ? '✅ Document rendu' : '⏳ En attente'}
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action améliorés */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {doc.status === 'submitted' ? (
                      <>
                        <button
                          onClick={() => toggleDocumentStatus(doc.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #ef4444',
                            background: 'white',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                        >
                          ❌ Annuler
                        </button>
                        <div style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          background: '#10b981',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ✅ Rendu
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => toggleDocumentStatus(doc.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #10b981',
                          background: 'white',
                          color: '#10b981',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#10b981';
                        }}
                      >
                        ✅ Marquer comme rendu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoButtons;
