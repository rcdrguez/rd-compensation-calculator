import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/ui/lib/utils';

const nav = [
  { to: '/neto', label: 'Neto' },
  { to: '/comparar', label: 'Comparar' },
  { to: '/prestaciones', label: 'Prestaciones' },
  { to: '/configuracion', label: 'Configuración' }
];

export function Sidebar() {
  const { pathname } = useLocation();
  return <aside className="w-60 border-r border-border p-3">{nav.map((item) => <Link key={item.to} className={cn('mb-1 block rounded-md px-3 py-2 text-sm', pathname === item.to ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} to={item.to}>{item.label}</Link>)}</aside>;
}
