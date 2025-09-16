"use client";

import { useEffect, useMemo, useState } from "react";

export default function PreparePanel() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [periodes, setPeriodes] = useState<any[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [summary, setSummary] = useState<any | null>(null);
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [resetStates, setResetStates] = useState(false);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = async () => {
    try {
      const [p, tt, dt, st] = await Promise.all([
        fetch("/api/periodes").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch("/api/task-types").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch("/api/documents").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch("/api/students").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);
      const P = Array.isArray(p) ? p : [];
      const TT = Array.isArray(tt) ? tt : [];
      const DT = Array.isArray(dt) ? dt : [];
      const ST = Array.isArray(st) ? st : [];
      setPeriodes(P);
      setTaskTypes(TT);
      setDocumentTypes(DT);
      const cls = Array.from(new Set(ST.map((s: any) => s.class))).sort();
      setClasses(cls);
      if (!selectedPeriode && P.length > 0) setSelectedPeriode(P[0]);
      setSummary(null);
    } catch (e) {
      setPeriodes([]);
      setTaskTypes([]);
      setDocumentTypes([]);
      setClasses([]);
    }
  };

  const periodeTaskIds = useMemo(
    () => new Set((selectedPeriode?.taskTypes || []).map((x: any) => x.taskTypeId)),
    [selectedPeriode]
  );
  const periodeDocIds = useMemo(
    () => new Set((selectedPeriode?.documentTypes || []).map((x: any) => x.documentTypeId)),
    [selectedPeriode]
  );

  return (
    <div style={{ paddingTop: 8 }}>
      {/* Etapes */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s as any)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: `2px solid ${step === s ? "#3b82f6" : "#d1d5db"}`,
              background: step === s ? "#eff6ff" : "#fff",
            }}
          >
            Etape {s}
          </button>
        ))}
      </div>

      {/* Etape 1: Periode */}
      <div style={{ display: step === 1 ? "block" : "none" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la periode (ex: Rentree)"
            style={{ flex: "1 1 240px", height: 36, padding: "0 10px", border: "2px solid #d1d5db", borderRadius: 6 }}
          />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ height: 36, border: "2px solid #d1d5db", borderRadius: 6, padding: "0 8px" }} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ height: 36, border: "2px solid #d1d5db", borderRadius: 6, padding: "0 8px" }} />
          <button
            onClick={async () => {
              if (!name.trim()) return;
              const res = await fetch("/api/periodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), startDate: startDate || null, endDate: endDate || null }),
              });
              if (res.ok) {
                setName("");
                setStartDate("");
                setEndDate("");
                await reload();
              }
            }}
            style={{ padding: "8px 12px", borderRadius: 6, border: "2px solid #3b82f6", background: "#3b82f6", color: "#fff", fontWeight: 600 }}
          >
            Creer
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {periodes.map((p: any) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPeriode(p);
                setStep(2);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `2px solid ${selectedPeriode?.id === p.id ? "#3b82f6" : "#d1d5db"}`,
                background: selectedPeriode?.id === p.id ? "#eff6ff" : "#fff",
                cursor: "pointer",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {selectedPeriode && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Etape 2: Taches */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: step === 2 ? "block" : "none" }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Taches par defaut</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Nouvelle tache" style={{ flex: 1, height: 32, padding: "0 8px", border: "2px solid #d1d5db", borderRadius: 6 }} />
              <button
                onClick={async () => {
                  if (!newTaskName.trim()) return;
                  const res = await fetch("/api/task-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTaskName.trim() }) });
                  if (res.ok) {
                    setNewTaskName("");
                    await reload();
                  }
                }}
                style={{ padding: "6px 10px", borderRadius: 6, border: "2px solid #10b981", background: "#10b981", color: "#fff" }}
              >
                Ajouter
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {taskTypes.map((t: any) => {
                const inP = periodeTaskIds.has(t.id);
                return (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px" }}>
                    <div>{t.name}</div>
                    <button
                      onClick={async () => {
                        if (!inP) {
                          await fetch(`/api/periodes/${selectedPeriode.id}/task-types`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskTypeId: t.id }) });
                        } else {
                          await fetch(`/api/periodes/${selectedPeriode.id}/task-types?taskTypeId=${t.id}`, { method: "DELETE" });
                        }
                        const p = await fetch(`/api/periodes/${selectedPeriode.id}`).then((r) => r.json());
                        setSelectedPeriode(p);
                        await reload();
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `2px solid ${inP ? "#ef4444" : "#3b82f6"}`,
                        background: inP ? "#fff" : "#3b82f6",
                        color: inP ? "#ef4444" : "#fff",
                      }}
                    >
                      {inP ? "Retirer" : "Ajouter"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Etape 2: Documents */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: step === 2 ? "block" : "none" }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Documents par defaut</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Nouveau document" style={{ flex: 1, height: 32, padding: "0 8px", border: "2px solid #d1d5db", borderRadius: 6 }} />
              <button
                onClick={async () => {
                  if (!newDocName.trim()) return;
                  const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newDocName.trim() }) });
                  if (res.ok) {
                    setNewDocName("");
                    await reload();
                  }
                }}
                style={{ padding: "6px 10px", borderRadius: 6, border: "2px solid #10b981", background: "#10b981", color: "#fff" }}
              >
                Ajouter
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {documentTypes.map((d: any) => {
                const inP = periodeDocIds.has(d.id);
                return (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px" }}>
                    <div>{d.name}</div>
                    <button
                      onClick={async () => {
                        if (!inP) {
                          await fetch(`/api/periodes/${selectedPeriode.id}/document-types`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentTypeId: d.id }) });
                        } else {
                          await fetch(`/api/periodes/${selectedPeriode.id}/document-types?documentTypeId=${d.id}`, { method: "DELETE" });
                        }
                        const p = await fetch(`/api/periodes/${selectedPeriode.id}`).then((r) => r.json());
                        setSelectedPeriode(p);
                        await reload();
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: `2px solid ${inP ? "#ef4444" : "#3b82f6"}`,
                        background: inP ? "#fff" : "#3b82f6",
                        color: inP ? "#ef4444" : "#fff",
                      }}
                    >
                      {inP ? "Retirer" : "Ajouter"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Etape 3: Activation */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: step === 3 ? "block" : "none" }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Activer pour des classes</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {classes.map((c) => {
                const on = selectedClasses.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedClasses((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: `2px solid ${on ? "#3b82f6" : "#d1d5db"}`,
                      background: on ? "#eff6ff" : "#fff",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
                Ne creer que le manquant
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={resetStates} onChange={(e) => setResetStates(e.target.checked)} />
                Reinitialiser les etats
              </label>
              <button
                onClick={async () => {
                  if (!selectedPeriode || selectedClasses.length === 0) return;
                  const sp = encodeURIComponent(selectedClasses.join(","));
                  const s = await fetch(`/api/periodes/${selectedPeriode.id}/summary?classes=${sp}`).then((r) => r.json());
                  setSummary(s);
                }}
                style={{ padding: "6px 10px", borderRadius: 6, border: "2px solid #d1d5db", background: "#fff" }}
              >
                Apercu
              </button>
            </div>
            {summary && (
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 8 }}>
                {summary.students} eleves impactes — Taches: {summary.tasks?.missing || 0} a creer, {summary.tasks?.dueUpdates || 0} mises a jour — Docs: {summary.documents?.missing || 0} a creer
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={async () => {
                  if (!selectedPeriode || selectedClasses.length === 0) return;
                  const res = await fetch(`/api/periodes/${selectedPeriode.id}/activate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ classes: selectedClasses, options: { dryRun: false, onlyMissing, reset: resetStates } }),
                  });
                  if (res.ok) {
                    const r = await res.json();
                    alert(`Periode appliquee: ${r.students} eleves — +${r.createdTasks} taches, ~${r.updatedTasks} mises a jour, +${r.createdDocs} docs`);
                  }
                }}
                style={{ padding: "8px 12px", borderRadius: 6, border: "2px solid #16a34a", background: "#16a34a", color: "#fff", fontWeight: 600 }}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

