"use client";

import { useRef, useCallback } from 'react';
import { useTouchInfo } from '../components/TouchInfoProvider';

interface TouchInfoData {
  title: string;
  description: string;
  status?: string;
  type: 'document' | 'task';
}

interface UseTouchInteractionProps {
  data: TouchInfoData;
  onTap?: () => void;
}

export const useTouchInteraction = ({ data, onTap }: UseTouchInteractionProps) => {
  const { showTooltip, hideTooltip, showModal } = useTouchInfo();
  const touchStartTimeRef = useRef<number>(0);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    // Empêcher le menu contextuel
    e.preventDefault();
    
    touchStartTimeRef.current = Date.now();
    elementRef.current = e.currentTarget;
    
    // Démarrer le timer pour le tap long (500ms)
    touchTimeoutRef.current = setTimeout(() => {
      if (elementRef.current) {
        showTooltip(data, elementRef.current);
        // Vibration tactile si disponible
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  }, [data, showTooltip]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLElement>) => {
    // Empêcher le menu contextuel
    e.preventDefault();
    
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // Annuler le timer du tap long
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Si c'est un tap court (< 500ms), exécuter l'action normale
    if (touchDuration < 500 && onTap) {
      onTap();
    }
  }, [onTap]);

  const handleTouchCancel = useCallback(() => {
    // Annuler le timer si le touch est annulé
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  }, []);

  const handleInfoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    showModal(data);
  }, [data, showModal]);

  // Pour les interactions souris (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // Seulement sur desktop (pas de touch)
    if ('ontouchstart' in window) return;
    
    touchStartTimeRef.current = Date.now();
    elementRef.current = e.currentTarget;
    
    touchTimeoutRef.current = setTimeout(() => {
      if (elementRef.current) {
        showTooltip(data, elementRef.current);
      }
    }, 500);
  }, [data, showTooltip]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if ('ontouchstart' in window) return;
    
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    if (touchDuration < 500 && onTap) {
      onTap();
    }
  }, [onTap]);

  const handleMouseLeave = useCallback(() => {
    if ('ontouchstart' in window) return;
    
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  }, []);

  // Gestionnaire pour empêcher le menu contextuel
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  return {
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onContextMenu: handleContextMenu
    },
    infoButtonProps: {
      onClick: handleInfoClick,
      onContextMenu: handleContextMenu
    }
  };
};

export default useTouchInteraction;