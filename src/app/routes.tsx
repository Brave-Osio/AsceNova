import type { RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './router/ProtectedRoute';
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

/**
 * All routes are flat children of the shared Layout (navbar + drawer).
 *
 * Phase 2 gating has begun: setup/plan/dashboard/log/leaderboard all
 * read profile data, which now lives on the backend, so they sit
 * behind ProtectedRoute. Coach chat doesn't consume profile data yet
 * and stays ungated until its own domain migrates.
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
        ],
      },
      { path: ROUTES.coach.slice(1), element: <CoachChatPage /> },
      { path: ROUTES.login.slice(1), element: <LoginPage /> },
      { path: ROUTES.register.slice(1), element: <RegisterPage /> },
      { path: ROUTES.forgotPassword.slice(1), element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword.slice(1), element: <ResetPasswordPage /> },
    ],
  },
];
