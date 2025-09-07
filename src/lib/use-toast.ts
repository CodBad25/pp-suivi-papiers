import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Toast) => {
    console.log('Toast:', toast);
    // Pour l'instant, on utilise juste console.log
    // Dans une vraie implémentation, on afficherait un toast UI
  };

  return { toast };
}

