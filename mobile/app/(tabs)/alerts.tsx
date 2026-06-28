import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const mockAlerts = [
  {
    id: '1',
    patient: 'Marcus Thorne',
    type: 'critical',
    message: 'Risk score surged to 78% - FEV1 declining rapidly',
    time: '2 mins ago',
  },
  {
    id: '2',
    patient: 'Eleanor Vance',
    type: 'warning',
    message: 'Environmental triggers detected - AQI above 150 in patient area',
    time: '15 mins ago',
  },
  {
    id: '3',
    patient: 'Marcus Thorne',
    type: 'critical',
    message: 'Missed controller medication for 3 consecutive days',
    time: '1 hour ago',
  },
  {
    id: '4',
    patient: 'Sarah Jenkins',
    type: 'info',
    message: 'Routine check-in - all vitals within normal range',
    time: '2 hours ago',
  },
  {
    id: '5',
    patient: 'Eleanor Vance',
    type: 'warning',
    message: 'Nighttime awakenings increased - 2 in the last week',
    time: '5 hours ago',
  },
];

export default function AlertsScreen() {
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          icon: 'alert-circle' as const,
          color: Colors.dark.danger,
          bg: Colors.dark.dangerGlow,
          border: 'rgba(248, 113, 113, 0.2)',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: Colors.dark.warning,
          bg: Colors.dark.warningGlow,
          border: 'rgba(251, 191, 36, 0.2)',
        };
      default:
        return {
          icon: 'information-circle' as const,
          color: Colors.dark.accent,
          bg: Colors.dark.accentGlow,
          border: 'rgba(56, 189, 248, 0.2)',
        };
    }
  };

  const renderAlert = ({ item }: { item: (typeof mockAlerts)[0] }) => {
    const style = getAlertStyle(item.type);
    return (
      <View style={[styles.alertCard, { borderColor: style.border }]}>
        <View style={[styles.iconBox, { backgroundColor: style.bg }]}>
          <Ionicons name={style.icon} size={22} color={style.color} />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertPatient}>{item.patient}</Text>
            <Text style={styles.alertTime}>{item.time}</Text>
          </View>
          <Text style={styles.alertMessage}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerCount}>{mockAlerts.length} alerts today</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  header: { paddingVertical: 12 },
  headerCount: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '500' },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: { flex: 1 },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertPatient: { fontSize: 14, fontWeight: '700', color: Colors.dark.text },
  alertTime: { fontSize: 11, color: Colors.dark.textMuted },
  alertMessage: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 19 },
});
