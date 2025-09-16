"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface Periode {
  id: string;
  name: string;
  documentTypes?: any[];
  tasks?: any[];
}

interface PeriodsState {
  periodes: Periode[];
  selectedPeriode: Periode | null;
  documentTypes: any[];
  tasks: any[];
  loading: boolean;
  error: string | null;
}

type PeriodsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PERIODES'; payload: Periode[] }
  | { type: 'SET_SELECTED_PERIODE'; payload: Periode | null }
  | { type: 'SET_DOCUMENT_TYPES'; payload: any[] }
  | { type: 'SET_TASKS'; payload: any[] }
  | { type: 'ADD_PERIODE'; payload: Periode }
  | { type: 'UPDATE_PERIODE'; payload: { id: string; updates: Partial<Periode> } }
  | { type: 'DELETE_PERIODE'; payload: string }
  | { type: 'RESET_STATE' };

interface PeriodsContextType {
  state: PeriodsState;
  dispatch: React.Dispatch<PeriodsAction>;
  // Actions
  loadPeriodes: () => Promise<void>;
  loadDocumentTypes: () => Promise<void>;
  loadTasks: () => Promise<void>;
  loadAllData: () => Promise<void>;
  createPeriode: (name: string) => Promise<boolean>;
  updatePeriode: (id: string, name: string) => Promise<boolean>;
  deletePeriode: (id: string) => Promise<boolean>;
  selectPeriode: (periode: Periode | null) => void;
  refreshData: () => Promise<void>;
}

const initialState: PeriodsState = {
  periodes: [],
  selectedPeriode: null,
  documentTypes: [],
  tasks: [],
  loading: false,
  error: null
};

function periodsReducer(state: PeriodsState, action: PeriodsAction): PeriodsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PERIODES':
      return { ...state, periodes: action.payload };
    
    case 'SET_SELECTED_PERIODE':
      return { ...state, selectedPeriode: action.payload };
    
    case 'SET_DOCUMENT_TYPES':
      return { ...state, documentTypes: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_PERIODE':
      return { 
        ...state, 
        periodes: [...state.periodes, action.payload],
        selectedPeriode: state.selectedPeriode || action.payload
      };
    
    case 'UPDATE_PERIODE':
      return {
        ...state,
        periodes: state.periodes.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
        selectedPeriode: state.selectedPeriode?.id === action.payload.id 
          ? { ...state.selectedPeriode, ...action.payload.updates }
          : state.selectedPeriode
      };
    
    case 'DELETE_PERIODE':
      const remainingPeriodes = state.periodes.filter(p => p.id !== action.payload);
      return {
        ...state,
        periodes: remainingPeriodes,
        selectedPeriode: state.selectedPeriode?.id === action.payload 
          ? (remainingPeriodes.length > 0 ? remainingPeriodes[0] : null)
          : state.selectedPeriode
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

const PeriodsContext = createContext<PeriodsContextType | undefined>(undefined);

interface PeriodsProviderProps {
  children: ReactNode;
}

export function PeriodsProvider({ children }: PeriodsProviderProps) {
  const [state, dispatch] = useReducer(periodsReducer, initialState);

  // Actions
  const loadPeriodes = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/periodes');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const periodesArray = Array.isArray(data) ? data : [];
      dispatch({ type: 'SET_PERIODES', payload: periodesArray });
      
      // Auto-sélectionner la première période si aucune n'est sélectionnée
      if (!state.selectedPeriode && periodesArray.length > 0) {
        dispatch({ type: 'SET_SELECTED_PERIODE', payload: periodesArray[0] });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des périodes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors du chargement des périodes:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadDocumentTypes = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const typesArray = Array.isArray(data) ? data : [];
      dispatch({ type: 'SET_DOCUMENT_TYPES', payload: typesArray });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des types de documents';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors du chargement des types de documents:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadTasks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await fetch('/api/task-types');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const tasksArray = Array.isArray(data) ? data : [];
      dispatch({ type: 'SET_TASKS', payload: tasksArray });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors du chargement des tâches:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const [periodesResult, documentsResult, tasksResult] = await Promise.allSettled([
        fetch('/api/periodes').then(r => r.ok ? r.json() : []),
        fetch('/api/documents').then(r => r.ok ? r.json() : []),
        fetch('/api/task-types').then(r => r.ok ? r.json() : [])
      ]);
      
      const periodes = periodesResult.status === 'fulfilled' ? 
        (Array.isArray(periodesResult.value) ? periodesResult.value : []) : [];
      const documents = documentsResult.status === 'fulfilled' ? 
        (Array.isArray(documentsResult.value) ? documentsResult.value : []) : [];
      const tasks = tasksResult.status === 'fulfilled' ? 
        (Array.isArray(tasksResult.value) ? tasksResult.value : []) : [];
      
      dispatch({ type: 'SET_PERIODES', payload: periodes });
      dispatch({ type: 'SET_DOCUMENT_TYPES', payload: documents });
      dispatch({ type: 'SET_TASKS', payload: tasks });
      
      // Auto-sélectionner la première période si aucune n'est sélectionnée
      if (!state.selectedPeriode && periodes.length > 0) {
        dispatch({ type: 'SET_SELECTED_PERIODE', payload: periodes[0] });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createPeriode = async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Le nom de la période ne peut pas être vide' });
      return false;
    }
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await fetch('/api/periodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const newPeriode = await response.json();
      dispatch({ type: 'ADD_PERIODE', payload: newPeriode });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la période';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors de la création de la période:', err);
      return false;
    }
  };

  const updatePeriode = async (id: string, name: string): Promise<boolean> => {
    if (!name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Le nom de la période ne peut pas être vide' });
      return false;
    }
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await fetch(`/api/periodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      dispatch({ type: 'UPDATE_PERIODE', payload: { id, updates: { name: name.trim() } } });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la période';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors de la mise à jour de la période:', err);
      return false;
    }
  };

  const deletePeriode = async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await fetch(`/api/periodes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      dispatch({ type: 'DELETE_PERIODE', payload: id });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la période';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Erreur lors de la suppression de la période:', err);
      return false;
    }
  };

  const selectPeriode = (periode: Periode | null) => {
    dispatch({ type: 'SET_SELECTED_PERIODE', payload: periode });
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, []);

  const contextValue: PeriodsContextType = {
    state,
    dispatch,
    loadPeriodes,
    loadDocumentTypes,
    loadTasks,
    loadAllData,
    createPeriode,
    updatePeriode,
    deletePeriode,
    selectPeriode,
    refreshData
  };

  return (
    <PeriodsContext.Provider value={contextValue}>
      {children}
    </PeriodsContext.Provider>
  );
}

export function usePeriods() {
  const context = useContext(PeriodsContext);
  if (context === undefined) {
    throw new Error('usePeriods must be used within a PeriodsProvider');
  }
  return context;
}

// Hook pour accéder uniquement aux données sans les actions
export function usePeriodsState() {
  const { state } = usePeriods();
  return state;
}

// Hook pour accéder uniquement aux actions
export function usePeriodsActions() {
  const { 
    loadPeriodes,
    loadDocumentTypes,
    loadTasks,
    loadAllData,
    createPeriode,
    updatePeriode,
    deletePeriode,
    selectPeriode,
    refreshData
  } = usePeriods();
  
  return {
    loadPeriodes,
    loadDocumentTypes,
    loadTasks,
    loadAllData,
    createPeriode,
    updatePeriode,
    deletePeriode,
    selectPeriode,
    refreshData
  };
}