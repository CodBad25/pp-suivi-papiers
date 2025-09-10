import Link from 'next/link';
import ManagementDashboard from '@/components/ManagementDashboard';

export default function ManagePage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>
          🛠️ Gestion des documents et tâches
        </h1>
        
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease'
          }}
        >
          ← Retour à l'accueil
        </Link>
      </div>

      {/* Contenu principal */}
      <ManagementDashboard />
    </div>
  );
}