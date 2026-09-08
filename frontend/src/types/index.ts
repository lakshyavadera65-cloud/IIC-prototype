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

export interface DisruptionEvent {
  id: string;
  type: string;
  entity: string;
  duration_hours: number;
  quantity_impact: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  source_text: string;
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
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}
