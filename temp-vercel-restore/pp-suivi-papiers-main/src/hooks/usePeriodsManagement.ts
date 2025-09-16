import { useState, useEffect, useCallback } from 'react';

interface Periode {
  id: string;
  name: string;
  documentTypes?: any[];
  tasks?: any[];
}

interface UsePeriodsManagementReturn {
  periodes: Periode[];
  selectedPeriode: Periode | null;
  loading: boolean;
  error: string | null;
  setSelectedPeriode: (periode: Periode | null) => void;
  loadPeriodes: () => Promise<Periode[]>;
  createPeriode: (name: string) => Promise<boolean>;
  updatePeriode: (id: string, name: string) => Promise<boolean>;
  deletePeriode: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function usePeriodsManagement(): UsePeriodsManagementReturn {
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPeriodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/periodes');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const periodesArray = Array.isArray(data) ? data : [];
      setPeriodes(periodesArray);
      
      // Auto-sélectionner la première période si aucune n'est sélectionnée
      if (!selectedPeriode && periodesArray.length > 0) {
        setSelectedPeriode(periodesArray[0]);
      }
      
      return periodesArray;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des périodes';
      setError(errorMessage);
      console.error('Erreur lors du chargement des périodes:', err);
      setPeriodes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedPeriode]);

  const createPeriode = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      setError('Le nom de la période ne peut pas être vide');
      return false;
    }
    
    try {
      setError(null);
      const response = await fetch('/api/periodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      await loadPeriodes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la période';
      setError(errorMessage);
      console.error('Erreur lors de la création de la période:', err);
      return false;
    }
  }, [loadPeriodes]);

  const updatePeriode = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!name.trim()) {
      setError('Le nom de la période ne peut pas être vide');
      return false;
    }
    
    try {
      setError(null);
      const response = await fetch(`/api/periodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      await loadPeriodes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la période';
      setError(errorMessage);
      console.error('Erreur lors de la mise à jour de la période:', err);
      return false;
    }
  }, [loadPeriodes]);

  const deletePeriode = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/periodes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Si la période supprimée était sélectionnée, sélectionner la première disponible
      if (selectedPeriode?.id === id) {
        const remainingPeriodes = periodes.filter(p => p.id !== id);
        if (remainingPeriodes.length > 0) {
          setSelectedPeriode(remainingPeriodes[0]);
        } else {
          setSelectedPeriode(null);
        }
      }
      
      await loadPeriodes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la période';
      setError(errorMessage);
      console.error('Erreur lors de la suppression de la période:', err);
      return false;
    }
  }, [selectedPeriode, periodes, loadPeriodes]);

  const refreshData = useCallback(async () => {
    await loadPeriodes();
  }, [loadPeriodes]);

  // Charger les périodes au montage du composant
  useEffect(() => {
    loadPeriodes();
  }, []);

  return {
    periodes,
    selectedPeriode,
    loading,
    error,
    setSelectedPeriode,
    loadPeriodes,
    createPeriode,
    updatePeriode,
    deletePeriode,
    refreshData
  };
}

// Hook spécialisé pour la gestion des données liées aux périodes
export function usePeriodsData() {
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const typesArray = Array.isArray(data) ? data : [];
      setDocumentTypes(typesArray);
      
      return typesArray;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des types de documents';
      setError(errorMessage);
      console.error('Erreur lors du chargement des types de documents:', err);
      setDocumentTypes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const tasksArray = Array.isArray(data) ? data : [];
      setTasks(tasksArray);
      
      return tasksArray;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
      setError(errorMessage);
      console.error('Erreur lors du chargement des tâches:', err);
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [documentsResult, tasksResult] = await Promise.allSettled([
        fetch('/api/documents').then(r => r.ok ? r.json() : []),
        fetch('/api/tasks').then(r => r.ok ? r.json() : [])
      ]);
      
      const documents = documentsResult.status === 'fulfilled' ? 
        (Array.isArray(documentsResult.value) ? documentsResult.value : []) : [];
      const tasksData = tasksResult.status === 'fulfilled' ? 
        (Array.isArray(tasksResult.value) ? tasksResult.value : []) : [];
      
      setDocumentTypes(documents);
      setTasks(tasksData);
      
      return { documents, tasks: tasksData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('Erreur lors du chargement des données:', err);
      setDocumentTypes([]);
      setTasks([]);
      return { documents: [], tasks: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documentTypes,
    tasks,
    loading,
    error,
    loadDocumentTypes,
    loadTasks,
    loadAllData
  };
}