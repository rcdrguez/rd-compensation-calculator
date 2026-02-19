import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { NetSalaryPage } from '@/pages/NetSalaryPage';
import { CompareOffersPage } from '@/pages/CompareOffersPage';
import { SeverancePage } from '@/pages/SeverancePage';
import { SettingsPage } from '@/pages/SettingsPage';

export const routes = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, element: <Navigate to="/neto" replace /> },
      { path: '/neto', Component: NetSalaryPage },
      { path: '/comparar', Component: CompareOffersPage },
      { path: '/prestaciones', Component: SeverancePage },
      { path: '/configuracion', Component: SettingsPage }
    ]
  }
]);
