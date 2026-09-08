import React, { useState, useEffect } from 'react';
import { CockpitSidebar, CockpitTab } from './components/cockpit/CockpitSidebar';
import { CockpitHeader } from './components/cockpit/CockpitHeader';
import { DashboardOverview } from './components/cockpit/DashboardOverview';
import { MachinesPage } from './components/cockpit/MachinesPage';
import { OrdersPage } from './components/cockpit/OrdersPage';
import { SchedulePage } from './components/cockpit/SchedulePage';
import { AlertsPage } from './components/cockpit/AlertsPage';
import { AgentsPage } from './components/cockpit/AgentsPage';
import { RecoveryPlansPage } from './components/cockpit/RecoveryPlansPage';
import { DataImportPage } from './components/cockpit/DataImportPage';
import { SettingsPage } from './components/cockpit/SettingsPage';

import { AddMachineModal } from './components/cockpit/AddMachineModal';
import { ImportFactoryDataModal } from './components/cockpit/ImportFactoryDataModal';
import { FloatingCoPilotDrawer } from './components/cockpit/FloatingCoPilotDrawer';
import { RippleGraphModal } from './components/RippleGraphModal';

import { Router, useRouter } from './components/router/Router';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { authService, UserProfile } from './services/authService';

import { FactoryState, PipelineResult, MachineFormData } from './types';
import {
  fetchFactoryState,
  resetFactory,
  triggerDisruption,
  executePlan,
  createMachine,
  updateMachine,
  deleteMachine,
} from './services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { pathname, navigate } = useRouter();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return authService.getCurrentUser();
  });

  const [activeTab, setActiveTab] = useState<CockpitTab>('dashboard');
  const [factoryState, setFactoryState] = useState<FactoryState | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isExecutingPlan, setIsExecutingPlan] = useState<boolean>(false);
  const [executedPlanId, setExecutedPlanId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Staged progression counter (0: none, 1: sentinel, 2: impact, 3: strategist, 4: oracle)
  const [revealedStageIndex, setRevealedStageIndex] = useState<number>(4);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Protected Route Enforcement: Unauthenticated users are redirected to /login
  useEffect(() => {
    if (!currentUser && pathname !== '/login' && pathname !== '/register') {
      navigate('/login', true);
    }
  }, [currentUser, pathname, navigate]);

  // Load initial factory baseline when user is authenticated
  const loadState = async () => {
    try {
      const data = await fetchFactoryState();
      setFactoryState(data);
      if (data.last_pipeline_result) {
        setPipelineResult(data.last_pipeline_result);
        setRevealedStageIndex(4);
      }
    } catch (err: any) {
      console.error('Failed to load factory state:', err);
      setErrorMessage('Could not connect to PULSE backend. Ensure FastAPI is running on port 8000.');
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadState();
    }
  }, [currentUser]);

  // Handle Disruption Trigger
  const handleTrigger = async (text: string, scenarioId?: string) => {
    setIsLoadingPipeline(true);
    setErrorMessage(null);
    setExecutedPlanId(null);
    setRevealedStageIndex(0);
    setActiveScenarioId(scenarioId || 'CUSTOM');

    try {
      // 1. Call atomic backend pipeline
      const result = await triggerDisruption(text, scenarioId);
      setPipelineResult(result);

      // 2. Progressive staged reveal for hackathon presentation pacing (~400ms per agent)
      setRevealedStageIndex(1); // Sentinel completes
      setTimeout(() => {
        setRevealedStageIndex(2); // Impact completes
        setTimeout(() => {
          setRevealedStageIndex(3); // Strategist completes
          setTimeout(async () => {
            setRevealedStageIndex(4); // Oracle completes
            setIsLoadingPipeline(false);
            // Refresh digital twin state to reflect schedule clashes and machine failure
            await loadState();
            setToastMessage(`Disruption ${scenarioId || 'detected'}: Autonomous Sentinel, Impact, Strategist, Oracle executed.`);
            setTimeout(() => setToastMessage(null), 5000);
          }, 450);
        }, 400);
      }, 400);
    } catch (err: any) {
      setIsLoadingPipeline(false);
      setErrorMessage(err.message || 'Error executing disruption pipeline.');
    }
  };

  // Handle Plan Execution
  const handleExecutePlan = async (planId: string) => {
    setIsExecutingPlan(true);
    try {
      const res = await executePlan(planId);
      setExecutedPlanId(planId);
      setFactoryState(res.factory_state);
      setToastMessage(`Recovery Plan ${planId} successfully executed and committed to digital twin.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to execute recovery plan.');
    } finally {
      setIsExecutingPlan(false);
    }
  };

  // Handle Reset Factory
  const handleReset = async () => {
    setIsResetting(true);
    setErrorMessage(null);
    setActiveScenarioId(null);
    try {
      const pristineState = await resetFactory();
      setFactoryState(pristineState);
      setPipelineResult(null);
      setRevealedStageIndex(4);
      setExecutedPlanId(null);
      setToastMessage('Factory nominal baseline successfully restored.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset factory.');
    } finally {
      setIsResetting(false);
    }
  };

  // Workstation Management Handlers
  const handleAddMachine = async (data: MachineFormData) => {
    await createMachine(data);
    await loadState();
    setToastMessage(`Workstation ${data.id || data.name} provisioned to live digital twin.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMachineStatusChange = async (machineId: string, status: string) => {
    await updateMachine(machineId, { status: status as any });
    await loadState();
    setToastMessage(`Workstation ${machineId} status updated to ${status.toUpperCase()}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteMachine = async (machineId: string) => {
    await deleteMachine(machineId);
    await loadState();
    setToastMessage(`Workstation ${machineId} successfully decommissioned.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImportSuccess = async (result: any) => {
    await loadState();
    setToastMessage(result.message || 'Factory data successfully ingested into digital twin.');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  // Route: /register
  if (pathname === '/register') {
    return <RegisterPage onRegisterSuccess={handleLoginSuccess} />;
  }

  // Route: /login or unauthenticated access
  if (pathname === '/login' || !currentUser) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  const activeDisruption = factoryState?.active_disruptions?.[0];
  const atRiskOrdersCount = factoryState?.orders?.filter((o) => o.status === 'at_risk' || o.status === 'delayed').length || 0;

  // Normalize tab
  const normalizedTab =
    activeTab === 'tactical-overview'
      ? 'dashboard'
      : activeTab === 'telemetry-stream' || activeTab === 'hardware-health'
      ? 'machines'
      : activeTab === 'agent-orchestration'
      ? 'agents'
      : activeTab === 'incident-clash-matrix'
      ? 'alerts'
      : activeTab;

  return (
    <div className="min-h-screen bg-[#070D17] text-slate-200 antialiased font-sans flex">
      {/* 1. Fixed Top Header */}
      <CockpitHeader
        currentUser={currentUser}
        onTriggerScenario={handleTrigger}
        onResetFactory={handleReset}
        onLogout={handleLogout}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isTriggering={isLoadingPipeline}
        isResetting={isResetting}
        activeScenarioId={activeScenarioId}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && normalizedTab === 'dashboard') {
            setActiveTab('machines');
          }
        }}
        unreadAlertCount={activeDisruption ? 1 : 0}
      />

      {/* 2. Fixed Left Sidebar */}
      <CockpitSidebar
        activeTab={normalizedTab}
        onTabChange={(t) => setActiveTab(t)}
        activeDisruptionCount={activeDisruption ? 1 : 0}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      {/* 3. Main Workspace Body (offset pl-64 for sidebar, pt-16 for header) */}
      <div className="pl-64 w-full flex flex-col min-h-screen">
        <main className="relative pt-20 px-6 bg-[#070D17] min-h-screen w-full flex-1">
          {/* Error notification banner if any */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs flex items-center gap-2 shadow-lg font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Dashboard (Overview) matching the reference image */}
          {normalizedTab === 'dashboard' && (
            <DashboardOverview
              factoryState={factoryState}
              userName={currentUser?.name?.split(' ')[0] || 'Snehansh'}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddMachine={() => setIsAddMachineOpen(true)}
              onOpenImport={() => setIsImportModalOpen(true)}
              onOpenRecovery={() => setActiveTab('recovery')}
              onToggleChat={() => setIsChatOpen(true)}
              activeDisruptionCount={activeDisruption ? 1 : 0}
            />
          )}

          {/* TAB 2: Machines / Workstations */}
          {normalizedTab === 'machines' && (
            <MachinesPage
              machines={factoryState?.machines || []}
              onOpenAddModal={() => setIsAddMachineOpen(true)}
              onStatusChange={handleMachineStatusChange}
              onDeleteMachine={handleDeleteMachine}
            />
          )}

          {/* TAB 3: Production Orders */}
          {normalizedTab === 'orders' && (
            <OrdersPage orders={factoryState?.orders || []} />
          )}

          {/* TAB 4: Production Schedule */}
          {normalizedTab === 'schedule' && (
            <SchedulePage
              schedule={factoryState?.schedule || []}
              machines={factoryState?.machines || []}
              orders={factoryState?.orders || []}
              activeDisruptionCount={activeDisruption ? 1 : 0}
            />
          )}

          {/* TAB 5: Alerts / Incidents */}
          {normalizedTab === 'alerts' && (
            <AlertsPage
              activeDisruption={activeDisruption}
              pipelineResult={pipelineResult}
              onTriggerScenario={handleTrigger}
              onNavigateToRecovery={() => setActiveTab('recovery')}
              isTriggering={isLoadingPipeline}
            />
          )}

          {/* TAB 6: Intelligence Agents */}
          {normalizedTab === 'agents' && (
            <AgentsPage
              pipelineResult={pipelineResult}
              isRunning={isLoadingPipeline}
              revealedStageIndex={revealedStageIndex}
            />
          )}

          {/* TAB 7: Recovery Plans */}
          {normalizedTab === 'recovery' && (
            <RecoveryPlansPage
              plans={pipelineResult?.plans || []}
              onExecutePlan={handleExecutePlan}
              isExecuting={isExecutingPlan}
              executedPlanId={executedPlanId}
            />
          )}

          {/* TAB 8: Data Import */}
          {normalizedTab === 'import' && (
            <DataImportPage onOpenImportModal={() => setIsImportModalOpen(true)} />
          )}

          {/* TAB 9: Settings */}
          {normalizedTab === 'settings' && (
            <SettingsPage
              factoryState={factoryState}
              onResetFactory={handleReset}
              isResetting={isResetting}
            />
          )}
        </main>
      </div>

      {/* Floating Mission Control Factory Co-Pilot Chat Drawer */}
      <FloatingCoPilotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Add Workstation Modal */}
      <AddMachineModal
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onSubmit={handleAddMachine}
      />

      {/* Import Factory Data Onboarding Modal */}
      <ImportFactoryDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* React Flow Blast Radius Modal */}
      <RippleGraphModal
        impact={pipelineResult?.impact || null}
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0B1320] border border-[#00F2FE]/50 text-white shadow-2xl backdrop-blur-md animate-fade-in font-sans text-xs">
          <CheckCircle2 className="h-4 w-4 text-[#00F2FE] shrink-0" />
          <span className="font-semibold text-slate-100">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
