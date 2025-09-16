"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation';

export default function TasksPage() {
  const [periodes, setPeriodes] = useState<any[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<any | null>(null);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [editingTask, setEditingTask] = useState<{id: string, name: string} | null>(null);
  const [deletingTask, setDeletingTask] = useState<{id: string, name: string} | null>(null);
  const [name, setName] = useState("");
  const [editingPeriode, setEditingPeriode] = useState<{id: string, name: string} | null>(null);
  const [deletingPeriode, setDeletingPeriode] = useState<{id: string, name: string} | null>(null);
  const router = useRouter();

  useEffect(() => { reload(); }, []);

  const reload = async () => {
    try {
      const [p, tt] = await Promise.all([
        fetch('/api/periodes').then(r=>r.ok?r.json():[]).catch(()=>[]),
        fetch('/api/task-types').then(r=>r.ok?r.json():[]).catch(()=>[]),
      ]);
      const P = Array.isArray(p)?p:[];
      const TT = Array.isArray(tt)?tt:[];
      setPeriodes(P);
      setTaskTypes(TT);
      if (!selectedPeriode && P.length>0) setSelectedPeriode(P[0]);
    } catch (e) {
      setPeriodes([]); setTaskTypes([]);
    }
  };

  const periodeTaskIds = useMemo(()=> new Set((selectedPeriode?.taskTypes||[]).map((x:any)=>x.taskTypeId)), [selectedPeriode]);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      {/* En-tête avec navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1f2937' }}>✅ Gestion des Tâches</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => router.push('/documents')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              border: '2px solid #8b5cf6', 
              background: '#fff', 
              color: '#8b5cf6',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📄 Gérer les Documents
          </button>
          <button 
            onClick={() => router.push('/')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              border: '2px solid #6b7280', 
              background: '#6b7280', 
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🏠 Retour Accueil
          </button>
        </div>
      </div>

      {/* Gestion des périodes */}
      <div style={{ marginBottom: 20, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Gestion des Périodes</h2>
        
        {/* Création rapide de période */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input 
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
            placeholder="Nom de la période (ex: Rentrée)" 
            style={{ flex: 1, height: 36, padding: '0 10px', border: '2px solid #d1d5db', borderRadius: 6 }} 
          />
          <button 
            onClick={async()=>{
              if(!name.trim()) return; 
              const res = await fetch('/api/periodes',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:name.trim()})});
              if(res.ok){ setName(''); await reload(); }
            }} 
            style={{ padding: '8px 12px', borderRadius: 6, border: '2px solid #3b82f6', background:'#3b82f6', color:'#fff', fontWeight:600 }}
          >
            Créer
          </button>
        </div>

        {/* Liste des périodes avec édition */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {periodes.map((p:any)=> (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #e5e7eb', borderRadius:6, padding:'8px 12px', background: selectedPeriode?.id===p.id?'#eff6ff':'#fff' }}>
              {editingPeriode?.id === p.id && editingPeriode ? (
                <div style={{ display:'flex', flex:1, gap:8, alignItems:'center' }}>
                  <input 
                    value={editingPeriode.name} 
                    onChange={(e)=>setEditingPeriode({...editingPeriode, name:e.target.value})} 
                    style={{ flex:1, height:32, padding:'0 8px', border:'2px solid #3b82f6', borderRadius:6, outline:'none' }}
                    autoFocus
                    onKeyDown={(e)=>{
                      if(e.key==='Enter'){
                        if(editingPeriode.name.trim() && editingPeriode.name.trim() !== p.name){
                          fetch(`/api/periodes/${p.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingPeriode.name.trim()})}).then(()=>reload());
                        }
                        setEditingPeriode(null);
                      }
                      if(e.key==='Escape') setEditingPeriode(null);
                    }}
                  />
                  <button 
                    onClick={()=>{
                      if(editingPeriode.name.trim() && editingPeriode.name.trim() !== p.name){
                        fetch(`/api/periodes/${p.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingPeriode.name.trim()})}).then(()=>reload());
                      }
                      setEditingPeriode(null);
                    }} 
                    style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #10b981', background:'#10b981', color:'#fff' }}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={()=>setEditingPeriode(null)} 
                    style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #6b7280', background:'#6b7280', color:'#fff' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={()=>setSelectedPeriode(p)} 
                    style={{ 
                      background: selectedPeriode?.id===p.id ? '#3b82f6' : '#f8fafc', 
                      border: `2px solid ${selectedPeriode?.id===p.id ? '#3b82f6' : '#e2e8f0'}`, 
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14, 
                      fontWeight: selectedPeriode?.id===p.id ? 600 : 500, 
                      color: selectedPeriode?.id===p.id ? '#fff' : '#374151', 
                      cursor: 'pointer', 
                      textAlign: 'left', 
                      flex: 1,
                      transition: 'all 0.2s ease',
                      boxShadow: selectedPeriode?.id===p.id ? '0 2px 4px rgba(59, 130, 246, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPeriode?.id !== p.id) {
                        (e.target as HTMLElement).style.background = '#e2e8f0';
                        (e.target as HTMLElement).style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPeriode?.id !== p.id) {
                        (e.target as HTMLElement).style.background = '#f8fafc';
                        (e.target as HTMLElement).style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    📅 {p.name}
                  </button>
                  <div style={{ display:'flex', gap:4 }}>
                    <button 
                      onClick={()=>setEditingPeriode({id:p.id, name:p.name})} 
                      style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #f59e0b', background:'#f59e0b', color:'#fff', fontSize:12 }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={()=>setDeletingPeriode({id:p.id, name:p.name})} 
                      style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #ef4444', background:'#ef4444', color:'#fff', fontSize:12 }}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sélection de période */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Sélectionner une période</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {periodes.map((p: any) => (
            <button 
              key={p.id} 
              onClick={() => setSelectedPeriode(p)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 6, 
                border: `2px solid ${selectedPeriode?.id === p.id ? '#3b82f6' : '#d1d5db'}`, 
                background: selectedPeriode?.id === p.id ? '#eff6ff' : '#fff',
                color: selectedPeriode?.id === p.id ? '#3b82f6' : '#374151',
                fontWeight: selectedPeriode?.id === p.id ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {selectedPeriode && (
        <div style={{ background: '#fff', border: '2px solid #3b82f6', borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 600, color: '#1f2937' }}>Tâches pour la période "{selectedPeriode.name}"</h3>
          
          {/* Ajouter une nouvelle tâche */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
            <input 
              value={newTaskName} 
              onChange={(e) => setNewTaskName(e.target.value)} 
              placeholder="Nom de la nouvelle tâche" 
              style={{ 
                flex: 1, 
                height: 40, 
                padding: '0 12px', 
                border: '2px solid #d1d5db', 
                borderRadius: 6,
                fontSize: 14
              }} 
            />
            <button 
              onClick={async () => {
                if (!newTaskName.trim()) return;
                const res = await fetch('/api/task-types', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newTaskName.trim() })
                });
                if (res.ok) {
                  setNewTaskName('');
                  await reload();
                }
              }} 
              style={{ 
                padding: '8px 16px', 
                borderRadius: 6, 
                border: '2px solid #10b981', 
                background: '#10b981', 
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ➕ Ajouter
            </button>
          </div>

          {/* Liste des tâches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {taskTypes.map((t: any) => {
              const inP = periodeTaskIds.has(t.id);
              return (
                <div key={t.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8, 
                  padding: '12px 16px',
                  background: inP ? '#f0f9ff' : '#fff'
                }}>
                  {editingTask?.id === t.id && editingTask ? (
                    <div style={{ display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
                      <input 
                        value={editingTask.name} 
                        onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })} 
                        style={{ 
                          flex: 1, 
                          height: 36, 
                          padding: '0 12px', 
                          border: '2px solid #3b82f6', 
                          borderRadius: 6, 
                          outline: 'none'
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingTask.name.trim() && editingTask.name.trim() !== t.name) {
                              fetch(`/api/tasks/${t.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: editingTask.name.trim() })
                              }).then(() => reload());
                            }
                            setEditingTask(null);
                          }
                          if (e.key === 'Escape') setEditingTask(null);
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (editingTask.name.trim() && editingTask.name.trim() !== t.name) {
                            fetch(`/api/tasks/${t.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: editingTask.name.trim() })
                            }).then(() => reload());
                          }
                          setEditingTask(null);
                        }} 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: 6, 
                          border: '2px solid #10b981', 
                          background: '#10b981', 
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => setEditingTask(null)} 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: 6, 
                          border: '2px solid #6b7280', 
                          background: '#6b7280', 
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 16, fontWeight: inP ? 600 : 400, color: inP ? '#1f2937' : '#6b7280' }}>
                        {inP ? '✅' : '⭕'} {t.name}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={async () => {
                            if (!inP) {
                              await fetch(`/api/periodes/${selectedPeriode.id}/task-types`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ taskTypeId: t.id })
                              });
                            } else {
                              await fetch(`/api/periodes/${selectedPeriode.id}/task-types?taskTypeId=${t.id}`, {
                                method: 'DELETE'
                              });
                            }
                            const p = await fetch(`/api/periodes/${selectedPeriode.id}`).then(r => r.json());
                            setSelectedPeriode(p);
                            await reload();
                          }} 
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: 6, 
                            border: `2px solid ${inP ? '#ef4444' : '#3b82f6'}`, 
                            background: inP ? '#fff' : '#3b82f6', 
                            color: inP ? '#ef4444' : '#fff',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {inP ? '➖ Retirer' : '➕ Ajouter'}
                        </button>
                        <button 
                          onClick={() => setEditingTask({ id: t.id, name: t.name })} 
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: 6, 
                            border: '2px solid #f59e0b', 
                            background: '#f59e0b', 
                            color: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        {deletingTask?.id === t.id ? (
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Supprimer "{t.name}" ?</span>
                            <button 
                              onClick={async () => {
                                await fetch(`/api/tasks/${t.id}`, { method: 'DELETE' });
                                setDeletingTask(null);
                                await reload();
                              }} 
                              style={{ 
                                padding: '4px 8px', 
                                borderRadius: 4, 
                                border: '2px solid #ef4444', 
                                background: '#ef4444', 
                                color: '#fff', 
                                fontSize: 12,
                                cursor: 'pointer'
                              }}
                            >
                              Oui
                            </button>
                            <button 
                              onClick={() => setDeletingTask(null)} 
                              style={{ 
                                padding: '4px 8px', 
                                borderRadius: 4, 
                                border: '2px solid #6b7280', 
                                background: '#6b7280', 
                                color: '#fff', 
                                fontSize: 12,
                                cursor: 'pointer'
                              }}
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeletingTask({ id: t.id, name: t.name })} 
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: 6, 
                              border: '2px solid #ef4444', 
                              background: '#ef4444', 
                              color: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de suppression de période */}
      {deletingPeriode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 400, width: '90%' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Confirmer la suppression</h3>
            <p style={{ marginBottom: 20, color: '#6b7280' }}>Êtes-vous sûr de vouloir supprimer la période "{deletingPeriode.name}" ? Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDeletingPeriode(null)} 
                style={{ padding: '8px 16px', borderRadius: 6, border: '2px solid #6b7280', background: '#fff', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={async () => {
                  const res = await fetch(`/api/periodes/${deletingPeriode.id}`, { method: 'DELETE' });
                  if (res.ok) {
                    setDeletingPeriode(null);
                    await reload();
                  }
                }} 
                style={{ padding: '8px 16px', borderRadius: 6, border: '2px solid #ef4444', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
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