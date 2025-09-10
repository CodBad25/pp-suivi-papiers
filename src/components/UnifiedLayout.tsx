"use client";

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PeriodsProvider } from '../contexts/PeriodsContext';

interface Tab {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: '📊',
    path: '/',
    description: 'Dashboard principal avec statistiques et vue globale'
  },
  {
    id: 'tasks',
    label: 'Tâches',
    icon: '✅',
    path: '/tasks',
    description: 'Gestion des tâches et devoirs par période'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: '📄',
    path: '/documents',
    description: 'Gestion des types de documents par période'
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: '📈',
    path: '/reports',
    description: 'Analyses et rapports détaillés'
  }
];

interface UnifiedLayoutProps {
  children: ReactNode;
  activeTab?: string;
  showTabs?: boolean;
  title?: string;
  subtitle?: string;
}

export default function UnifiedLayout({ 
  children, 
  activeTab,
  showTabs = true,
  title,
  subtitle
}: UnifiedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Déterminer l'onglet actif basé sur le pathname si non spécifié
  const currentTab = activeTab || tabs.find(tab => {
    if (tab.path === '/' && pathname === '/') return true;
    if (tab.path !== '/' && pathname.startsWith(tab.path)) return true;
    return false;
  })?.id || 'overview';

  const handleTabChange = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.path === pathname) return;

    setIsNavigating(true);
    try {
      await router.push(tab.path);
    } catch (error) {
      console.error('Erreur de navigation:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const currentTabInfo = tabs.find(t => t.id === currentTab);

  return (
    <PeriodsProvider>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      }}>
        {/* Header avec navigation */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '16px 24px'
          }}>
            {/* Titre principal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: showTabs ? 16 : 0
            }}>
              <div>
                <h1 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  margin: 0,
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  {currentTabInfo?.icon} 
                  {title || currentTabInfo?.label || 'Suivi Pédagogique'}
                </h1>
                {(subtitle || currentTabInfo?.description) && (
                  <p style={{
                    fontSize: 14,
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>
                    {subtitle || currentTabInfo?.description}
                  </p>
                )}
              </div>
              
              {/* Indicateur de navigation */}
              {isNavigating && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#6b7280',
                  fontSize: 14
                }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Navigation...
                </div>
              )}
            </div>

            {/* Navigation par onglets */}
            {showTabs && (
              <nav style={{
                display: 'flex',
                gap: 4,
                background: '#f8fafc',
                padding: 4,
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                {tabs.map((tab) => {
                  const isActive = tab.id === currentTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      disabled={isNavigating}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: isActive ? '#8b5cf6' : 'transparent',
                        color: isActive ? '#fff' : '#64748b',
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        cursor: isNavigating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isNavigating ? 0.6 : 1,
                        transform: isActive ? 'translateY(-1px)' : 'none',
                        boxShadow: isActive ? '0 4px 8px rgba(139, 92, 246, 0.3)' : 'none'
                      }}
                      title={tab.description}
                    >
                      <span style={{ fontSize: 16 }}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </header>

        {/* Contenu principal */}
        <main style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '24px',
          minHeight: 'calc(100vh - 140px)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minHeight: 'calc(100vh - 200px)'
          }}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '16px 24px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 12
        }}>
          <p style={{ margin: 0 }}>
            Suivi Pédagogique - Interface Unifiée • 
            {new Date().getFullYear()}
          </p>
        </footer>

        {/* Styles pour l'animation de chargement */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Responsive design */}
          @media (max-width: 768px) {
            nav {
              flex-direction: column;
              gap: 2px;
            }
            
            nav button {
              justify-content: flex-start;
              padding: 10px 16px;
            }
            
            h1 {
              font-size: 24px;
            }
          }
          
          @media (max-width: 480px) {
            main {
              padding: 16px;
            }
            
            .content {
              padding: 16px;
            }
            
            h1 {
              font-size: 20px;
            }
          }
        `}</style>
      </div>
    </PeriodsProvider>
  );
}

// Hook pour utiliser le layout dans les pages
export function useUnifiedLayout() {
  const router = useRouter();
  const pathname = usePathname();
  
  const navigateToTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      router.push(tab.path);
    }
  };
  
  const getCurrentTab = () => {
    return tabs.find(tab => {
      if (tab.path === '/' && pathname === '/') return true;
      if (tab.path !== '/' && pathname.startsWith(tab.path)) return true;
      return false;
    })?.id || 'overview';
  };
  
  return {
    navigateToTab,
    getCurrentTab,
    tabs
  };
}