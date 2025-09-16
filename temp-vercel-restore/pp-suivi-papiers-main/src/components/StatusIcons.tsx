import React from 'react';

interface StatusIconsProps {
  documents: Array<{ status: string; id: string }>;
  onToggle: (docId: string) => void;
  maxVisible?: number;
}

export const StatusIcons: React.FC<StatusIconsProps> = ({
  documents,
  onToggle,
  maxVisible = 5
}) => {
  const visibleDocs = documents.slice(0, maxVisible);
  const hiddenCount = Math.max(0, documents.length - maxVisible);
  const completedCount = documents.filter(doc => doc.status === 'submitted').length;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      flexWrap: 'wrap'
    }}>
      {/* Icônes des documents visibles */}
      {visibleDocs.map((doc, index) => (
        <button
          key={doc.id}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(doc.id);
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: 'none',
            background: doc.status === 'submitted' ? '#10b981' : '#e5e7eb',
            color: doc.status === 'submitted' ? 'white' : '#6b7280',
            fontSize: '0.625rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (doc.status === 'pending') {
              e.currentTarget.style.background = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (doc.status === 'pending') {
              e.currentTarget.style.background = '#e5e7eb';
            }
          }}
          title={`Document ${index + 1}: ${doc.status === 'submitted' ? 'Rendu' : 'En attente'}`}
        >
          {doc.status === 'submitted' ? '✓' : index + 1}
        </button>
      ))}

      {/* Indicateur des documents cachés */}
      {hiddenCount > 0 && (
        <span style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginLeft: '0.25rem'
        }}>
          +{hiddenCount}
        </span>
      )}

      {/* Compteur total */}
      <span style={{
        fontSize: '0.75rem',
        color: '#6b7280',
        marginLeft: 'auto'
      }}>
        {completedCount}/{documents.length}
      </span>
    </div>
  );
};

interface StatusIndicatorProps {
  completed: number;
  total: number;
  size?: 'small' | 'medium' | 'large';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  completed,
  total,
  size = 'medium'
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const colors = {
    background: percentage === 100 ? '#dcfce7' : percentage > 0 ? '#fef3c7' : '#f3f4f6',
    border: percentage === 100 ? '#10b981' : percentage > 0 ? '#f59e0b' : '#e5e7eb',
    text: percentage === 100 ? '#15803d' : percentage > 0 ? '#d97706' : '#6b7280'
  };

  const sizes = {
    small: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    medium: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    large: { padding: '0.75rem 1rem', fontSize: '1rem' }
  };

  return (
    <div style={{
      ...sizes[size],
      background: colors.background,
      border: `2px solid ${colors.border}`,
      borderRadius: '0.5rem',
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'center',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      <span>{percentage}%</span>
      <span style={{ fontSize: '0.75em', opacity: 0.8 }}>
        ({completed}/{total})
      </span>
    </div>
  );
};
