"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface TouchInfoData {
  title: string;
  description: string;
  status?: string;
  type: 'document' | 'task';
}

interface TouchInfoContextType {
  showTooltip: (data: TouchInfoData, element: HTMLElement) => void;
  hideTooltip: () => void;
  showModal: (data: TouchInfoData) => void;
  hideModal: () => void;
}

const TouchInfoContext = createContext<TouchInfoContextType | null>(null);

export const useTouchInfo = () => {
  const context = useContext(TouchInfoContext);
  if (!context) {
    throw new Error('useTouchInfo must be used within TouchInfoProvider');
  }
  return context;
};

interface TouchInfoProviderProps {
  children: ReactNode;
}

export const TouchInfoProvider: React.FC<TouchInfoProviderProps> = ({ children }) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    data: TouchInfoData | null;
    position: { x: number; y: number };
  }>({ visible: false, data: null, position: { x: 0, y: 0 } });
  
  const [modal, setModal] = useState<{
    visible: boolean;
    data: TouchInfoData | null;
  }>({ visible: false, data: null });
  
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = (data: TouchInfoData, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;
    
    setTooltip({
      visible: true,
      data,
      position: { x, y }
    });
    
    // Auto-hide après 2 secondes
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      hideTooltip();
    }, 2000);
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, data: null, position: { x: 0, y: 0 } });
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const showModal = (data: TouchInfoData) => {
    setModal({ visible: true, data });
  };

  const hideModal = () => {
    setModal({ visible: false, data: null });
  };

  const getStatusText = (status: string, type: 'document' | 'task') => {
    if (type === 'document') {
      return status === 'true' ? 'Document rendu' : 'Document non rendu';
    } else {
      switch (status) {
        case 'pending': return 'Tâche en attente';
        case 'in-progress': return 'Tâche en cours';
        case 'submitted': return 'Tâche terminée';
        default: return 'Statut inconnu';
      }
    }
  };

  return (
    <TouchInfoContext.Provider value={{ showTooltip, hideTooltip, showModal, hideModal }}>
      {children}
      
      {/* Tooltip rapide */}
      {tooltip.visible && tooltip.data && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.position.x}px`,
            top: `${tooltip.position.y}px`,
            transform: 'translateX(-50%) translateY(-100%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: 1000,
            pointerEvents: 'none',
            maxWidth: '200px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div>{tooltip.data.title}</div>
          {tooltip.data.status && (
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
              {getStatusText(tooltip.data.status, tooltip.data.type)}
            </div>
          )}
        </div>
      )}
      
      {/* Modal détaillée */}
      {modal.visible && modal.data && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px'
          }}
          onClick={hideModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                {modal.data.title}
              </h3>
              <button
                onClick={hideModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
                {modal.data.description}
              </p>
            </div>
            
            {modal.data.status && (
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Statut actuel :
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                  {getStatusText(modal.data.status, modal.data.type)}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={hideModal}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </TouchInfoContext.Provider>
  );
};