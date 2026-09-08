export interface MachineState {
  id: string;
  name: string;
  type: string;
  department?: string;
  status: 'operational' | 'idle' | 'degraded' | 'failed' | 'maintenance' | 'offline';
  capacity_per_hour: number;
  current_utilization: number;
  utilization?: number;
  max_utilization: number;
  operating_cost_per_hour: number;
  overtime_cost_per_hour: number;
  overtime_available?: boolean;
  supported_operations: string[];
  capabilities?: string[];
  supported_products?: string[];
  notes?: string;
  strategic_importance?: string;
  is_custom?: boolean;
}

export interface MachineFormData {
  name: string;
  id?: string;
  type: string;
  department: string;
  status: 'operational' | 'idle' | 'maintenance' | 'offline';
  capacity_per_hour: number;
  capabilities: string[];
  supported_products?: string[];
  utilization: number;
  overtime_available: boolean;
  overtime_cost_per_hour: number;
  notes?: string;
  strategic_importance?: string;
}

export interface MaterialState {
  id: string;
  name: string;
  available_quantity: number;
  safety_stock: number;
  unit: string;
  unit_cost: number;
  supplier: string;
  lead_time_days: number;
  consumed_by_operations: string[];
}

export interface OrderState {
  id: string;
  customer: string;
  product: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline_hours: number;
  required_quantity: number;
  current_stage: string;
  material_id: string;
  material_needed: number;
  required_operations: string[];
  status: 'on_schedule' | 'at_risk' | 'delayed' | 'recovered';
  delay_hours: number;
  revenue_value: number;
}

export interface ScheduleSlot {
  id: string;
  order_id: string;
  machine_id: string;
  operation: string;
  start_hour: number;
  duration_hours: number;
  status: 'scheduled' | 'clash' | 'delayed' | 'rerouted' | 'completed';
}

export type RootCauseCategory =
  | 'equipment_failure'
  | 'human_error'
  | 'process_quality'
  | 'supply_chain'
  | 'it_software';

export interface RootCauseBenchmark {
  category: RootCauseCategory;
  label: string;
  share_pct: string;
  stoppage_share: string;
  early_signature: string;
  color_class: string;
  bg_class: string;
  border_class: string;
}

export const ROOT_CAUSE_BENCHMARKS: Record<RootCauseCategory, RootCauseBenchmark> = {
  equipment_failure: {
    category: 'equipment_failure',
    label: 'Equipment Failure',
    share_pct: '42–45%',
    stoppage_share: '~80% of factory stoppages trace back to mechanical & electrical components (bearings, motors, hydraulics, drives).',
    early_signature: '~80% exhibit detectable early signatures (vibration, thermal rise, ultrasonic wear) weeks prior to failure.',
    color_class: 'text-rose-400',
    bg_class: 'bg-rose-950/40',
    border_class: 'border-rose-700/60',
  },
  human_error: {
    category: 'human_error',
    label: 'Human Error',
    share_pct: '~23%',
    stoppage_share: 'Operator misconfiguration, skipped procedure checklist, bad startup/shutdown sequence, manual override errors.',
    early_signature: 'Most frequent around shift handoffs, expedited schedule changes, and unverified tooling setups.',
    color_class: 'text-amber-400',
    bg_class: 'bg-amber-950/40',
    border_class: 'border-amber-700/60',
  },
  process_quality: {
    category: 'process_quality',
    label: 'Process / Quality Deviation',
    share_pct: '~15%',
    stoppage_share: 'Raw material batch variation, progressive tooling wear, thermal tolerance drift, scrap spike shutdowns.',
    early_signature: 'Detectable via in-line CMM inspection, SPC control limit alerts, and surface roughness degradation.',
    color_class: 'text-yellow-400',
    bg_class: 'bg-yellow-950/40',
    border_class: 'border-yellow-700/60',
  },
  supply_chain: {
    category: 'supply_chain',
    label: 'Supply Chain & Logistics',
    share_pct: '~12%',
    stoppage_share: 'Missing raw materials, supplier delivery delays, freight carrier hold-ups, inventory stockouts.',
    early_signature: 'Detectable via supplier ASN tracking, carrier milestone telemetry, and safety buffer burn rates.',
    color_class: 'text-blue-400',
    bg_class: 'bg-blue-950/40',
    border_class: 'border-blue-700/60',
  },
  it_software: {
    category: 'it_software',
    label: 'IT / Software / Network',
    share_pct: '~8% (Rapidly Growing)',
    stoppage_share: 'MES/ERP database sync failures, shop-floor sensor telemetry packet drops, SCADA timeouts, stale dispatch data.',
    early_signature: 'Detectable via heartbeat latency anomalies, database replication lag, and telemetry drop spikes.',
    color_class: 'text-purple-400',
    bg_class: 'bg-purple-950/40',
    border_class: 'border-purple-700/60',
  },
};

export const INDUSTRY_GLOBAL_BENCHMARK =
  '500 largest global manufacturers lose ~$1.4T/year to unplanned downtime (~11% of revenue); average factory loses ~800 hours/year to preventable breakdowns.';

export interface DisruptionEvent {
  id: string;
  type: string;
  entity: string;
  duration_hours: number;
  quantity_impact: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  source_text: string;
  root_cause_category?: RootCauseCategory;
  root_cause_benchmark?: RootCauseBenchmark;
}


export interface RippleNode {
  id: string;
  label: string;
  type: 'source' | 'machine' | 'operation' | 'order' | 'impact';
  status: 'healthy' | 'impacted' | 'critical';
  details?: Record<string, any>;
}

export interface RippleEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  is_critical_path?: boolean;
}

export interface ImpactReport {
  disrupted_entity: string;
  disruption_type: string;
  downtime_hours: number;
  affected_machines: string[];
  affected_operations: string[];
  at_risk_orders: string[];
  idle_capacity_options: Array<{
    machine_id: string;
    name: string;
    type: string;
    current_utilization: number;
    available_headroom_pct: number;
    supported_operations: string[];
    capacity_per_hour: number;
  }>;
  bottlenecks: string[];
  deadline_violations: string[];
  ripple_nodes: RippleNode[];
  ripple_edges: RippleEdge[];
  root_cause_summary: string;
}

export interface SimulationMetrics {
  delay_hours: number;
  cost_inr: number;
  orders_saved: number;
  orders_violated: number;
  machine_utilization_pct: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_penalty: number;
  base_boost: number;
  score: number;
  scoring_breakdown: string;
}

export interface RecoveryPlan {
  id: string;
  title: string;
  strategy_type: 'REROUTE' | 'OVERTIME' | 'SPLIT_BUFFER';
  description: string;
  actions: string[];
  feasibility: boolean;
  metrics: SimulationMetrics;
  is_recommended: boolean;
  recommendation_reason: string;
}

export interface AgentStepResult {
  agent_name: string;
  status: 'completed' | 'running' | 'idle';
  latency_ms: number;
  summary: string;
  data: Record<string, any>;
}

export interface PipelineResult {
  event: DisruptionEvent;
  impact: ImpactReport;
  plans: RecoveryPlan[];
  recommended_plan: RecoveryPlan;
  agent_steps: AgentStepResult[];
  pipeline_latency_ms: number;
}

export interface FactoryState {
  factory_info: {
    name: string;
    facility_id: string;
    location: string;
    operating_hours: number;
    current_time_offset: number;
    baseline_health_score: number;
  };
  health_score: number;
  machines: MachineState[];
  materials: MaterialState[];
  orders: OrderState[];
  schedule: ScheduleSlot[];
  active_disruptions: DisruptionEvent[];
  active_plan?: RecoveryPlan | null;
  last_pipeline_result?: PipelineResult | null;
  recent_alerts: Array<{
    id: string;
    timestamp: string;
    severity: string;
    message: string;
    root_cause_category?: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

export type ImportScope = 'machines' | 'orders' | 'schedule' | 'complete_factory';
export type DuplicateStrategy = 'skip' | 'update' | 'reject';

export interface RowValidationError {
  row: number;
  sheet?: string;
  entity_id?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SheetPreview {
  sheet_name: string;
  detected: boolean;
  record_count: number;
  valid_count: number;
  duplicate_count: number;
  error_count: number;
  warning_count: number;
  sample_records: any[];
}

export interface ImportPreviewResponse {
  status: string;
  import_type: ImportScope;
  file_name: string;
  file_type: string;
  total_detected: number;
  valid_count: number;
  duplicate_count: number;
  error_count: number;
  warning_count: number;
  sheets_detected?: SheetPreview[];
  sample_records: any[];
  errors: RowValidationError[];
  parsed_data: Record<string, any[]>;
  can_import: boolean;
}

export interface ImportConfirmResponse {
  status: string;
  message: string;
  import_type: ImportScope;
  strategy_used: DuplicateStrategy;
  machines_added: number;
  machines_updated: number;
  machines_skipped: number;
  orders_added: number;
  orders_updated: number;
  orders_skipped: number;
  schedule_added: number;
  schedule_updated: number;
  schedule_skipped: number;
  pulse_score: number;
  pulse_status: string;
  summary: {
    total_machines?: number;
    total_orders?: number;
    total_schedule_tasks?: number;
    factory_pulse?: number;
  };
}
