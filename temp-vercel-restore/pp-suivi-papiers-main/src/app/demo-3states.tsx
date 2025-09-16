"use client";

import React, { useState } from 'react';

type DocumentStatus = 'not-submitted' | 'pending' | 'submitted';

interface Document {
  id: string;
  name: string;
  status: DocumentStatus;
}

const Demo3States = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Fiche de renseignements', status: 'not-submitted' },
    { id: '2', name: 'Assurance scolaire', status: 'pending' },
    { id: '3', name: 'Autorisation photo', status: 'submitted' },
    { id: '4', name: 'Règlement intérieur', status: 'not-submitted' },
    { id: '5', name: 'Demande de bourse', status: 'pending' }
  ]);

  const updateDocumentStatus = (docId: string, newStatus: DocumentStatus) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'not-submitted': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'submitted': return '#22c55e';
    }
  };

  const getStatusBg = (status: DocumentStatus) => {
    switch (status) {
      case 'not-submitted': return '#fef2f2';
      case 'pending': return '#fffbeb';
      case 'submitted': return '#f0fdf4';
    }
  };

  const getStatusBorder = (status: DocumentStatus) => {
    switch (status) {
      case 'not-submitted': return '#fca5a5';
      case 'pending': return '#fbbf24';
      case 'submitted': return '#22c55e';
    }
  };

  const ThreeStateButton = ({ status, onChange }: { 
    status: DocumentStatus; 
    onChange: (newStatus: DocumentStatus) => void;
  }) => {
    const handleClick = () => {
      switch (status) {
        case 'not-submitted':
          onChange('pending');
          break;
        case 'pending':
          onChange('submitted');
          break;
        case 'submitted':
          onChange('not-submitted');
          break;
      }
    };

    const getIcon = () => {
      switch (status) {
        case 'not-submitted': return '❌';
        case 'pending': return '⏳';
        case 'submitted': return '✅';
      }
    };

    const getText = () => {
      switch (status) {
        case 'not-submitted': return 'Non rendu';
        case 'pending': return 'En attente';
        case 'submitted': return 'Rendu';
      }
    };

    return (
      <button
        onClick={handleClick}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: `1px solid ${getStatusBorder(status)}`,
          background: getStatusBg(status),
          color: getStatusColor(status),
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        title={`Cliquer pour changer le statut (actuellement: ${getText()})`}
      >
        <span style={{ fontSize: '1rem' }}>{getIcon()}</span>
        <span>{getText()}</span>
      </button>
    );
  };

  const stats = {
    notSubmitted: documents.filter(d => d.status === 'not-submitted').length,
    pending: documents.filter(d => d.status === 'pending').length,
    submitted: documents.filter(d => d.status === 'submitted').length
  };

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
          marginBottom: '1rem',
          textAlign: 'center',
          color: '#1e293b'
        }}>
          🎯 Boutons à 3 États
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#64748b',
          marginBottom: '2rem',
          fontSize: '1.125rem'
        }}>
          Cliquez sur les boutons pour faire défiler les états : ❌ → ⏳ → ✅ → ❌
        </p>

        {/* Statistiques */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '0.5rem' }}>❌</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.notSubmitted}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Non rendus</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>En attente</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{stats.submitted}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Rendus</div>
          </div>
        </div>

        {/* Liste des documents */}
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
            color: '#1e293b'
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
                  border: `2px solid ${getStatusBorder(doc.status)}`,
                  background: getStatusBg(doc.status),
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
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getStatusColor(doc.status)
                    }}></div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '1rem', color: '#1e293b' }}>
                        {doc.name}
                      </div>
                    </div>
                  </div>

                  <ThreeStateButton
                    status={doc.status}
                    onChange={(newStatus) => updateDocumentStatus(doc.id, newStatus)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
            💡 Comment ça marche :
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            <li><strong>❌ Non rendu</strong> → Cliquer pour passer à "En attente"</li>
            <li><strong>⏳ En attente</strong> → Cliquer pour passer à "Rendu"</li>
            <li><strong>✅ Rendu</strong> → Cliquer pour revenir à "Non rendu"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Demo3States;
