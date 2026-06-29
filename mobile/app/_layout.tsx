import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import Colors from '../constants/Colors';
import API_URL from '../constants/Api';

import * as Notifications from 'expo-notifications';

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

  // Real-time alerts via WebSockets
  useEffect(() => {
    const wsUrl = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '/ws/alerts');
    const ws = new WebSocket(wsUrl);

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.alert_level === 'High') {
          const risk = Math.round(data.risk_scores[data.risk_scores.length - 1] * 100);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'CRITICAL ALERT 🚨',
              body: `A patient's AI risk score jumped to ${risk}%. Check dashboard immediately.`,
              sound: true,
            },
            trigger: null, // trigger immediately
          });
        }
      } catch (e) {
        console.warn('Failed to parse websocket message', e);
      }
    };

    ws.onerror = () => {
      console.warn('WebSocket connection failed — backend may be asleep');
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
        <Stack.Screen
          name="add-patient"
          options={{
            headerShown: true,
            headerTitle: 'Add New Patient',
            headerStyle: { backgroundColor: Colors.dark.surface },
            headerTintColor: Colors.dark.text,
            presentation: 'modal',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
