"use client";

import { useState, useEffect, useMemo } from 'react';
import { usePeriods } from '../contexts/PeriodsContext';
import UnifiedPeriodManager from './UnifiedPeriodManager';

interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
}

interface TasksManagerProps {
  embedded?: boolean;
  showPeriodManager?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function TasksManager({ 
  embedded = false,
  showPeriodManager = true,
  className = '',
  style = {}
}: TasksManagerProps) {
  const { state, selectPeriode, createPeriode, updatePeriode, deletePeriode, refreshData } = usePeriods();
  const { selectedPeriode, tasks, loading, error } = state;
  
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTask, setEditingTask] = useState<{id: string, name: string} | null>(null);
  const [deletingTask, setDeletingTask] = useState<{id: string, name: string} | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Filtrer les tâches de la période sélectionnée
  const periodeTasks = useMemo(() => {
    if (!selectedPeriode) return [];
    return (selectedPeriode.tasks || []).map((pt: any) => ({
      id: pt.taskId,
      name: pt.task?.name || 'Tâche sans nom',
      description: pt.task?.description,
      dueDate: pt.task?.dueDate,
      priority: pt.task?.priority || 'medium',
      status: pt.task?.status || 'pending'
    }));
  }, [selectedPeriode]);

  const periodeTaskIds = useMemo(() => 
    new Set(periodeTasks.map(t => t.id)), 
    [periodeTasks]
  );

  const availableTasks = useMemo(() => 
    tasks.filter((task: any) => !periodeTaskIds.has(task.id)),
    [tasks, periodeTaskIds]
  );

  const createTask = async () => {
    if (!newTaskName.trim()) return;
    
    try {
      setLocalLoading(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newTaskName.trim(),
          description: '',
          priority: 'medium',
          status: 'pending'
        })
      });
      
      if (response.ok) {
        setNewTaskName('');
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const updateTask = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  const addTaskToPeriode = async (taskId: string) => {
    if (!selectedPeriode) return;
    
    try {
      const response = await fetch(`/api/periodes/${selectedPeriode.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche à la période:', error);
    }
  };

  const removeTaskFromPeriode = async (taskId: string) => {
    if (!selectedPeriode) return;
    
    try {
      const response = await fetch(`/api/periodes/${selectedPeriode.id}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche de la période:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
    if (e.key === 'Escape') {
      setEditingTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⏳';
      default: return '📝';
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

      {/* Gestion des tâches */}
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
          ✅ Gestion des Tâches
          {(loading || localLoading) && (
            <span style={{ fontSize: 12, color: '#6b7280' }}>Chargement...</span>
          )}
        </h2>

        {/* Création rapide de tâche */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Nom de la tâche (ex: Devoir de mathématiques)"
            style={{
              flex: 1,
              height: 36,
              padding: '0 10px',
              border: '2px solid #d1d5db',
              borderRadius: 6,
              outline: 'none',
              fontSize: 14
            }}
            onKeyDown={(e) => handleKeyDown(e, createTask)}
          />
          <button
            onClick={createTask}
            disabled={!newTaskName.trim() || localLoading}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '2px solid #10b981',
              background: newTaskName.trim() && !localLoading ? '#10b981' : '#d1d5db',
              color: '#fff',
              fontWeight: 600,
              cursor: newTaskName.trim() && !localLoading ? 'pointer' : 'not-allowed',
              fontSize: 14
            }}
          >
            ➕ Créer
          </button>
        </div>

        {selectedPeriode ? (
          <>
            {/* Tâches de la période sélectionnée */}
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
                📋 Tâches de la période "{selectedPeriode.name}"
                <span style={{
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {periodeTasks.length}
                </span>
              </h3>
              
              {periodeTasks.length === 0 ? (
                <div style={{
                  padding: 20,
                  textAlign: 'center',
                  color: '#6b7280',
                  background: '#f8fafc',
                  border: '2px dashed #e2e8f0',
                  borderRadius: 8
                }}>
                  Aucune tâche assignée à cette période
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {periodeTasks.map((task) => (
                    <div
                      key={task.id}
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
                      {editingTask?.id === task.id ? (
                        <div style={{ display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
                          <input
                            value={editingTask.name}
                            onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                            style={{
                              flex: 1,
                              height: 32,
                              padding: '0 8px',
                              border: '2px solid #10b981',
                              borderRadius: 6,
                              outline: 'none',
                              fontSize: 14
                            }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingTask.name.trim() && editingTask.name.trim() !== task.name) {
                                  updateTask(task.id, editingTask.name);
                                }
                                setEditingTask(null);
                              }
                              if (e.key === 'Escape') setEditingTask(null);
                            }}
                          />
                          <button
                            onClick={() => {
                              if (editingTask.name.trim() && editingTask.name.trim() !== task.name) {
                                updateTask(task.id, editingTask.name);
                              }
                              setEditingTask(null);
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
                            onClick={() => setEditingTask(null)}
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
                            <span style={{ fontSize: 16 }}>{getStatusIcon(task.status)}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151'
                              }}>
                                {task.name}
                              </div>
                              {task.description && (
                                <div style={{
                                  fontSize: 12,
                                  color: '#6b7280',
                                  marginTop: 2
                                }}>
                                  {task.description}
                                </div>
                              )}
                            </div>
                            <div style={{
                              padding: '2px 8px',
                              borderRadius: 12,
                              background: getPriorityColor(task.priority),
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {task.priority}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => setEditingTask({id: task.id, name: task.name})}
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
                              onClick={() => removeTaskFromPeriode(task.id)}
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
                              onClick={() => setDeletingTask({id: task.id, name: task.name})}
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

            {/* Tâches disponibles à ajouter */}
            {availableTasks.length > 0 && (
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
                  ➕ Tâches disponibles
                  <span style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    {availableTasks.length}
                  </span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {availableTasks.map((task: any) => (
                    <div
                      key={task.id}
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
                        <span style={{ fontSize: 14 }}>{getStatusIcon(task.status)}</span>
                        <span style={{
                          fontSize: 14,
                          color: '#374151'
                        }}>
                          {task.name}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => addTaskToPeriode(task.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '2px solid #10b981',
                          background: '#10b981',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                        title="Ajouter à la période"
                      >
                        ➕
                      </button>
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
            Sélectionnez une période pour gérer les tâches
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {deletingTask && (
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
              Êtes-vous sûr de vouloir supprimer définitivement la tâche <strong>"{deletingTask.name}"</strong> ?
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeletingTask(null)}
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
                  deleteTask(deletingTask.id);
                  setDeletingTask(null);
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