import {
  MachineState,
  MaterialState,
  OrderState,
  ScheduleSlot,
  DisruptionEvent,
  ImpactReport,
  RecoveryPlan,
  PipelineResult,
  AgentStepResult,
  FactoryState,
  RippleNode,
  RippleEdge,
  RootCauseCategory,
  ROOT_CAUSE_BENCHMARKS,
} from '../types';

const CUSTOMER_MAP: Record<string, string> = {
  'ORD-101': 'AeroTech Systems',
  'ORD-102': 'Nordic Robotics',
  'ORD-103': 'Apex Mobility',
  'ORD-104': 'Bhartiya Defense Works',
  'ORD-105': 'Solaria Green Energy',
  'ORD-106': 'Zenith Instruments',
  'ORD-107': 'Vanguard Medical',
};

export function adaptMachines(rawMachines: any[] = [], rawSchedule: any[] = []): MachineState[] {
  return rawMachines.map((m) => {
    const isOffline = m.status === 'offline' || m.status === 'failed';
    const isRepairing = m.status === 'repairing' || m.status === 'backup_rerouted';
    const isMaintenance = m.status === 'maintenance';
    const isIdle = m.status === 'idle';

    let status: MachineState['status'] = 'operational';
    if (isOffline) status = 'failed';
    else if (isRepairing) status = 'degraded';
    else if (isMaintenance) status = 'maintenance';
    else if (isIdle) status = 'idle';

    // Count scheduled tasks on this machine or use configured utilization
    const taskCount = rawSchedule.filter((s) => s.resource_id === m.id).length;
    let utilization = isOffline ? 0 : (m.current_utilization ?? m.utilization ?? Math.min(95, Math.max(50, taskCount * 22)));

    // Department inference fallback
    const dept = m.department || (
      m.type?.includes('Assembly') ? 'Assembly' :
      m.type?.includes('Finishing') ? 'Finishing' :
      m.type?.includes('Inspection') || m.type?.includes('Quality') ? 'Quality Control' :
      m.type?.includes('Packaging') ? 'Packaging' : 'Precision Machining'
    );

    return {
      id: m.id,
      name: m.name || m.id,
      type: m.type || 'CNC Machine',
      department: dept,
      status,
      capacity_per_hour: m.capacity_per_hour || 30,
      current_utilization: utilization,
      max_utilization: 100,
      operating_cost_per_hour: 1800,
      overtime_cost_per_hour: m.overtime_cost_per_hour || 2000,
      overtime_available: m.overtime_available ?? true,
      supported_operations: m.supported_products?.map((p: string) => `PROD_${p}`) || ['CNC_MACHINING'],
      capabilities: m.capabilities || [],
      supported_products: m.supported_products || [],
      notes: m.notes,
      strategic_importance: m.strategic_importance || 'high',
      is_custom: m.is_custom ?? false,
    };
  });
}

export function adaptMaterials(rawMaterials: any[] = []): MaterialState[] {
  return rawMaterials.map((mat) => ({
    id: mat.id,
    name: mat.name || mat.id,
    available_quantity: mat.current_stock ?? 1000,
    safety_stock: mat.safety_stock ?? 400,
    unit: mat.unit || 'units',
    unit_cost: mat.id === 'M-AL' ? 420 : mat.id === 'M-FAST' ? 15 : 310,
    supplier: mat.supplier || 'Global Logistics',
    lead_time_days: Math.max(1, Math.round((mat.lead_time_hours || 48) / 24)),
    consumed_by_operations: Object.keys(mat.used_by || {}).map((k) => `PROD_${k}`),
  }));
}

export function adaptOrders(rawOrders: any[] = []): OrderState[] {
  return rawOrders.map((ord) => {
    const prioLower = (ord.priority || 'medium').toLowerCase() as OrderState['priority'];
    const risk = ord.risk_status || 'none';

    let status: OrderState['status'] = 'on_schedule';
    let delay_hours = 0.0;

    if (risk === 'mitigated') {
      status = 'recovered';
      delay_hours = 0.0;
    } else if (risk === 'critical' || risk === 'high') {
      status = 'at_risk';
      delay_hours = 6.0;
    } else if (risk === 'medium') {
      status = 'delayed';
      delay_hours = 2.0;
    }

    return {
      id: ord.id,
      customer: CUSTOMER_MAP[ord.id] || `Industrial Client ${ord.id}`,
      product: ord.product || 'Standard Assembly',
      priority: prioLower,
      deadline_hours: ord.deadline_hour || 24,
      required_quantity: ord.quantity || 100,
      current_stage: ord.product === 'AX-200' ? 'PRECISION_CNC' : 'CNC',
      material_id: 'M-AL',
      material_needed: ord.quantity || 100,
      required_operations: ['CNC_MACHINING', 'SURFACE_FINISHING', 'ASSEMBLY', 'QUALITY_CHECK', 'PACKAGING'],
      status,
      delay_hours,
      revenue_value: ord.value || 250000,
    };
  });
}

export function adaptSchedule(
  rawSchedule: any[] = [],
  failedMachineIds: string[] = [],
  activeEvents: any[] = []
): ScheduleSlot[] {
  const isCnc02Failure = activeEvents.some((e) => e.entity_id === 'CNC-02' && e.status === 'active');

  return rawSchedule.map((s) => {
    const isFailedMachine = failedMachineIds.includes(s.resource_id);
    const isReroutedSlot = s.resource_id === 'CNC-01' && (s.order_id === 'ORD-103' || s.order_id === 'ORD-104');
    const isDelayedSlot = s.order_id === 'ORD-105' && s.start_hour >= 12;

    let status: ScheduleSlot['status'] = 'scheduled';
    if (isFailedMachine && isCnc02Failure) {
      status = 'clash';
    } else if (isReroutedSlot) {
      status = 'rerouted';
    } else if (isDelayedSlot) {
      status = 'delayed';
    }

    return {
      id: s.id,
      order_id: s.order_id,
      machine_id: s.resource_id,
      operation: s.operation || 'CNC_MACHINING',
      start_hour: s.start_hour || 0,
      duration_hours: (s.end_hour - s.start_hour) || 4,
      status,
    };
  });
}

export function buildRippleGraph(event: any, impact: any): { nodes: RippleNode[]; edges: RippleEdge[] } {
  const entityId = event?.entity_id || 'CNC-02';
  const affectedOrders: string[] = impact?.affected_order_ids || ['ORD-103', 'ORD-104'];
  const downstream: any[] = impact?.downstream_impact || [];
  const category = (event?.root_cause_category || 'equipment_failure') as RootCauseCategory;
  const benchmark = ROOT_CAUSE_BENCHMARKS[category] || ROOT_CAUSE_BENCHMARKS.equipment_failure;

  const nodes: RippleNode[] = [
    // Tier 1: Disruption Source
    {
      id: 'node-source',
      label: `${entityId} • ${benchmark.label} (${benchmark.share_pct})`,
      type: 'source',
      status: 'critical',
      details: {
        cause: event?.details?.raw_message || `${entityId} stoppage (${event?.duration_hours || 6}h)`,
        category: benchmark.label,
        downtime_share: benchmark.share_pct,
        stoppage_share: benchmark.stoppage_share,
        early_signature: benchmark.early_signature,
        severity: event?.severity || 'Critical'
      },
    },
    // Tier 2: Failed Machine
    {
      id: `node-${entityId}`,
      label: `${entityId} (Precision CNC)`,
      type: 'machine',
      status: 'critical',
      details: { capacity_lost: '180 units', status: 'Offline' },
    },
    // Tier 2: Backup Machine Headroom
    {
      id: 'node-CNC-01',
      label: 'CNC-01 (Backup Cell)',
      type: 'machine',
      status: 'healthy',
      details: { available_headroom: '150 units', overtime_ready: true },
    },
  ];

  const edges: RippleEdge[] = [
    {
      id: 'edge-s1',
      source: 'node-source',
      target: `node-${entityId}`,
      label: 'Emergency Shutdown',
      animated: true,
      is_critical_path: true,
    },
  ];

  // Tier 3: Downstream Stations
  downstream.forEach((d, idx) => {
    const resId = d.resource || `RES-${idx}`;
    nodes.push({
      id: `node-${resId}`,
      label: `${resId} (${d.impact || 'Starvation'})`,
      type: 'operation',
      status: 'impacted',
      details: { reason: d.reason },
    });

    edges.push({
      id: `edge-m-op-${resId}`,
      source: `node-${entityId}`,
      target: `node-${resId}`,
      label: 'Part Starvation',
      animated: true,
      is_critical_path: true,
    });
  });

  // Tier 4: Affected Orders
  affectedOrders.forEach((ordId) => {
    const isCritical = ordId === 'ORD-103';
    nodes.push({
      id: `node-${ordId}`,
      label: `${ordId} [${isCritical ? 'Critical' : 'High'}]`,
      type: 'order',
      status: isCritical ? 'critical' : 'impacted',
      details: { deadline: isCritical ? 'Hour 10' : 'Hour 20', product: 'AX-200' },
    });

    edges.push({
      id: `edge-op-ord-${ordId}`,
      source: `node-${entityId}`,
      target: `node-${ordId}`,
      label: isCritical ? 'Deadline Threat' : 'Delay Risk',
      animated: true,
      is_critical_path: isCritical,
    });
  });

  // Tier 5: Customer Delivery Impact
  nodes.push({
    id: 'node-delivery-threat',
    label: 'Customer SLA Breach Window',
    type: 'impact',
    status: 'critical',
    details: { penalty: 'Contractual liquidated damages' },
  });

  edges.push({
    id: 'edge-ord-impact',
    source: 'node-ORD-103',
    target: 'node-delivery-threat',
    label: '4h Delay Slip',
    animated: true,
    is_critical_path: true,
  });

  return { nodes, edges };
}

export function adaptBackendPipelineToFrontend(backendResult: any): PipelineResult {
  const event = backendResult.event || {};
  const impact = backendResult.impact || {};
  const plans = backendResult.recovery_plans || [];
  const sims = backendResult.simulation_results || [];
  const recId = backendResult.recommended_plan_id || 'PLAN-B';

  const { nodes: ripple_nodes, edges: ripple_edges } = buildRippleGraph(event, impact);

  const rawCategory = (event.root_cause_category || 'equipment_failure') as RootCauseCategory;
  const benchmark = ROOT_CAUSE_BENCHMARKS[rawCategory] || ROOT_CAUSE_BENCHMARKS.equipment_failure;

  // 1. Disruption Event
  const disruptionEvent: DisruptionEvent = {
    id: event.event_id || 'EVT-001',
    type: event.event_type || 'machine_failure',
    entity: event.entity_id || 'CNC-02',
    duration_hours: event.duration_hours || 6.0,
    quantity_impact: impact.capacity_impact?.lost_capacity_units || 180,
    severity: (event.severity || 'critical').toLowerCase() as DisruptionEvent['severity'],
    description: event.details?.raw_message || `${event.entity_id} failure (${event.duration_hours}h downtime)`,
    source_text: event.details?.raw_message || `URGENT: ${event.entity_id} gearbox vibration exceeded limits. Estimated downtime: ${event.duration_hours} hours.`,
    root_cause_category: rawCategory,
    root_cause_benchmark: benchmark,
  };

  // 2. Impact Report
  const impactReport: ImpactReport = {
    disrupted_entity: event.entity_id || 'CNC-02',
    disruption_type: event.event_type || 'machine_failure',
    downtime_hours: event.duration_hours || 6.0,
    affected_machines: impact.affected_resources || [event.entity_id || 'CNC-02'],
    affected_operations: ['CNC_MACHINING', 'SURFACE_FINISHING', 'ASSEMBLY'],
    at_risk_orders: impact.affected_order_ids || ['ORD-103', 'ORD-104'],
    idle_capacity_options: [
      {
        machine_id: 'CNC-01',
        name: 'CNC Machine 01',
        type: 'Standard CNC',
        current_utilization: 75,
        available_headroom_pct: 25,
        supported_operations: ['CNC_MACHINING', 'PRECISION_CNC'],
        capacity_per_hour: 25,
      },
    ],
    bottlenecks: [`${event.entity_id || 'CNC-02'} (Offline)`, 'ASM-B (Starvation)', 'FIN-01 (Starvation)'],
    deadline_violations: ['ORD-103 (Deadline Hour 10)'],
    ripple_nodes,
    ripple_edges,
    root_cause_summary: `Automatic shutdown on ${event.entity_id || 'CNC-02'} caused ${impact.capacity_impact?.lost_capacity_units || 180} units of lost capacity, threatening delivery deadlines for critical orders ${impact.affected_order_ids?.join(', ') || 'ORD-103, ORD-104'}.`,
  };

  // 3. Recovery Plans
  const adaptedPlans: RecoveryPlan[] = plans.map((p: any) => {
    const isRecommended = p.plan_id === recId;
    const sim = sims.find((s: any) => s.plan_id === p.plan_id) || {};

    let stratType: RecoveryPlan['strategy_type'] = 'REROUTE';
    if (p.plan_id === 'PLAN-C' || p.strategy_type === 'overtime_reroute') stratType = 'OVERTIME';
    else if (p.plan_id === 'PLAN-A' || p.strategy_type === 'full_reroute') stratType = 'SPLIT_BUFFER';

    const score = Math.round((sim.score ?? (isRecommended ? 0.96 : 0.75)) * 100);

    return {
      id: p.plan_id,
      title: p.name || p.plan_id,
      strategy_type: stratType,
      description: p.description || '',
      actions: p.actions?.map((a: any) => a.description || a.action_type) || [],
      feasibility: p.feasible !== false,
      metrics: {
        delay_hours: sim.delay_hours ?? (isRecommended ? 2.0 : 7.5),
        cost_inr: sim.estimated_cost ?? 0,
        orders_saved: sim.orders_saved ?? 2,
        orders_violated: sim.deadline_violations ?? 0,
        machine_utilization_pct: sim.metrics?.average_utilization_pct ?? 74.3,
        risk_level: (sim.deadline_violations > 0 ? 'High' : sim.estimated_cost > 0 ? 'Medium' : 'Low'),
        risk_penalty: (sim.deadline_violations || 0) * 20,
        base_boost: 20,
        score,
        scoring_breakdown: sim.reasoning?.[0] || '40% Deadline Protection + 25% Orders Saved + 20% Cost + 15% Headroom',
      },
      is_recommended: isRecommended,
      recommendation_reason: isRecommended
        ? (backendResult.reasoning?.[0] || 'Protects Critical order ORD-103 (deadline hour 10) with 0 violations at ₹0 overtime cost.')
        : '',
    };
  });

  const recommendedPlan = adaptedPlans.find((p) => p.is_recommended) || adaptedPlans[0];

  // 4. Agent Step Results
  const rawLogs: any[] = backendResult.agent_logs || [];
  const defaultAgentRoles = ['Sentinel', 'Impact', 'Strategist', 'Oracle'];

  const agentSteps: AgentStepResult[] = defaultAgentRoles.map((roleName, idx) => {
    const log = rawLogs.find((l) => l.agent === roleName) || rawLogs[idx];
    return {
      agent_name: roleName,
      status: 'completed',
      latency_ms: 320 + idx * 80,
      summary: log?.message || `${roleName} agent analysis completed successfully.`,
      data: log?.details || {},
    };
  });

  return {
    event: disruptionEvent,
    impact: impactReport,
    plans: adaptedPlans,
    recommended_plan: recommendedPlan,
    agent_steps: agentSteps,
    pipeline_latency_ms: 1420,
  };
}

export function adaptBackendStateToFrontend(
  backendState: any,
  backendPulse?: any,
  lastPipelineResult?: PipelineResult | null
): FactoryState {
  const machines = backendState?.machines || [];
  const materials = backendState?.materials || [];
  const orders = backendState?.orders || [];
  const schedule = backendState?.schedule || [];
  const activeEvents = backendState?.active_events || [];

  const offlineMachineIds = machines.filter((m: any) => m.status === 'offline' || m.status === 'failed').map((m: any) => m.id);

  const pulseScore = backendPulse?.pulse_score ?? backendState?.pulse?.pulse_score ?? 94.0;

  const activeDisruptions: DisruptionEvent[] = activeEvents.map((e: any) => {
    const cat = (e.root_cause_category || 'equipment_failure') as RootCauseCategory;
    const bench = ROOT_CAUSE_BENCHMARKS[cat] || ROOT_CAUSE_BENCHMARKS.equipment_failure;
    return {
      id: e.event_id || 'EVT-001',
      type: e.event_type || 'machine_failure',
      entity: e.entity_id || 'CNC-02',
      duration_hours: e.duration_hours || 6.0,
      quantity_impact: 180,
      severity: (e.severity || 'critical').toLowerCase() as DisruptionEvent['severity'],
      description: e.details?.raw_message || `${e.entity_id} Disruption`,
      source_text: e.details?.raw_message || `${e.entity_id} shutdown`,
      root_cause_category: cat,
      root_cause_benchmark: bench,
    };
  });

  const adaptedSchedule = adaptSchedule(schedule, offlineMachineIds, activeEvents);

  return {
    factory_info: {
      name: 'Apex Precision Manufacturing Hub',
      facility_id: 'FAC-BLR-01',
      location: 'Bengaluru Industrial Corridor',
      operating_hours: 24,
      current_time_offset: 0,
      baseline_health_score: 94,
    },
    health_score: pulseScore,
    machines: adaptMachines(machines, schedule),
    materials: adaptMaterials(materials),
    orders: adaptOrders(orders),
    schedule: adaptedSchedule,
    active_disruptions: activeDisruptions,
    last_pipeline_result: lastPipelineResult,
    recent_alerts: (backendState?.alerts || []).map((a: any) => ({
      id: a.alert_id || 'ALT-01',
      timestamp: a.timestamp || 'Just now',
      severity: a.severity || 'critical',
      message: a.message || a.title || 'Factory Incident Alert',
      root_cause_category: a.root_cause_category || 'equipment_failure',
    })),
  };
}
