import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerPosition: 'left',
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: Colors.dark.surface,
          width: 280,
        },
        drawerActiveTintColor: Colors.dark.primary,
        drawerInactiveTintColor: Colors.dark.textSecondary,
        drawerActiveBackgroundColor: Colors.dark.background,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginVertical: 2,
          paddingVertical: 2,
        },
        headerStyle: {
          backgroundColor: Colors.dark.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          color: Colors.dark.text,
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: Colors.dark.text,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'AsthmaGuard AI',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="patients"
        options={{
          title: 'Patients',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
