import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useAppTheme } from '../src/context/ThemeContext';
import { queryClient } from '../src/lib/queryClient';

/**
 * Auth-guarded root navigator — Stack.Protected redirects automatically
 * based on the guard condition (see docs.expo.dev/router/advanced/authentication).
 * All routes are always defined; only reachability changes with auth state.
 */
function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

function ThemedStatusBar() {
  const { theme } = useAppTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
