import { FactoryState, PipelineResult } from '../types';
import { globalEngine } from './factoryEngine';

export async function fetchFactoryState(): Promise<FactoryState> {
  return globalEngine.getState();
}

export async function resetFactory(): Promise<FactoryState> {
  return globalEngine.reset();
}

export async function triggerDisruption(text: string, scenarioId?: string): Promise<PipelineResult> {
  return globalEngine.triggerDisruption(text);
}

export async function executePlan(planId: string): Promise<{ success: boolean; message: string; factory_state: FactoryState }> {
  return globalEngine.executePlan(planId);
}

export async function sendChatQuery(message: string): Promise<{ reply: string; citations: string[] }> {
  return globalEngine.answerChat(message);
}
