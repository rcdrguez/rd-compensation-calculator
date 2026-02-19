import { useState, type ReactNode } from 'react';
import { cn } from '../lib/utils';

export function Tabs({ items }: { items: Array<{ id: string; label: string; content: ReactNode }> }) {
  const [active, setActive] = useState(items[0]?.id);
  return (
    <div>
      <div className="mb-3 flex gap-2">{items.map((item) => <button key={item.id} className={cn('rounded-md px-3 py-1 text-sm', active === item.id ? 'bg-primary text-primary-foreground' : 'bg-muted')} onClick={() => setActive(item.id)}>{item.label}</button>)}</div>
      <div>{items.find((item) => item.id === active)?.content}</div>
    </div>
  );
}
