import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScenarioTriggerBar } from './components/ScenarioTriggerBar';
import { PipelineTracker } from './components/PipelineTracker';
import { AlertDetailView } from './components/AlertDetailView';
import { RecoveryPlanComparison } from './components/RecoveryPlanComparison';
import { ProductionScheduleGantt } from './components/ProductionScheduleGantt';
import { MachineStatusGrid } from './components/MachineStatusGrid';
import { OrdersTable } from './components/OrdersTable';
import { MaterialInventoryBar } from './components/MaterialInventoryBar';
import { RippleGraphModal } from './components/RippleGraphModal';
import { GroundedChatDrawer } from './components/GroundedChatDrawer';

import { FactoryState, PipelineResult } from './types';
import { fetchFactoryState, resetFactory, triggerDisruption, executePlan } from './services/api';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { LoginPage, UserProfile } from './components/LoginPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pulse_operator');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [factoryState, setFactoryState] = useState<FactoryState | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isExecutingPlan, setIsExecutingPlan] = useState<boolean>(false);
  const [executedPlanId, setExecutedPlanId] = useState<string | null>(null);

  // Staged progression counter for visual pacing (0: none, 1: sentinel, 2: impact, 3: strategist, 4: oracle)
  const [revealedStageIndex, setRevealedStageIndex] = useState<number>(0);

  const [isGraphOpen, setIsGraphOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial factory baseline
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
    loadState();
  }, []);

  // Handle Disruption Trigger
  const handleTrigger = async (text: string, scenarioId?: string) => {
    setIsLoadingPipeline(true);
    setErrorMessage(null);
    setExecutedPlanId(null);
    setRevealedStageIndex(0);

    try {
      // 1. Call atomic backend pipeline
      const result = await triggerDisruption(text, scenarioId);
      setPipelineResult(result);

      // 2. Progressive staged reveal for hackathon presentation pacing (~450ms per agent)
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
        }, 450);
      }, 450);
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

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pulse_operator', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pulse_operator');
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const activeDisruption = factoryState?.active_disruptions?.[0];

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        factoryState={factoryState}
        currentUser={currentUser}
        onLogout={handleLogout}
        onReset={handleReset}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        isResetting={isResetting}
      />

      {/* Disruption Scenario Trigger Strip */}
      <ScenarioTriggerBar
        onTrigger={handleTrigger}
        isLoading={isLoadingPipeline}
        activeEntity={activeDisruption?.entity}
      />

      {/* Pipeline Status Strip (Sentinel -> Impact -> Strategist -> Oracle) */}
      <PipelineTracker
        pipelineResult={pipelineResult}
        isRunning={isLoadingPipeline}
        revealedStageIndex={revealedStageIndex}
      />

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 lg:px-6 mt-4 w-full">
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2 shadow-lg">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Cockpit Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6 py-6 space-y-6">
        {/* Disruption Active Context & Plan Comparison */}
        {pipelineResult && revealedStageIndex >= 2 && (
          <AlertDetailView
            event={pipelineResult.event}
            impact={pipelineResult.impact}
            onOpenGraph={() => setIsGraphOpen(true)}
          />
        )}

        {pipelineResult && revealedStageIndex >= 4 && (
          <RecoveryPlanComparison
            plans={pipelineResult.plans}
            onExecutePlan={handleExecutePlan}
            isExecuting={isExecutingPlan}
            executedPlanId={executedPlanId}
          />
        )}

        {/* State-Driven Production Schedule Gantt */}
        {factoryState && (
          <ProductionScheduleGantt
            schedule={factoryState.schedule}
            machines={factoryState.machines}
            orders={factoryState.orders}
            activeDisruption={activeDisruption}
          />
        )}

        {/* Telemetry & Registry Grid: Machines + Orders */}
        {factoryState && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <MachineStatusGrid
                machines={factoryState.machines}
                activeDisruptedEntity={activeDisruption?.entity}
              />
            </div>
            <div className="lg:col-span-7">
              <OrdersTable orders={factoryState.orders} />
            </div>
          </div>
        )}

        {/* Material Buffer Bar */}
        {factoryState && (
          <MaterialInventoryBar
            materials={factoryState.materials}
            disruptedMaterialId={activeDisruption?.entity}
          />
        )}
      </main>

      {/* React Flow Ripple Effect Modal */}
      <RippleGraphModal
        impact={pipelineResult?.impact || null}
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
      />

      {/* Grounded Operations Co-Pilot Drawer */}
      <GroundedChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Cockpit Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] px-6 py-4 mt-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>PULSE Core Engine: Deterministic Python 3.13 + FastGraph Traversal</span>
          </div>
          <div>Multi-Agent Factory Operations Cockpit • Hackathon Prototype</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
