import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useEffect, useState } from 'react';

export function AppShell() {
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Topbar dark={dark} onToggle={() => setDark((v) => !v)} />
        <div className="p-4"><Outlet /></div>
      </main>
    </div>
  );
}
