import rd2025 from './presets/rd-2025.json';
import rd2026 from './presets/rd-2026.json';
import { rdConfigSchema } from './schema';
import type { RDConfig } from '../types';

const KEY = 'rd.config.state.v1';

interface ConfigState {
  selectedPresetId: string;
  userOverrides: Partial<RDConfig>;
  customConfigs: RDConfig[];
}

export const presets: RDConfig[] = [rd2025 as RDConfig, rd2026 as RDConfig];

export function loadConfigState(): ConfigState {
  const fallback: ConfigState = { selectedPresetId: presets[0].id, userOverrides: {}, customConfigs: [] };
  const raw = localStorage.getItem(KEY);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as ConfigState) };
  } catch {
    return fallback;
  }
}

export function saveConfigState(state: ConfigState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resolveActiveConfig(state: ConfigState): RDConfig {
  const base = [...presets, ...state.customConfigs].find((config) => config.id === state.selectedPresetId) ?? presets[0];
  const merged = { ...base, ...state.userOverrides };
  return rdConfigSchema.parse(merged);
}
