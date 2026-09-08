import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { X, Network, AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ImpactReport } from '../types';

interface RippleGraphModalProps {
  impact: ImpactReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RippleGraphModal: React.FC<RippleGraphModalProps> = ({
  impact,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !impact) return null;

  // Convert ImpactReport's ripple_nodes and ripple_edges into ReactFlow nodes & edges with automatic tiered layout
  const { nodes, edges } = useMemo(() => {
    if (!impact) return { nodes: [], edges: [] };

    // Categorize nodes by type for tiered layout
    const sourceNodes: any[] = [];
    const machineNodes: any[] = [];
    const opNodes: any[] = [];
    const orderNodes: any[] = [];
    const deliveryNodes: any[] = [];
    const otherNodes: any[] = [];

    impact.ripple_nodes.forEach((n) => {
      if (n.type === 'source') sourceNodes.push(n);
      else if (n.type === 'machine') machineNodes.push(n);
      else if (n.type === 'operation') opNodes.push(n);
      else if (n.type === 'order') orderNodes.push(n);
      else if (n.type === 'impact') deliveryNodes.push(n);
      else otherNodes.push(n);
    });

    const flowNodes: Node[] = [];

    // Helper to assign positions
    const placeNodes = (arr: any[], x: number, startY: number = 80, spacingY: number = 100) => {
      arr.forEach((n, idx) => {
        const isCritical = n.status === 'critical';
        const isImpacted = n.status === 'impacted';

        flowNodes.push({
          id: n.id,
          position: { x, y: startY + idx * spacingY },
          data: {
            label: (
              <div className="p-2.5 rounded-lg text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-0.5">
                  {n.type}
                </div>
                <div className="text-xs font-bold">{n.label}</div>
                {n.details?.deadline && (
                  <div className="text-[10px] text-rose-300 font-mono mt-1">
                    Deadline: {n.details.deadline} | Rev: {n.details.revenue}
                  </div>
                )}
              </div>
            ),
          },
          style: {
            background: isCritical
              ? 'rgba(127, 29, 29, 0.85)'
              : isImpacted
              ? 'rgba(120, 53, 15, 0.85)'
              : 'rgba(15, 23, 42, 0.9)',
            color: '#FFFFFF',
            border: isCritical
              ? '2px solid #EF4444'
              : isImpacted
              ? '2px solid #F59E0B'
              : '1px solid #334155',
            borderRadius: '10px',
            width: 190,
            boxShadow: isCritical
              ? '0 0 20px rgba(239, 68, 68, 0.4)'
              : '0 4px 12px rgba(0,0,0,0.3)',
          },
        });
      });
    };

    placeNodes(sourceNodes, 40, 120, 110);
    placeNodes(machineNodes, 270, 100, 120);
    placeNodes(opNodes, 500, 80, 100);
    placeNodes(orderNodes, 730, 60, 110);
    placeNodes(deliveryNodes, 960, 60, 110);
    placeNodes(otherNodes, 1190, 80, 100);

    const flowEdges: Edge[] = impact.ripple_edges.map((e, idx) => ({
      id: e.id || `edge-${idx}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated ?? true,
      style: {
        stroke: e.is_critical_path ? '#EF4444' : '#00F0FF',
        strokeWidth: e.is_critical_path ? 2.5 : 1.5,
      },
      labelStyle: {
        fill: e.is_critical_path ? '#FCA5A5' : '#7DD3FC',
        fontSize: 10,
        fontWeight: 600,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.is_critical_path ? '#EF4444' : '#00F0FF',
      },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [impact]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#0A0E1A] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Dynamic Dependency & Ripple Effect Visualizer
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800">
                  Critical Impact Chain
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Root Cause: <strong className="text-rose-300">{impact.disrupted_entity}</strong> ({impact.downtime_hours}h downtime) → At-risk Orders: {impact.at_risk_orders.join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#1E293B" gap={20} variant={BackgroundVariant.Dots} />
            <Controls className="bg-slate-900 border border-slate-700 rounded-lg text-white" />
          </ReactFlow>

          {/* Floating Impact Summary Pill */}
          <div className="absolute bottom-4 left-6 z-10 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-slate-400">Halted Operations:</span>
              <strong className="text-rose-400 font-mono">{impact.affected_operations.length}</strong>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Orders at Risk:</span>
              <strong className="text-amber-400 font-mono">{impact.at_risk_orders.length}</strong>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Deadline Breaches:</span>
              <strong className="text-rose-400 font-mono">{impact.deadline_violations.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
