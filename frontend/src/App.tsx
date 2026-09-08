import React, { useState, useEffect } from 'react';
import { CockpitSidebar, CockpitTab } from './components/cockpit/CockpitSidebar';
import { CockpitHeader } from './components/cockpit/CockpitHeader';
import { IncidentBanner } from './components/cockpit/IncidentBanner';
import { AgentCascadeRail } from './components/cockpit/AgentCascadeRail';
import { ShopFloorGantt } from './components/cockpit/ShopFloorGantt';
import { BlastRadiusTopology } from './components/cockpit/BlastRadiusTopology';
import { RecoveryPlanMatrix } from './components/cockpit/RecoveryPlanMatrix';
import { FloatingCoPilotDrawer } from './components/cockpit/FloatingCoPilotDrawer';

import { MachineStatusGrid } from './components/MachineStatusGrid';
import { OrdersTable } from './components/OrdersTable';
import { MaterialInventoryBar } from './components/MaterialInventoryBar';
import { RippleGraphModal } from './components/RippleGraphModal';
import { PipelineTracker } from './components/PipelineTracker';
import { AlertDetailView } from './components/AlertDetailView';

import { Router, useRouter } from './components/router/Router';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { authService, UserProfile } from './services/authService';

import { FactoryState, PipelineResult, MachineFormData } from './types';
import { fetchFactoryState, resetFactory, triggerDisruption, executePlan, createMachine, updateMachine, deleteMachine } from './services/api';
import { AddMachineModal } from './components/cockpit/AddMachineModal';
import { ImportFactoryDataModal } from './components/cockpit/ImportFactoryDataModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { pathname, navigate } = useRouter();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return authService.getCurrentUser();
  });

  const [activeTab, setActiveTab] = useState<CockpitTab>('tactical-overview');
  const [factoryState, setFactoryState] = useState<FactoryState | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isExecutingPlan, setIsExecutingPlan] = useState<boolean>(false);
  const [executedPlanId, setExecutedPlanId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Staged progression counter (0: none, 1: sentinel, 2: impact, 3: strategist, 4: oracle)
  const [revealedStageIndex, setRevealedStageIndex] = useState<number>(0);

  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
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
      setRevealedStageIndex(0);
      setExecutedPlanId(null);
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
    setToastMessage(`Workstation ${machineId} status changed to ${status.toUpperCase()}.`);
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
  const healthScore = factoryState?.health_score ?? 94.0;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container font-sans flex">
      {/* 1. Fixed Left Sidebar */}
      <CockpitSidebar
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        activeDisruptionCount={activeDisruption ? 1 : 0}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      {/* 2. Main Content Wrapper (pl-64 for sidebar offset) */}
      <div className="pl-64 w-full flex flex-col min-h-screen">
        {/* Fixed Top Header (left-64) */}
        <CockpitHeader
          healthScore={healthScore}
          currentUser={currentUser}
          onTriggerScenario={handleTrigger}
          onResetFactory={handleReset}
          onLogout={handleLogout}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isTriggering={isLoadingPipeline}
          isResetting={isResetting}
          activeScenarioId={activeScenarioId}
        />

        {/* Workspace Body (pt-16 for header offset) */}
        <main className="relative pt-16 bg-surface-container-lowest min-h-screen w-full flex-1">
          <div className="flex flex-col w-full text-on-surface p-space-md gap-space-md">
            {/* Error Alert if any */}
            {errorMessage && (
              <div className="p-3 rounded bg-error-container/80 border border-error text-on-error-container text-xs flex items-center gap-2 shadow-lg animate-shake font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 text-error" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB: Tactical Overview (Primary 16-Column Mission Control) */}
            {activeTab === 'tactical-overview' && (
              <>
                {/* Top Zone: Live Incident Ticker & Telemetry Micro-Pills */}
                <IncidentBanner
                  activeDisruption={activeDisruption}
                  ordersAtRiskCount={atRiskOrdersCount}
                  isMitigating={isLoadingPipeline}
                />

                {/* 16-Column Tactical Cockpit Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-16 gap-space-md items-start">
                  {/* Left Rail (4 cols): Multi-Agent Cascade */}
                  <AgentCascadeRail
                    pipelineResult={pipelineResult}
                    revealedStageIndex={revealedStageIndex}
                    isRunning={isLoadingPipeline}
                  />

                  {/* Center & Right Workspace (12 cols) */}
                  <div className="xl:col-span-12 flex flex-col gap-space-md">
                    {/* Stage 1: Shop Floor Gantt Schedule */}
                    <ShopFloorGantt
                      schedule={factoryState?.schedule || []}
                      machines={factoryState?.machines || []}
                      orders={factoryState?.orders || []}
                      activeDisruption={activeDisruption}
                      executedPlanId={executedPlanId}
                    />

                    {/* Stage 2: Blast Radius & Reroute Topology */}
                    <BlastRadiusTopology
                      impact={pipelineResult?.impact || null}
                      onOpenGraphModal={() => setIsGraphOpen(true)}
                      isRecovered={Boolean(executedPlanId)}
                    />

                    {/* Stage 3: Candidate Recovery Plans Matrix */}
                    <RecoveryPlanMatrix
                      plans={pipelineResult?.plans || []}
                      onExecutePlan={handleExecutePlan}
                      isExecuting={isExecutingPlan}
                      executedPlanId={executedPlanId}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB: Telemetry Feeds */}
            {activeTab === 'telemetry-stream' && factoryState && (
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-xs">
                  <h2 className="font-mono text-headline-sm uppercase font-bold text-primary">
                    Shop Floor Hardware &amp; Material Telemetry
                  </h2>
                  <span className="font-mono text-xs text-on-surface-variant">
                    6 Machines Online • Continuous Ingest 12.4k msg/s
                  </span>
                </div>
                <MachineStatusGrid
                  machines={factoryState.machines}
                  activeDisruptedEntity={activeDisruption?.entity}
                  onOpenAddModal={() => setIsAddMachineOpen(true)}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onStatusChange={handleMachineStatusChange}
                  onDeleteMachine={handleDeleteMachine}
                />
                <MaterialInventoryBar
                  materials={factoryState.materials}
                  disruptedMaterialId={activeDisruption?.entity}
                />
              </div>
            )}

            {/* TAB: Autonomous Agents */}
            {activeTab === 'agent-orchestration' && (
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-xs">
                  <h2 className="font-mono text-headline-sm uppercase font-bold text-secondary">
                    Autonomous Multi-Agent Consensus Engine
                  </h2>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Deterministic Graph Solver + Monte Carlo Simulation
                  </span>
                </div>
                <PipelineTracker
                  pipelineResult={pipelineResult}
                  isRunning={isLoadingPipeline}
                  revealedStageIndex={revealedStageIndex}
                />
                {pipelineResult?.impact && (
                  <AlertDetailView
                    event={pipelineResult.event}
                    impact={pipelineResult.impact}
                    onOpenGraph={() => setIsGraphOpen(true)}
                  />
                )}
              </div>
            )}

            {/* TAB: Clash Matrix */}
            {activeTab === 'incident-clash-matrix' && factoryState && (
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-xs">
                  <h2 className="font-mono text-headline-sm uppercase font-bold text-error">
                    Active Clash Matrix &amp; Customer Order Risk Registry
                  </h2>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {atRiskOrdersCount} Orders Threatening SLA Penalties
                  </span>
                </div>
                <OrdersTable orders={factoryState.orders} />
                <BlastRadiusTopology
                  impact={pipelineResult?.impact || null}
                  onOpenGraphModal={() => setIsGraphOpen(true)}
                  isRecovered={Boolean(executedPlanId)}
                />
              </div>
            )}

            {/* TAB: Hardware Topology */}
            {activeTab === 'hardware-health' && factoryState && (
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-xs">
                  <h2 className="font-mono text-headline-sm uppercase font-bold text-on-surface">
                    Physical Digital Twin &amp; Hardware Cell Diagnostic Map
                  </h2>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Facility: {factoryState.factory_info.name}
                  </span>
                </div>
                <MachineStatusGrid
                  machines={factoryState.machines}
                  activeDisruptedEntity={activeDisruption?.entity}
                  onOpenAddModal={() => setIsAddMachineOpen(true)}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onStatusChange={handleMachineStatusChange}
                  onDeleteMachine={handleDeleteMachine}
                />
                <ShopFloorGantt
                  schedule={factoryState.schedule}
                  machines={factoryState.machines}
                  orders={factoryState.orders}
                  activeDisruption={activeDisruption}
                  executedPlanId={executedPlanId}
                />
              </div>
            )}
          </div>
        </main>

        {/* Cockpit Footer */}
        <footer className="border-t border-outline-variant/30 bg-surface-container-low px-6 py-3 font-mono text-xs text-on-surface-variant">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span>PULSE AI-Powered Production Disruption &amp; Recovery Intelligence</span>
            </div>
            <div className="text-[11px] text-outline">
              Target: CNC &amp; Precision Manufacturing • FastGraph Autonomous Engine v4.19
            </div>
          </div>
        </footer>
      </div>

      {/* React Flow Ripple Effect Modal */}
      <RippleGraphModal
        impact={pipelineResult?.impact || null}
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
      />

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

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container-high border border-primary/50 text-on-surface shadow-2xl backdrop-blur-md animate-fade-in font-mono text-xs">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-primary">{toastMessage}</span>
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
