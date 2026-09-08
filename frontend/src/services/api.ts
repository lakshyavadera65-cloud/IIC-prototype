import {
  FactoryState,
  PipelineResult,
  MachineFormData,
  ScheduleFormData,
  ImportScope,
  DuplicateStrategy,
  ImportPreviewResponse,
  ImportConfirmResponse,
} from '../types';
import {
  adaptBackendStateToFrontend,
  adaptBackendPipelineToFrontend,
} from './apiAdapter';

// Configurable API base URL from Vite environment variable (defaults to relative path in production)
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
).replace(/\/+$/, '');

// In-memory cache for the most recent pipeline result to maintain state persistence across refetches
let cachedPipelineResult: PipelineResult | null = null;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errDetail = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      } catch {
        // ignore json parse error
      }
      throw new Error(errDetail);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to PULSE backend at ${API_BASE_URL}. Ensure FastAPI is running on port 8000.`);
    }
    throw error;
  }
}

/**
 * Fetch the complete live factory state and current operational status from the FastAPI backend.
 */
export async function fetchFactoryState(): Promise<FactoryState> {
  const [stateRes, pulseRes] = await Promise.all([
    request<any>('/api/factory/state'),
    request<any>('/api/pulse').catch(() => null),
  ]);

  return adaptBackendStateToFrontend(stateRes, pulseRes, cachedPipelineResult);
}

/**
 * Add a new workstation / machine to the live factory state.
 */
export async function createMachine(data: MachineFormData): Promise<any> {
  return request<any>('/api/factory/machines', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing machine's operational status or configuration.
 */
export async function updateMachine(machineId: string, updates: Partial<MachineFormData>): Promise<any> {
  return request<any>(`/api/factory/machines/${encodeURIComponent(machineId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Safely delete a workstation from the factory.
 */
export async function deleteMachine(machineId: string): Promise<any> {
  return request<any>(`/api/factory/machines/${encodeURIComponent(machineId)}`, {
    method: 'DELETE',
  });
}

/**
 * Dispatch a new production schedule slot into the factory plan.
 */
export async function createSchedule(data: ScheduleFormData): Promise<any> {
  return request<any>('/api/factory/schedule', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a scheduled task slot.
 */
export async function deleteSchedule(slotId: string): Promise<any> {
  return request<any>(`/api/factory/schedule/${encodeURIComponent(slotId)}`, {
    method: 'DELETE',
  });
}

/**
 * Reset factory state to initial healthy baseline.
 */
export async function resetFactory(): Promise<FactoryState> {
  await request('/api/factory/reset', { method: 'POST' });
  cachedPipelineResult = null;
  return fetchFactoryState();
}

/**
 * Ingest an operational disruption event (either Scenario A or custom raw alert) into the multi-agent pipeline.
 */
export async function triggerDisruption(text: string, scenarioId?: string): Promise<PipelineResult> {
  const isScenarioA =
    scenarioId === 'SCENARIO_A' ||
    (scenarioId?.toLowerCase().includes('scenario-a') ?? false) ||
    (text.includes('CNC-02') && (text.toLowerCase().includes('gearbox') || text.toLowerCase().includes('failure')));

  let backendResult: any;

  if (scenarioId === 'SCENARIO_A' || scenarioId?.toLowerCase().includes('scenario-a')) {
    backendResult = await request<any>('/api/demo/trigger/scenario-a', { method: 'POST' });
  } else if (scenarioId === 'SCENARIO_B' || scenarioId?.toLowerCase().includes('scenario-b')) {
    backendResult = await request<any>('/api/demo/trigger/scenario-b', { method: 'POST' });
  } else if (scenarioId === 'SCENARIO_C' || scenarioId?.toLowerCase().includes('scenario-c')) {
    backendResult = await request<any>('/api/demo/trigger/scenario-c', { method: 'POST' });
  } else if (scenarioId === 'SCENARIO_D' || scenarioId?.toLowerCase().includes('scenario-d')) {
    backendResult = await request<any>('/api/demo/trigger/scenario-d', { method: 'POST' });
  } else {
    // Call generic event ingestion endpoint with raw message
    backendResult = await request<any>('/api/events', {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    });
  }

  const pipelineResult = adaptBackendPipelineToFrontend(backendResult);
  cachedPipelineResult = pipelineResult;

  return pipelineResult;
}

/**
 * Execute a recovery plan on the live factory state.
 */
export async function executePlan(
  planId: string
): Promise<{ success: boolean; message: string; factory_state: FactoryState }> {
  const normalizedPlanId = planId.toUpperCase();
  const res = await request<any>(`/api/recovery/${normalizedPlanId}/execute`, { method: 'POST' });

  // Refetch live factory state
  const updatedState = await fetchFactoryState();

  return {
    success: res.status === 'success',
    message: res.message || `Plan ${planId} executed successfully`,
    factory_state: updatedState,
  };
}

/**
 * Grounded factory operations Q&A using live backend chat endpoint.
 */
export async function sendChatQuery(
  message: string
): Promise<{ reply: string; citations: string[] }> {
  const res = await request<any>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ query: message }),
  });

  return {
    reply: res.answer || "I don't have enough factory data to answer that.",
    citations: res.sources && res.sources.length > 0 ? res.sources : ['Factory Digital Twin', 'Oracle Simulation'],
  };
}

/**
 * Granular intelligence endpoints for specific inspect views
 */
export async function fetchImpact(eventId: string): Promise<any> {
  return request(`/api/impact/${eventId}`);
}

export async function fetchAgentLogs(eventId: string): Promise<any> {
  return request(`/api/agents/${eventId}`);
}

export async function fetchRecoveryPlans(eventId: string): Promise<any> {
  return request(`/api/recovery/${eventId}`);
}

export async function fetchAlerts(): Promise<any[]> {
  return request('/api/alerts');
}

export async function fetchPulse(): Promise<any> {
  return request('/api/pulse');
}

/**
 * Preview factory data import from CSV or Excel file.
 */
export async function previewImportData(
  file: File,
  importType: ImportScope
): Promise<ImportPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('import_type', importType);

  return request<ImportPreviewResponse>('/api/import/preview', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Confirm and commit validated factory data import.
 */
export async function confirmImportData(
  importType: ImportScope,
  duplicateStrategy: DuplicateStrategy,
  data: Record<string, any[]>
): Promise<ImportConfirmResponse> {
  return request<ImportConfirmResponse>('/api/import/confirm', {
    method: 'POST',
    body: JSON.stringify({
      import_type: importType,
      duplicate_strategy: duplicateStrategy,
      data,
    }),
  });
}

/**
 * Get direct download URL for template files.
 */
export function getTemplateDownloadUrl(importType: ImportScope, format: 'csv' | 'xlsx'): string {
  return `${API_BASE_URL}/api/import/templates/${encodeURIComponent(importType)}?format=${format}`;
}

