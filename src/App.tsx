import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import LoginPage from "@/pages/LoginPage";
import BasicPlanPage from "@/pages/BasicPlanPage";
import AdminSidebar from "@/components/AdminSidebar";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import AdminClinicasPage from "@/pages/admin/AdminClinicasPage";
import AdminPipelinePage from "@/pages/admin/AdminPipelinePage";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/pages/DashboardPage";
import AgendaPage from "@/pages/AgendaPage";
import PatientsPage from "@/pages/PatientsPage";
import AbsencesPage from "@/pages/AbsencesPage";
import FollowUpsPage from "@/pages/FollowUpsPage";
import StatsPage from "@/pages/StatsPage";
import SettingsPage from "@/pages/SettingsPage";
import type { AdminPage } from "@/components/AdminSidebar";

export type Page = "dashboard" | "agenda" | "patients" | "absences" | "followups" | "stats" | "settings";

export default function App() {
  const { user, role, clienteId, loading: authLoading, signOut } = useAuth();

  const [viewingAs, setViewingAs] = useState<{ id: string; nombre: string } | null>(null);
  const [adminPage, setAdminPage] = useState<AdminPage>('overview');
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeClienteId = viewingAs?.id ?? clienteId;
  const { plan, loading: planLoading } = usePlan(
    role === 'clinic' || viewingAs ? activeClienteId : null
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // ADMIN PANEL
  if (role === 'admin' && !viewingAs) {
    const renderAdminPage = () => {
      switch (adminPage) {
        case 'overview': return <AdminOverviewPage />;
        case 'clinicas':
          return (
            <AdminClinicasPage
              onVerComo={(clinica) => {
                setViewingAs(clinica);
                setCurrentPage('dashboard');
              }}
            />
          );
        case 'pipeline':
          return (
            <AdminPipelinePage
              onConvertir={() => { setAdminPage('clinicas'); }}
            />
          );
        default: return <AdminOverviewPage />;
      }
    };

    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <AdminSidebar
          currentPage={adminPage}
          onNavigate={setAdminPage}
          viewingAs={null}
          onExitViewAs={() => setViewingAs(null)}
          onSignOut={signOut}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderAdminPage()}
        </main>
      </div>
    );
  }

  // PLAN LOADING
  if ((role === 'clinic' || viewingAs) && planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // BASIC PLAN GATE
  const effectivePlan = plan ?? 'basic';

  if (effectivePlan === 'basic') {
    if (role === 'clinic' && !viewingAs) {
      return <BasicPlanPage plan={effectivePlan} clienteId={clienteId} onSignOut={signOut} />;
    }
    if (viewingAs) {
      return (
        <BasicPlanPage
          plan={effectivePlan}
          onSignOut={() => { setViewingAs(null); setCurrentPage('dashboard'); }}
          viewingAs={viewingAs}
        />
      );
    }
  }

  // CLINIC DASHBOARD
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":  return <DashboardPage clienteId={activeClienteId} plan={plan} />;
      case "agenda":     return <AgendaPage />;
      case "patients":   return <PatientsPage />;
      case "absences":   return <AbsencesPage />;
      case "followups":  return <FollowUpsPage plan={plan} />;
      case "stats":      return <StatsPage plan={plan} />;
      case "settings":   return <SettingsPage />;
      default:           return <DashboardPage clienteId={activeClienteId} plan={plan} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {viewingAs && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-xs font-medium py-1.5 px-4 flex items-center justify-between">
          <span>Vista admin: <strong>{viewingAs.nombre}</strong>{plan && <span className="ml-2 opacity-80">- Plan {plan}</span>}</span>
          <button onClick={() => { setViewingAs(null); setCurrentPage('dashboard'); }} className="underline hover:no-underline">
            Volver al admin
          </button>
        </div>
      )}

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={signOut}
        plan={plan}
        isAdmin={role === 'admin'}
        viewingAs={viewingAs}
      />

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${viewingAs ? 'pt-8' : ''}`}>
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900">Odontix</span>
        </div>
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
