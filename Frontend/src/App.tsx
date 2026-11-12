import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { ResumePage } from './pages/ResumePage';
import { CompaniesPage } from './pages/CompaniesPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { CalendarPage } from './pages/CalendarPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AdmitCardPage } from './pages/AdmitCardPage';
import { SeatPlanPage } from './pages/SeatPlanPage';
import { AssistantPage } from './pages/AssistantPage';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { ApplicationModal } from './components/applications/ApplicationModal';
import { api } from './services/api';
import { ApplicationCreatePayload } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGlobalCreateOpen, setIsGlobalCreateOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.getDashboardStats();
        setIsBackendConnected(true);
      } catch {
        setIsBackendConnected(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalCreate = async (payload: ApplicationCreatePayload) => {
    await api.createApplication(payload);
    setIsGlobalCreateOpen(false);
    setCurrentTab('applications');
    window.dispatchEvent(new CustomEvent('application-created'));
  };

  const pageTitles: Record<NavItemKey, string> = {
    dashboard: 'Dashboard',
    resume: 'Resume & Candidate Profile',
    applications: 'Application Management',
    companies: 'Companies & Organizations',
    interviews: 'Interviews & Examinations',
    calendar: 'Examination Calendar',
    'admit-upload': 'Admit Card PDF Upload & Extraction',
    'seatplan-upload': 'Seat Plan & Exam Schedule PDF Upload',
    documents: 'Document Intelligence',
    assistant: 'AI Recruitment Assistant',
    notifications: 'Notifications & Alerts',
  };

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'notifications') {
            setIsNotificationsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Header
          pageTitle={pageTitles[currentTab]}
          onNewApplication={() => setIsGlobalCreateOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          isBackendConnected={isBackendConnected}
        />

        <main className="flex-1 overflow-auto page-enter" style={{ background: 'var(--bg-base)' }}>
          <div className="p-6 max-w-screen-2xl mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                onNavigateToApplications={() => setCurrentTab('applications')}
                onOpenNewApplication={() => setIsGlobalCreateOpen(true)}
              />
            )}
            {currentTab === 'resume' && <ResumePage />}
            {currentTab === 'applications' && (
              <Applications
                isCreateModalOpen={isGlobalCreateOpen}
                setIsCreateModalOpen={setIsGlobalCreateOpen}
              />
            )}
            {currentTab === 'companies' && <CompaniesPage />}
            {currentTab === 'interviews' && <InterviewsPage />}
            {currentTab === 'calendar' && <CalendarPage />}
            {currentTab === 'admit-upload' && <AdmitCardPage />}
            {currentTab === 'seatplan-upload' && <SeatPlanPage />}
            {currentTab === 'documents' && <DocumentsPage />}
            {currentTab === 'assistant' && <AssistantPage />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ApplicationModal
        isOpen={isGlobalCreateOpen}
        onClose={() => setIsGlobalCreateOpen(false)}
        onSubmit={handleGlobalCreate}
        mode="create"
      />
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}

export default App;
