import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function CompChart({ data }: { data: Array<{ name: string; total: number }> }) {
  return <ResponsiveContainer width="100%" height={220}><BarChart data={data}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer>;
}
