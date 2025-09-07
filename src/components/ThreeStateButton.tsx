"use client";

import React from 'react';

type DocumentStatus = 'pending' | 'in-progress' | 'submitted';

interface ThreeStateButtonProps {
  status: DocumentStatus;
  onChange: (newStatus: DocumentStatus) => void;
  size?: 'small' | 'medium' | 'large';
}

export const ThreeStateButton: React.FC<ThreeStateButtonProps> = ({
  status,
  onChange,
  size = 'medium'
}) => {
  const handleClick = () => {
    // Cycle through the states: pending -> in-progress -> submitted -> pending
    switch (status) {
      case 'pending':
        onChange('in-progress');
        break;
      case 'in-progress':
        onChange('submitted');
        break;
      case 'submitted':
        onChange('pending');
        break;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
      fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1.125rem' : '1rem',
      width: size === 'small' ? '24px' : size === 'large' ? '40px' : '32px',
      height: size === 'small' ? '24px' : size === 'large' ? '40px' : '32px'
    };

    switch (status) {
      case 'pending':
        return {
          ...baseStyle,
          background: '#f3f4f6',
          color: '#9ca3af',
          border: '2px solid #e5e7eb'
        };
      case 'in-progress':
        return {
          ...baseStyle,
          background: '#fef3c7',
          color: '#d97706',
          border: '2px solid #f59e0b'
        };
      case 'submitted':
        return {
          ...baseStyle,
          background: '#dcfce7',
          color: '#16a34a',
          border: '2px solid #22c55e'
        };
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'in-progress':
        return '🔄';
      case 'submitted':
        return '✅';
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'pending':
        return 'En attente - Cliquer pour marquer en cours';
      case 'in-progress':
        return 'En cours - Cliquer pour marquer comme rendu';
      case 'submitted':
        return 'Rendu - Cliquer pour remettre en attente';
    }
  };

  return (
    <button
      onClick={handleClick}
      style={getButtonStyle()}
      title={getTooltip()}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {getIcon()}
    </button>
  );
};

// Version avec texte pour les interfaces plus larges
export const ThreeStateButtonWithText: React.FC<ThreeStateButtonProps> = ({
  status,
  onChange,
  size = 'medium'
}) => {
  const handleClick = () => {
    switch (status) {
      case 'pending':
        onChange('in-progress');
        break;
      case 'in-progress':
        onChange('submitted');
        break;
      case 'submitted':
        onChange('pending');
        break;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
      padding: size === 'small' ? '0.25rem 0.5rem' : size === 'large' ? '0.75rem 1rem' : '0.5rem 0.75rem'
    };

    switch (status) {
      case 'pending':
        return {
          ...baseStyle,
          background: '#f3f4f6',
          color: '#6b7280',
          border: '1px solid #d1d5db'
        };
      case 'in-progress':
        return {
          ...baseStyle,
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b'
        };
      case 'submitted':
        return {
          ...baseStyle,
          background: '#dcfce7',
          color: '#166534',
          border: '1px solid #22c55e'
        };
    }
  };

  const getContent = () => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', text: 'En attente' };
      case 'in-progress':
        return { icon: '🔄', text: 'En cours' };
      case 'submitted':
        return { icon: '✅', text: 'Rendu' };
    }
  };

  const content = getContent();

  return (
    <button
      onClick={handleClick}
      style={getButtonStyle()}
      title={`Cliquer pour changer le statut`}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span>{content.icon}</span>
      <span>{content.text}</span>
    </button>
  );
};
