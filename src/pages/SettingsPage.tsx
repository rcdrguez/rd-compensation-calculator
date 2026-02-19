import { useMemo, useState } from 'react';
import { AccordionItem } from '@/ui/components/Accordion';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { loadConfigState, presets, resolveActiveConfig, saveConfigState } from '@/domain/rd/config/store';
import { rdConfigSchema } from '@/domain/rd/config/schema';
import { computeNet } from '@/domain/rd/engine/computeNet';
import { money } from '@/ui/lib/utils';

export function SettingsPage() {
  const [state, setState] = useState(loadConfigState());
  const active = useMemo(() => resolveActiveConfig(state), [state]);
  const [draftRate, setDraftRate] = useState(active.tss.afpEmployeeRate);
  const impact = computeNet({ gross: 100000, frequency: 'monthly', config: active }).monthlyNet - computeNet({ gross: 100000, frequency: 'monthly', config: { ...active, tss: { ...active.tss, afpEmployeeRate: draftRate } } }).monthlyNet;

  return <Card><h2 className="mb-3 text-lg font-semibold">Configuración</h2><label className="text-sm">Preset</label><select className="mb-3 w-full rounded-md border border-input bg-background px-2 py-2" value={state.selectedPresetId} onChange={(e) => setState((prev) => ({ ...prev, selectedPresetId: e.target.value, userOverrides: {} }))}>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.id.toUpperCase()}</option>)}</select><div className="space-y-2"><AccordionItem title="A) TSS"><label className="text-sm">AFP rate</label><Input type="number" step="0.0001" value={draftRate} onChange={(e) => setDraftRate(Number(e.target.value))} /><p className="mt-2 text-sm text-muted-foreground">Impact preview: tu neto cambia {money(impact)}</p></AccordionItem><AccordionItem title="B) ISR"><p className="text-sm">Los brackets son editables vía import/export JSON.</p></AccordionItem><AccordionItem title="C) Laboral"><p className="text-sm">Define vacaciones, preaviso, cesantía y regalía.</p></AccordionItem><AccordionItem title="D) Negociación"><p className="text-sm">Ajusta pesos money/risk/growth/qol.</p></AccordionItem></div><div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => { const userOverrides = { tss: { ...active.tss, afpEmployeeRate: draftRate } }; rdConfigSchema.parse({ ...active, ...userOverrides }); const next = { ...state, userOverrides }; setState(next); saveConfigState(next); }}>Guardar</Button><Button className="bg-muted text-foreground" onClick={() => { const next = { ...state, userOverrides: {} }; setState(next); saveConfigState(next); }}>Restaurar preset</Button><Button className="bg-muted text-foreground" onClick={() => { const blob = new Blob([JSON.stringify(active, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${active.id}.json`; a.click(); }}>Exportar JSON</Button><label className="rounded-md bg-muted px-4 py-2 text-sm"><input type="file" className="hidden" accept="application/json" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const imported = rdConfigSchema.parse(JSON.parse(await file.text())); const next = { ...state, customConfigs: [...state.customConfigs, imported], selectedPresetId: imported.id }; setState(next); saveConfigState(next); }} />Importar JSON</label></div></Card>;
}
