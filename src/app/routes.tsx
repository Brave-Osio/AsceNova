import type { RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';
import CoachRoute from './router/CoachRoute';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import LandingPage from '../pages/LandingPage/LandingPage';
import PlanGeneratorPage from '../pages/PlanGeneratorPage/PlanGeneratorPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import DailyLogPage from '../pages/DailyLogPage/DailyLogPage';
import LeaderboardPage from '../pages/LeaderboardPage/LeaderboardPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage/AdminDashboardPage';
import AdminUserDetailPage from '../pages/AdminUserDetailPage/AdminUserDetailPage';
import AdminAuditLogsPage from '../pages/AdminAuditLogsPage/AdminAuditLogsPage';
import CoachPage from '../pages/CoachPage/CoachPage';
import CoachClientPage from '../pages/CoachClientPage/CoachClientPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import ChallengesPage from '../pages/ChallengesPage/ChallengesPage';
import GoalsPage from '../pages/GoalsPage/GoalsPage';
import TermsPage from '../pages/TermsPage/TermsPage';

/**
 * All routes are flat children of the shared Layout (navbar + drawer).
 *
 * plan/dashboard/log/leaderboard/settings all read backend-persisted,
 * per-user data, so they sit behind ProtectedRoute. /setup redirects to the
 * unified Profile and Settings page; the AI coach is a floating side panel,
 * not a route.
 */
export const routes: RouteObject[] = [
  {
    path: ROUTES.landing,
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.setup.slice(1), element: <Navigate to={ROUTES.settings} replace /> },
          { path: ROUTES.plan.slice(1), element: <PlanGeneratorPage /> },
          { path: ROUTES.dashboard.slice(1), element: <DashboardPage /> },
          { path: ROUTES.log.slice(1), element: <DailyLogPage /> },
          { path: ROUTES.leaderboard.slice(1), element: <LeaderboardPage /> },
          { path: ROUTES.settings.slice(1), element: <SettingsPage /> },
          { path: ROUTES.challenges.slice(1), element: <ChallengesPage /> },
          { path: ROUTES.goals.slice(1), element: <GoalsPage /> },
        ],
      },
      {
        element: <CoachRoute />,
        children: [
          { path: ROUTES.coach.slice(1), element: <CoachPage /> },
          { path: `${ROUTES.coach.slice(1)}/clients/:clientId`, element: <CoachClientPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          { path: ROUTES.admin.slice(1), element: <AdminDashboardPage /> },
          { path: ROUTES.adminAuditLogs.slice(1), element: <AdminAuditLogsPage /> },
          { path: `${ROUTES.admin.slice(1)}/users/:userId`, element: <AdminUserDetailPage /> },
        ],
      },
      { path: ROUTES.terms.slice(1), element: <TermsPage /> },
      { path: ROUTES.login.slice(1), element: <LoginPage /> },
      { path: ROUTES.register.slice(1), element: <RegisterPage /> },
      { path: ROUTES.forgotPassword.slice(1), element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword.slice(1), element: <ResetPasswordPage /> },
    ],
  },
];
