"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function PreparePage() {
  const [periodes, setPeriodes] = useState<any[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [editingTask, setEditingTask] = useState<{id: string, name: string} | null>(null);
  const [editingDoc, setEditingDoc] = useState<{id: string, name: string} | null>(null);
  const [editingPeriode, setEditingPeriode] = useState<{id: string, name: string} | null>(null);
  const [deletingPeriode, setDeletingPeriode] = useState<{id: string, name: string} | null>(null);
  const [deletingTask, setDeletingTask] = useState<{id: string, name: string} | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<{id: string, name: string} | null>(null);

  const searchParams = useSearchParams();
  const focus = searchParams.get('focus');

  useEffect(() => { reload(); }, []);

  const reload = async () => {
    try {
      const [p, tt, dt, st] = await Promise.all([
        fetch('/api/periodes').then(r=>r.ok?r.json():[]).catch(()=>[]),
        fetch('/api/task-types').then(r=>r.ok?r.json():[]).catch(()=>[]),
        fetch('/api/documents').then(r=>r.ok?r.json():[]).catch(()=>[]),
        fetch('/api/students').then(r=>r.ok?r.json():[]).catch(()=>[]),
      ]);
      const P = Array.isArray(p)?p:[];
      const TT = Array.isArray(tt)?tt:[];
      const DT = Array.isArray(dt)?dt:[];
      const ST = Array.isArray(st)?st:[];
      setPeriodes(P);
      setTaskTypes(TT);
      setDocumentTypes(DT);
      const cls = Array.from(new Set(ST.map((s:any)=>s.class))).sort();
      setClasses(cls);
      if (!selectedPeriode && P.length>0) setSelectedPeriode(P[0]);
    } catch (e) {
      setPeriodes([]); setTaskTypes([]); setDocumentTypes([]); setClasses([]);
    }
  };

  const periodeTaskIds = useMemo(()=> new Set((selectedPeriode?.taskTypes||[]).map((x:any)=>x.taskTypeId)), [selectedPeriode]);
  const periodeDocIds = useMemo(()=> new Set((selectedPeriode?.documentTypes||[]).map((x:any)=>x.documentTypeId)), [selectedPeriode]);

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Préparer les Périodes</h1>

      {/* Création rapide de période */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nom de la période (ex: Rentrée)" style={{ flex: 1, height: 36, padding: '0 10px', border: '2px solid #d1d5db', borderRadius: 6 }} />
        <button onClick={async()=>{
          if(!name.trim()) return; 
          const res = await fetch('/api/periodes',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:name.trim()})});
          if(res.ok){ setName(''); await reload(); }
        }} style={{ padding: '8px 12px', borderRadius: 6, border: '2px solid #3b82f6', background:'#3b82f6', color:'#fff', fontWeight:600 }}>Créer</button>
      </div>

      {/* Liste des périodes */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: 16 }}>
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
                <button onClick={()=>{
                  if(editingPeriode.name.trim() && editingPeriode.name.trim() !== p.name){
                    fetch(`/api/periodes/${p.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingPeriode.name.trim()})}).then(()=>reload());
                  }
                  setEditingPeriode(null);
                }} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #10b981', background:'#10b981', color:'#fff' }}>✓</button>
                <button onClick={()=>setEditingPeriode(null)} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #6b7280', background:'#6b7280', color:'#fff' }}>✕</button>
              </div>
            ) : (
              <>
                <button onClick={()=>setSelectedPeriode(p)} style={{ background:'none', border:'none', fontSize:16, fontWeight: selectedPeriode?.id===p.id?600:400, color: selectedPeriode?.id===p.id?'#3b82f6':'#374151', cursor:'pointer', textAlign:'left', flex:1 }}>{p.name}</button>
                <div style={{ display:'flex', gap:4 }}>
                  <button onClick={()=>setEditingPeriode({id:p.id, name:p.name})} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #f59e0b', background:'#f59e0b', color:'#fff' }}>✏️</button>
                  {deletingPeriode?.id === p.id ? (
                    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                      <span style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>Supprimer ?</span>
                      <button onClick={async()=>{
                        await fetch(`/api/periodes/${p.id}`, {method:'DELETE'});
                        if(selectedPeriode?.id === p.id) setSelectedPeriode(null);
                        setDeletingPeriode(null);
                        await reload();
                      }} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #ef4444', background:'#ef4444', color:'#fff', fontSize:12 }}>Oui</button>
                      <button onClick={()=>setDeletingPeriode(null)} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #6b7280', background:'#6b7280', color:'#fff', fontSize:12 }}>Non</button>
                    </div>
                  ) : (
                    <button onClick={()=>setDeletingPeriode({id:p.id, name:p.name})} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #ef4444', background:'#ef4444', color:'#fff' }}>🗑️</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {selectedPeriode && (
        <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {/* Tâches */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, outline: focus==='tasks' ? '3px solid #fde68a' : 'none' }}>
            <h3 style={{ marginTop:0, marginBottom:8 }}>Tâches par défaut</h3>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <input value={newTaskName} onChange={(e)=>setNewTaskName(e.target.value)} placeholder="Gérer les tâches" style={{ flex:1, height:32, padding:'0 8px', border:'2px solid #d1d5db', borderRadius:6 }} />
              <button onClick={async()=>{ if(!newTaskName.trim()) return; const res = await fetch('/api/task-types',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:newTaskName.trim()})}); if(res.ok){ setNewTaskName(''); await reload(); } }} style={{ padding:'6px 10px', borderRadius:6, border:'2px solid #10b981', background:'#10b981', color:'#fff' }}>Ajouter</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {taskTypes.map((t:any)=>{
                const inP = periodeTaskIds.has(t.id);
                return (
                  <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #e5e7eb', borderRadius:6, padding:'6px 8px' }}>
                    {editingTask?.id === t.id && editingTask ? (
                      <div style={{ display:'flex', flex:1, gap:8, alignItems:'center' }}>
                        <input 
                          value={editingTask.name} 
                          onChange={(e)=>setEditingTask({...editingTask, name:e.target.value})} 
                          style={{ flex:1, height:32, padding:'0 8px', border:'2px solid #3b82f6', borderRadius:6, outline:'none' }}
                          autoFocus
                          onKeyDown={(e)=>{
                            if(e.key==='Enter'){
                              if(editingTask.name.trim() && editingTask.name.trim() !== t.name){
                                fetch(`/api/tasks/${t.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingTask.name.trim()})}).then(()=>reload());
                              }
                              setEditingTask(null);
                            }
                            if(e.key==='Escape') setEditingTask(null);
                          }}
                        />
                        <button onClick={()=>{
                          if(editingTask.name.trim() && editingTask.name.trim() !== t.name){
                            fetch(`/api/tasks/${t.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingTask.name.trim()})}).then(()=>reload());
                          }
                          setEditingTask(null);
                        }} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #10b981', background:'#10b981', color:'#fff' }}>✓</button>
                        <button onClick={()=>setEditingTask(null)} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #6b7280', background:'#6b7280', color:'#fff' }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div>{t.name}</div>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={async()=>{
                            if(!inP){ await fetch(`/api/periodes/${selectedPeriode.id}/task-types`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({taskTypeId:t.id})}); }
                            else { await fetch(`/api/periodes/${selectedPeriode.id}/task-types?taskTypeId=${t.id}`,{method:'DELETE'}); }
                            const p = await fetch(`/api/periodes/${selectedPeriode.id}`).then(r=>r.json()); setSelectedPeriode(p); await reload();
                          }} style={{ padding:'4px 8px', borderRadius:6, border:`2px solid ${inP?'#ef4444':'#3b82f6'}`, background: inP?'#fff':'#3b82f6', color: inP?'#ef4444':'#fff' }}>{inP?'Retirer':'Ajouter'}</button>
                          <button onClick={()=>setEditingTask({id:t.id, name:t.name})} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #f59e0b', background:'#f59e0b', color:'#fff' }}>✏️</button>
                          {deletingTask?.id === t.id ? (
                            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                              <span style={{ fontSize:12, color:'#ef4444' }}>Supprimer "{t.name}" ?</span>
                              <button onClick={async()=>{
                                await fetch(`/api/tasks/${t.id}`, {method:'DELETE'});
                                setDeletingTask(null);
                                await reload();
                              }} style={{ padding:'2px 6px', borderRadius:4, border:'2px solid #ef4444', background:'#ef4444', color:'#fff', fontSize:12 }}>Oui</button>
                              <button onClick={()=>setDeletingTask(null)} style={{ padding:'2px 6px', borderRadius:4, border:'2px solid #6b7280', background:'#6b7280', color:'#fff', fontSize:12 }}>Non</button>
                            </div>
                          ) : (
                            <button onClick={()=>setDeletingTask({id:t.id, name:t.name})} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #ef4444', background:'#ef4444', color:'#fff' }}>🗑️</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12, outline: focus==='documents' ? '3px solid #fde68a' : 'none' }}>
            <h3 style={{ marginTop:0, marginBottom:8 }}>Documents par défaut</h3>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <input value={newDocName} onChange={(e)=>setNewDocName(e.target.value)} placeholder="Gérer les documents" style={{ flex:1, height:32, padding:'0 8px', border:'2px solid #d1d5db', borderRadius:6 }} />
              <button onClick={async()=>{ if(!newDocName.trim()) return; const res = await fetch('/api/documents',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:newDocName.trim()})}); if(res.ok){ setNewDocName(''); await reload(); } }} style={{ padding:'6px 10px', borderRadius:6, border:'2px solid #10b981', background:'#10b981', color:'#fff' }}>Ajouter</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {documentTypes.map((d:any)=>{
                const inP = periodeDocIds.has(d.id);
                return (
                  <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #e5e7eb', borderRadius:6, padding:'6px 8px' }}>
                    {editingDoc?.id === d.id && editingDoc ? (
                      <div style={{ display:'flex', flex:1, gap:8, alignItems:'center' }}>
                        <input 
                          value={editingDoc.name} 
                          onChange={(e)=>setEditingDoc({...editingDoc, name:e.target.value})} 
                          style={{ flex:1, height:32, padding:'0 8px', border:'2px solid #3b82f6', borderRadius:6, outline:'none' }}
                          autoFocus
                          onKeyDown={(e)=>{
                            if(e.key==='Enter'){
                              if(editingDoc.name.trim() && editingDoc.name.trim() !== d.name){
                                fetch(`/api/documents/${d.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingDoc.name.trim()})}).then(()=>reload());
                              }
                              setEditingDoc(null);
                            }
                            if(e.key==='Escape') setEditingDoc(null);
                          }}
                        />
                        <button onClick={()=>{
                          if(editingDoc.name.trim() && editingDoc.name.trim() !== d.name){
                            fetch(`/api/documents/${d.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editingDoc.name.trim()})}).then(()=>reload());
                          }
                          setEditingDoc(null);
                        }} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #10b981', background:'#10b981', color:'#fff' }}>✓</button>
                        <button onClick={()=>setEditingDoc(null)} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #6b7280', background:'#6b7280', color:'#fff' }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div>{d.name}</div>
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={async()=>{
                            if(!inP){ await fetch(`/api/periodes/${selectedPeriode.id}/document-types`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({documentTypeId:d.id})}); }
                            else { await fetch(`/api/periodes/${selectedPeriode.id}/document-types?documentTypeId=${d.id}`,{method:'DELETE'}); }
                            const p = await fetch(`/api/periodes/${selectedPeriode.id}`).then(r=>r.json()); setSelectedPeriode(p); await reload();
                          }} style={{ padding:'4px 8px', borderRadius:6, border:`2px solid ${inP?'#ef4444':'#3b82f6'}`, background: inP?'#fff':'#3b82f6', color: inP?'#ef4444':'#fff' }}>{inP?'Retirer':'Ajouter'}</button>
                          <button onClick={()=>setEditingDoc({id:d.id, name:d.name})} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #f59e0b', background:'#f59e0b', color:'#fff' }}>✏️</button>
                          {deletingDoc?.id === d.id ? (
                            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                              <span style={{ fontSize:12, color:'#ef4444' }}>Supprimer "{d.name}" ?</span>
                              <button onClick={async()=>{
                                await fetch(`/api/documents/${d.id}`, {method:'DELETE'});
                                setDeletingDoc(null);
                                await reload();
                              }} style={{ padding:'2px 6px', borderRadius:4, border:'2px solid #ef4444', background:'#ef4444', color:'#fff', fontSize:12 }}>Oui</button>
                              <button onClick={()=>setDeletingDoc(null)} style={{ padding:'2px 6px', borderRadius:4, border:'2px solid #6b7280', background:'#6b7280', color:'#fff', fontSize:12 }}>Non</button>
                            </div>
                          ) : (
                            <button onClick={()=>setDeletingDoc({id:d.id, name:d.name})} style={{ padding:'4px 8px', borderRadius:6, border:'2px solid #ef4444', background:'#ef4444', color:'#fff' }}>🗑️</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activation par classes */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
            <h3 style={{ marginTop:0, marginBottom:8 }}>Activer pour des classes</h3>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
              {classes.map((c)=>{
                const on = selectedClasses.includes(c);
                return (
                  <button key={c} onClick={()=> setSelectedClasses(prev => on ? prev.filter(x=>x!==c) : [...prev, c])} style={{ padding:'6px 10px', borderRadius:6, border:`2px solid ${on?'#3b82f6':'#d1d5db'}`, background: on?'#eff6ff':'#fff' }}>{c}</button>
                );
              })}
            </div>
            <button onClick={async()=>{
              if(!selectedPeriode || selectedClasses.length===0) return;
              await fetch(`/api/periodes/${selectedPeriode.id}/activate`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ classes: selectedClasses }) });
              alert('Période activée pour ' + selectedClasses.join(', '));
            }} style={{ padding:'8px 12px', borderRadius:6, border:'2px solid #16a34a', background:'#16a34a', color:'#fff', fontWeight:600 }}>Appliquer la période à la classe</button>
          </div>
        </div>
      )}
    </div>
  );
}
