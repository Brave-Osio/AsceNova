import { Tabs } from 'expo-router';
import AppShell from '../../src/components/layout/AppShell';

/**
 * Tabs is kept purely as the router (state preservation, lazy mount); its bar is
 * hidden because navigation is the web's hamburger drawer in AppShell.
 */
export default function AppLayout() {
  return (
    <AppShell>
      <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="plan" />
        <Tabs.Screen name="log" />
        <Tabs.Screen name="leaderboard" />
        <Tabs.Screen name="challenges" />
        <Tabs.Screen name="goals" />
        <Tabs.Screen name="coach" />
        <Tabs.Screen name="settings" />
        <Tabs.Screen name="profile-setup" />
      </Tabs>
    </AppShell>
  );
}
