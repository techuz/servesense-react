import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { RestaurantPage } from '@/pages/Restaurant';
import { PoliciesPage } from '@/pages/Policies';
import { MenuPage } from '@/pages/Menu';
import { SopPage } from '@/pages/SOP';
import { CommunicationPage } from '@/pages/Communication';
import { ExcellencePage } from '@/pages/Excellence';
import { GoalsPage } from '@/pages/Goals';
import { StaffPage } from '@/pages/Staff';
import { CoachingPage } from '@/pages/Coaching';
import { PerformancePage } from '@/pages/Performance';
import { StaffDetailPage } from '@/pages/Performance/StaffDetail';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'restaurant', element: <RestaurantPage /> },
      { path: 'orientation/policies', element: <PoliciesPage /> },
      { path: 'orientation/menu', element: <MenuPage /> },
      { path: 'orientation/sop', element: <SopPage /> },
      { path: 'orientation/tone', element: <CommunicationPage /> },
      { path: 'orientation/excellence', element: <ExcellencePage /> },
      { path: 'orientation/goals', element: <GoalsPage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'coaching', element: <CoachingPage /> },
      { path: 'performance', element: <PerformancePage /> },
      { path: 'performance/:staffId', element: <StaffDetailPage /> },
    ],
  },
]);
