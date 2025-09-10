"use client";

import { useState, useEffect } from 'react';

interface DocumentType {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
}

interface TaskType {
  id: string;
  name: string;
  description?: string;
}

interface Period {
  id: string;
  name: string;
  documentTypes?: { documentTypeId: string; documentType: DocumentType }[];
  taskTypes?: { taskTypeId: string; taskType: TaskType }[];
}

export default function ManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'documents' | 'tasks' | 'periods'>('documents');
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les formulaires
  const [newDocName, setNewDocName] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocDueDate, setNewDocDueDate] = useState('');
  
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const [newPeriodName, setNewPeriodName] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // États pour l'édition
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocDescription, setEditDocDescription] = useState('');
  const [editDocDueDate, setEditDocDueDate] = useState('');
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');

  // Chargement des données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, tasksRes, periodsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/task-types'),
        fetch('/api/periodes')
      ]);
      
      const docsData = docsRes.ok ? await docsRes.json() : [];
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];
      const periodsData = periodsRes.ok ? await periodsRes.json() : [];
      
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setPeriods(Array.isArray(periodsData) ? periodsData : []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Création de document
  const createDocument = async () => {
    if (!newDocName.trim()) return;
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDocName.trim(),
          description: newDocDescription.trim() || undefined,
          dueDate: newDocDueDate || undefined
        })
      });
      
      if (response.ok) {
        setNewDocName('');
        setNewDocDescription('');
        setNewDocDueDate('');
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la création du document:', error);
    }
  };

  // Suppression de document
  const deleteDocument = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Édition de document
  const startEditDocument = (doc: DocumentType) => {
    setEditingDoc(doc.id);
    setEditDocName(doc.name);
    setEditDocDescription(doc.description || '');
    setEditDocDueDate(doc.dueDate || '');
  };

  const saveDocumentEdit = async (id: string) => {
    if (!editDocName.trim()) return;
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editDocName.trim(),
          description: editDocDescription.trim() || undefined,
          dueDate: editDocDueDate || undefined
        })
      });
      
      if (response.ok) {
        setEditingDoc(null);
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const cancelDocumentEdit = () => {
    setEditingDoc(null);
    setEditDocName('');
    setEditDocDescription('');
    setEditDocDueDate('');
  };

  // Création de tâche
  const createTask = async () => {
    if (!newTaskName.trim()) return;
    
    try {
      const response = await fetch('/api/task-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTaskName.trim(),
          description: newTaskDescription.trim() || undefined
        })
      });
      
      if (response.ok) {
        setNewTaskName('');
        setNewTaskDescription('');
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };

  // Suppression de tâche
  const deleteTask = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      const response = await fetch(`/api/task-types/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Édition de tâche
  const startEditTask = (task: TaskType) => {
    setEditingTask(task.id);
    setEditTaskName(task.name);
    setEditTaskDescription(task.description || '');
  };

  const saveTaskEdit = async (id: string) => {
    if (!editTaskName.trim()) return;
    
    try {
      const response = await fetch(`/api/task-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTaskName.trim(),
          description: editTaskDescription.trim() || undefined
        })
      });
      
      if (response.ok) {
        setEditingTask(null);
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditTaskName('');
    setEditTaskDescription('');
  };

  // Création de période
  const createPeriod = async () => {
    if (!newPeriodName.trim()) return;
    
    try {
      const response = await fetch('/api/periodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPeriodName.trim(),
          documentTypeIds: selectedDocs,
          taskTypeIds: selectedTasks
        })
      });
      
      if (response.ok) {
        setNewPeriodName('');
        setSelectedDocs([]);
        setSelectedTasks([]);
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la période:', error);
    }
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive ? '#3b82f6' : '#f3f4f6',
    color: isActive ? '#fff' : '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s ease'
  });

  const cardStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Onglets */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('documents')}
          style={tabStyle(activeTab === 'documents')}
        >
          📄 Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={tabStyle(activeTab === 'tasks')}
        >
          ✅ Tâches ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('periods')}
          style={tabStyle(activeTab === 'periods')}
        >
          📅 Périodes ({periods.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0 8px 8px 8px',
        padding: '24px',
        minHeight: '500px'
      }}>
        {activeTab === 'documents' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
              📄 Gestion des Documents
            </h2>
            
            {/* Formulaire de création */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                Créer un nouveau document
              </h3>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr auto' }}>
                <input
                  type="text"
                  placeholder="Nom du document"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Description (optionnel)"
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={createDocument}
                  disabled={!newDocName.trim()}
                  style={{
                    padding: '8px 16px',
                    background: newDocName.trim() ? '#10b981' : '#9ca3af',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newDocName.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Créer
                </button>
              </div>
              <div style={{ marginTop: '12px' }}>
                <input
                  type="date"
                  placeholder="Date d'échéance (optionnel)"
                  value={newDocDueDate}
                  onChange={(e) => setNewDocDueDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    width: '200px'
                  }}
                />
              </div>
            </div>

            {/* Liste des documents */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                Documents existants ({documents.length})
              </h3>
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Aucun document créé pour le moment
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} style={{
                    ...cardStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {editingDoc === doc.id ? (
                      // Mode édition
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
                          <input
                            type="text"
                            value={editDocName}
                            onChange={(e) => setEditDocName(e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                            placeholder="Nom du document"
                          />
                          <input
                            type="text"
                            value={editDocDescription}
                            onChange={(e) => setEditDocDescription(e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                            placeholder="Description"
                          />
                        </div>
                        <input
                          type="date"
                          value={editDocDueDate}
                          onChange={(e) => setEditDocDueDate(e.target.value)}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginTop: '8px',
                            width: '150px'
                          }}
                        />
                      </div>
                    ) : (
                      // Mode affichage
                      <div 
                        onDoubleClick={() => startEditDocument(doc)}
                        style={{ 
                          flex: 1, 
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Double-cliquez pour éditer"
                      >
                        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', color: '#374151' }}>
                          {doc.name}
                        </h4>
                        {doc.description && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                            {doc.description}
                          </p>
                        )}
                        {doc.dueDate && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            Échéance: {new Date(doc.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingDoc === doc.id ? (
                        // Boutons d'édition
                        <>
                          <button
                            onClick={() => saveDocumentEdit(doc.id)}
                            disabled={!editDocName.trim()}
                            style={{
                              padding: '6px 12px',
                              background: editDocName.trim() ? '#10b981' : '#9ca3af',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: editDocName.trim() ? 'pointer' : 'not-allowed',
                              fontSize: '12px'
                            }}
                          >
                            ✅ Sauver
                          </button>
                          <button
                            onClick={cancelDocumentEdit}
                            style={{
                              padding: '6px 12px',
                              background: '#6b7280',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ❌ Annuler
                          </button>
                        </>
                      ) : (
                        // Bouton de suppression
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
              ✅ Gestion des Tâches
            </h2>
            
            {/* Formulaire de création */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                Créer une nouvelle tâche
              </h3>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr auto' }}>
                <input
                  type="text"
                  placeholder="Nom de la tâche"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Description (optionnel)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={createTask}
                  disabled={!newTaskName.trim()}
                  style={{
                    padding: '8px 16px',
                    background: newTaskName.trim() ? '#10b981' : '#9ca3af',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: newTaskName.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Créer
                </button>
              </div>
            </div>

            {/* Liste des tâches */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                Tâches existantes ({tasks.length})
              </h3>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Aucune tâche créée pour le moment
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} style={{
                    ...cardStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {editingTask === task.id ? (
                      // Mode édition
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
                          <input
                            type="text"
                            value={editTaskName}
                            onChange={(e) => setEditTaskName(e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                            placeholder="Nom de la tâche"
                          />
                          <input
                            type="text"
                            value={editTaskDescription}
                            onChange={(e) => setEditTaskDescription(e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                            placeholder="Description"
                          />
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div 
                        onDoubleClick={() => startEditTask(task)}
                        style={{ 
                          flex: 1, 
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Double-cliquez pour éditer"
                      >
                        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', color: '#374151' }}>
                          {task.name}
                        </h4>
                        {task.description && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingTask === task.id ? (
                        // Boutons d'édition
                        <>
                          <button
                            onClick={() => saveTaskEdit(task.id)}
                            disabled={!editTaskName.trim()}
                            style={{
                              padding: '6px 12px',
                              background: editTaskName.trim() ? '#10b981' : '#9ca3af',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: editTaskName.trim() ? 'pointer' : 'not-allowed',
                              fontSize: '12px'
                            }}
                          >
                            ✅ Sauver
                          </button>
                          <button
                            onClick={cancelTaskEdit}
                            style={{
                              padding: '6px 12px',
                              background: '#6b7280',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ❌ Annuler
                          </button>
                        </>
                      ) : (
                        // Bouton de suppression
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'periods' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
              📅 Gestion des Périodes
            </h2>
            
            {/* Formulaire de création */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                Créer une nouvelle période
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Nom de la période"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    width: '300px'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                {/* Sélection des documents */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    Documents à inclure:
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px' }}>
                    {documents.map((doc) => (
                      <label key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocs([...selectedDocs, doc.id]);
                            } else {
                              setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                            }
                          }}
                        />
                        <span style={{ fontSize: '14px' }}>{doc.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Sélection des tâches */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    Tâches à inclure:
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px' }}>
                    {tasks.map((task) => (
                      <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                        />
                        <span style={{ fontSize: '14px' }}>{task.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={createPeriod}
                disabled={!newPeriodName.trim()}
                style={{
                  padding: '8px 16px',
                  background: newPeriodName.trim() ? '#10b981' : '#9ca3af',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newPeriodName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Créer la période
              </button>
            </div>

            {/* Liste des périodes */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                Périodes existantes ({periods.length})
              </h3>
              {periods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Aucune période créée pour le moment
                </div>
              ) : (
                periods.map((period) => (
                  <div key={period.id} style={cardStyle}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#374151' }}>
                      {period.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Documents: {period.documentTypes?.length || 0} | Tâches: {period.taskTypes?.length || 0}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}