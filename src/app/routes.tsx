import type { RouteObject } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ROUTES } from '../constants/routes';
import LandingPage from '../pages/LandingPage/LandingPage';
import ProfileSetupPage from '../pages/ProfileSetupPage/ProfileSetupPage';
import PlanGeneratorPage from '../pages/PlanGeneratorPage/PlanGeneratorPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import DailyLogPage from '../pages/DailyLogPage/DailyLogPage';
import LeaderboardPage from '../pages/LeaderboardPage/LeaderboardPage';
import CoachChatPage from '../pages/CoachChatPage/CoachChatPage';

/**
 * All routes are flat children of the shared Layout (navbar + drawer).
 * No route guards at this stage — see Phase 1 decision: pages handle
 * missing-profile state themselves rather than redirecting, since this
 * is a demo build and every screen should stay directly reachable.
 */
export const routes: RouteObject[] = [
  {
    path: ROUTES.landing,
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: ROUTES.setup.slice(1), element: <ProfileSetupPage /> },
      { path: ROUTES.plan.slice(1), element: <PlanGeneratorPage /> },
      { path: ROUTES.dashboard.slice(1), element: <DashboardPage /> },
      { path: ROUTES.log.slice(1), element: <DailyLogPage /> },
      { path: ROUTES.leaderboard.slice(1), element: <LeaderboardPage /> },
      { path: ROUTES.coach.slice(1), element: <CoachChatPage /> },
    ],
  },
];
