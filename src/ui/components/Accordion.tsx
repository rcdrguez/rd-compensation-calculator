import { useState, type PropsWithChildren } from 'react';

export function AccordionItem({ title, children }: PropsWithChildren<{ title: string }>) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border">
      <button className="w-full px-3 py-2 text-left font-medium" onClick={() => setOpen((v) => !v)}>{title}</button>
      {open ? <div className="border-t border-border p-3">{children}</div> : null}
    </div>
  );
}
