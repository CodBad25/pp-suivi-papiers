"use client";

import { useState, useEffect } from 'react';

interface Periode {
  id: string;
  name: string;
  documentTypes?: any[];
  tasks?: any[];
}

interface UnifiedPeriodManagerProps {
  selectedPeriode: Periode | null;
  onPeriodeSelect: (periode: Periode) => void;
  onPeriodeChange: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function UnifiedPeriodManager({
  selectedPeriode,
  onPeriodeSelect,
  onPeriodeChange,
  className = '',
  style = {}
}: UnifiedPeriodManagerProps) {
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [name, setName] = useState('');
  const [editingPeriode, setEditingPeriode] = useState<{id: string, name: string} | null>(null);
  const [deletingPeriode, setDeletingPeriode] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPeriodes();
  }, []);

  const loadPeriodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/periodes');
      if (response.ok) {
        const data = await response.json();
        const periodesArray = Array.isArray(data) ? data : [];
        setPeriodes(periodesArray);
        
        // Auto-sélectionner la première période si aucune n'est sélectionnée
        if (!selectedPeriode && periodesArray.length > 0) {
          onPeriodeSelect(periodesArray[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des périodes:', error);
      setPeriodes([]);
    } finally {
      setLoading(false);
    }
  };

  const createPeriode = async () => {
    if (!name.trim()) return;
    
    try {
      const response = await fetch('/api/periodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (response.ok) {
        setName('');
        await loadPeriodes();
        onPeriodeChange();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la période:', error);
    }
  };

  const updatePeriode = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    
    try {
      const response = await fetch(`/api/periodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      
      if (response.ok) {
        await loadPeriodes();
        onPeriodeChange();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la période:', error);
    }
  };

  const deletePeriode = async (id: string) => {
    try {
      const response = await fetch(`/api/periodes/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadPeriodes();
        onPeriodeChange();
        
        // Si la période supprimée était sélectionnée, sélectionner la première disponible
        if (selectedPeriode?.id === id) {
          const remainingPeriodes = periodes.filter(p => p.id !== id);
          if (remainingPeriodes.length > 0) {
            onPeriodeSelect(remainingPeriodes[0]);
          } else {
            onPeriodeSelect(null);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la période:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
    if (e.key === 'Escape') {
      setEditingPeriode(null);
    }
  };

  return (
    <div className={className} style={{ 
      background: '#f9fafb', 
      border: '1px solid #e5e7eb', 
      borderRadius: 8, 
      padding: 16,
      ...style 
    }}>
      <h2 style={{ 
        fontSize: 18, 
        fontWeight: 600, 
        marginBottom: 12, 
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        📅 Gestion des Périodes
        {loading && <span style={{ fontSize: 12, color: '#6b7280' }}>Chargement...</span>}
      </h2>
      
      {/* Création rapide de période */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Nom de la période (ex: Rentrée)" 
          style={{ 
            flex: 1, 
            height: 36, 
            padding: '0 10px', 
            border: '2px solid #d1d5db', 
            borderRadius: 6,
            outline: 'none',
            fontSize: 14
          }}
          onKeyDown={(e) => handleKeyDown(e, createPeriode)}
        />
        <button 
          onClick={createPeriode}
          disabled={!name.trim() || loading}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 6, 
            border: '2px solid #8b5cf6', 
            background: name.trim() && !loading ? '#8b5cf6' : '#d1d5db', 
            color: '#fff', 
            fontWeight: 600,
            cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
            fontSize: 14
          }}
        >
          ➕ Créer
        </button>
      </div>

      {/* Liste des périodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {periodes.map((periode) => (
          <div 
            key={periode.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              border: '1px solid #e5e7eb', 
              borderRadius: 6, 
              padding: '8px 12px', 
              background: selectedPeriode?.id === periode.id ? '#f3e8ff' : '#fff',
              transition: 'all 0.2s ease'
            }}
          >
            {editingPeriode?.id === periode.id ? (
              <div style={{ display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
                <input 
                  value={editingPeriode.name} 
                  onChange={(e) => setEditingPeriode({...editingPeriode, name: e.target.value})} 
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
                      if (editingPeriode.name.trim() && editingPeriode.name.trim() !== periode.name) {
                        updatePeriode(periode.id, editingPeriode.name);
                      }
                      setEditingPeriode(null);
                    }
                    if (e.key === 'Escape') setEditingPeriode(null);
                  }}
                />
                <button 
                  onClick={() => {
                    if (editingPeriode.name.trim() && editingPeriode.name.trim() !== periode.name) {
                      updatePeriode(periode.id, editingPeriode.name);
                    }
                    setEditingPeriode(null);
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
                  onClick={() => setEditingPeriode(null)} 
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
                <button 
                  onClick={() => onPeriodeSelect(periode)} 
                  style={{ 
                    background: selectedPeriode?.id === periode.id ? '#8b5cf6' : '#f8fafc', 
                    border: `2px solid ${selectedPeriode?.id === periode.id ? '#8b5cf6' : '#e2e8f0'}`, 
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14, 
                    fontWeight: selectedPeriode?.id === periode.id ? 600 : 500, 
                    color: selectedPeriode?.id === periode.id ? '#fff' : '#374151', 
                    cursor: 'pointer',
                    flex: 1,
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {periode.name}
                </button>
                
                <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                  <button 
                    onClick={() => setEditingPeriode({id: periode.id, name: periode.name})} 
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
                    onClick={() => setDeletingPeriode({id: periode.id, name: periode.name})} 
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: 6, 
                      border: '2px solid #ef4444', 
                      background: '#ef4444', 
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal de confirmation de suppression */}
      {deletingPeriode && (
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
              Êtes-vous sûr de vouloir supprimer la période <strong>"{deletingPeriode.name}"</strong> ?
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeletingPeriode(null)}
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
                  deletePeriode(deletingPeriode.id);
                  setDeletingPeriode(null);
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