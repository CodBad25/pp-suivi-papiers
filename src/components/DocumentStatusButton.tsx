import React from 'react';
import { useTouchInteraction } from '../hooks/useTouchInteraction';

interface DocumentStatusButtonProps {
  isSubmitted: boolean;
  onToggle: () => void;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  documentName?: string;
  documentDescription?: string;
}

export const DocumentStatusButton: React.FC<DocumentStatusButtonProps> = ({
  isSubmitted,
  onToggle,
  size = 'medium',
  showText = true,
  documentName = 'Document',
  documentDescription = 'Cliquez pour changer le statut du document'
}) => {
  const { touchProps, infoButtonProps } = useTouchInteraction({
    data: {
      title: documentName,
      description: documentDescription,
      status: isSubmitted.toString(),
      type: 'document'
    },
    onTap: onToggle
  });
  const sizes = {
    small: {
      button: { width: '24px', height: '24px', fontSize: '0.75rem' },
      text: { fontSize: '0.75rem' }
    },
    medium: {
      button: { width: '32px', height: '32px', fontSize: '0.875rem' },
      text: { fontSize: '0.875rem' }
    },
    large: {
      button: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
      text: { fontSize: '0.875rem' }
    }
  };

  if (size === 'large') {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {isSubmitted ? (
          <>
            <button
              {...touchProps}
              style={{
                ...sizes.large.button,
                borderRadius: '0.375rem',
                border: '1px solid #ef4444',
                background: 'white',
                color: '#ef4444',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              ❌ {showText && 'Annuler'}
            </button>
            <div style={{
              ...sizes.large.button,
              borderRadius: '0.375rem',
              background: '#10b981',
              color: 'white',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              ✅ {showText && 'Rendu'}
            </div>
          </>
        ) : (
          <button
            {...touchProps}
            style={{
              ...sizes.large.button,
              borderRadius: '0.375rem',
              border: '1px solid #10b981',
              background: 'white',
              color: '#10b981',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#10b981';
            }}
          >
            ✅ {showText && 'Marquer comme rendu'}
          </button>
        )}
        <button
          {...infoButtonProps}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '1px solid #6b7280',
            background: 'white',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6b7280';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ⓘ
        </button>
      </div>
    );
  }

  // Pour les tailles small et medium (boutons circulaires)
  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      <button
        {...touchProps}
        style={{
          ...sizes[size].button,
          borderRadius: '50%',
          border: 'none',
          background: isSubmitted ? '#10b981' : '#e5e7eb',
          color: isSubmitted ? 'white' : '#6b7280',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isSubmitted) {
            e.currentTarget.style.background = '#d1d5db';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubmitted) {
            e.currentTarget.style.background = '#e5e7eb';
          }
        }}
        title={isSubmitted ? 'Document rendu - Cliquer pour annuler' : 'Marquer comme rendu'}
      >
        {isSubmitted ? '✓' : '○'}
      </button>
      <button
        {...infoButtonProps}
        style={{
          width: size === 'small' ? '16px' : '20px',
          height: size === 'small' ? '16px' : '20px',
          borderRadius: '50%',
          border: '1px solid #6b7280',
          background: 'white',
          color: '#6b7280',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'small' ? '0.625rem' : '0.75rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#6b7280';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        ⓘ
      </button>
    </div>
  );
};
