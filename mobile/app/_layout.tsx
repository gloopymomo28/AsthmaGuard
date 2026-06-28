import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import Colors from '../constants/Colors';
import * as Notifications from 'expo-notifications';
import API_URL from '../constants/Api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Real-time Push Notifications via WebSockets
  useEffect(() => {
    Notifications.requestPermissionsAsync();

    const wsUrl = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws/alerts');
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.alert_level === 'High') {
          const risk = Math.round(data.risk_scores[data.risk_scores.length - 1] * 100);
          Notifications.scheduleNotificationAsync({
            content: {
              title: "CRITICAL ALERT 🚨",
              body: `A patient's AI risk score jumped to ${risk}%. Check dashboard immediately.`,
              sound: 'default',
            },
            trigger: null, // Fire immediately
          });
        }
      } catch (e) {
        console.warn("Failed to parse websocket message", e);
      }
    };

    return () => ws.close();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="patient/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Patient Detail',
            headerStyle: { backgroundColor: Colors.dark.surface },
            headerTintColor: Colors.dark.text,
            presentation: 'card',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
