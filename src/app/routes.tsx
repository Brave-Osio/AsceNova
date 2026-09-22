import type { RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';
import { ROUTES } from '../constants/routes';
import LandingPage from '../pages/LandingPage/LandingPage';
import ProfileSetupPage from '../pages/ProfileSetupPage/ProfileSetupPage';
import PlanGeneratorPage from '../pages/PlanGeneratorPage/PlanGeneratorPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import DailyLogPage from '../pages/DailyLogPage/DailyLogPage';
import LeaderboardPage from '../pages/LeaderboardPage/LeaderboardPage';
import CoachChatPage from '../pages/CoachChatPage/CoachChatPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage/AdminDashboardPage';
import AdminUserDetailPage from '../pages/AdminUserDetailPage/AdminUserDetailPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';

/**
 * All routes are flat children of the shared Layout (navbar + drawer).
 *
 * setup/plan/dashboard/log/leaderboard/coach all read backend-persisted,
 * per-user data, so they sit behind ProtectedRoute. Coach chat moved in
 * once its backend (Gemini-backed, real profile/plan/progress context)
 * replaced the old ungated demo mock.
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
          { path: ROUTES.setup.slice(1), element: <ProfileSetupPage /> },
          { path: ROUTES.plan.slice(1), element: <PlanGeneratorPage /> },
          { path: ROUTES.dashboard.slice(1), element: <DashboardPage /> },
          { path: ROUTES.log.slice(1), element: <DailyLogPage /> },
          { path: ROUTES.leaderboard.slice(1), element: <LeaderboardPage /> },
          { path: ROUTES.coach.slice(1), element: <CoachChatPage /> },
          { path: ROUTES.settings.slice(1), element: <SettingsPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          { path: ROUTES.admin.slice(1), element: <AdminDashboardPage /> },
          { path: `${ROUTES.admin.slice(1)}/users/:userId`, element: <AdminUserDetailPage /> },
        ],
      },
      { path: ROUTES.login.slice(1), element: <LoginPage /> },
      { path: ROUTES.register.slice(1), element: <RegisterPage /> },
      { path: ROUTES.forgotPassword.slice(1), element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword.slice(1), element: <ResetPasswordPage /> },
    ],
  },
];
