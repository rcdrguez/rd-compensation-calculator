import { Moon, Sun } from 'lucide-react';
import { Button } from '@/ui/components/Button';

export function Topbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return <header className="flex items-center justify-between border-b border-border p-3"><h1 className="font-semibold">RD Compensation Calculator</h1><Button className="bg-muted text-foreground" onClick={onToggle}>{dark ? <Sun size={16} /> : <Moon size={16} />}</Button></header>;
}
