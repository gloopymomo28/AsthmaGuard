import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { patientService } from '../../services/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  glow: string;
}

function StatCard({ title, value, icon, color, glow }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderColor: glow }]}>
      <View style={[styles.statIconBox, { backgroundColor: glow }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function PatientQuickCard({ patient, onPress }: { patient: any; onPress: () => void }) {
  const riskColor =
    patient.riskScore >= 70
      ? Colors.dark.danger
      : patient.riskScore >= 40
      ? Colors.dark.warning
      : Colors.dark.success;

  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.patientCardHeader}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: riskColor + '20', borderColor: riskColor + '40' },
          ]}
        >
          <Text style={[styles.avatarText, { color: riskColor }]}>
            {patient.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')}
          </Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientMeta}>
            {patient.age}y | {patient.severity}
          </Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
          <Text style={[styles.riskValue, { color: riskColor }]}>{patient.riskScore}%</Text>
        </View>
      </View>

      {/* Mini Trend Line */}
      <View style={styles.trendContainer}>
        {patient.trend.map((val: number, i: number) => (
          <View
            key={i}
            style={[
              styles.trendBar,
              {
                height: Math.max(4, (val / 100) * 32),
                backgroundColor: riskColor,
                opacity: 0.4 + (i / patient.trend.length) * 0.6,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.vitalsRow}>
        <Text style={styles.vitalItem}>HR {patient.vitals.hr}</Text>
        <Text style={styles.vitalItem}>SpO2 {patient.vitals.spo2}%</Text>
        <Text style={styles.vitalItem}>PEF {patient.vitals.pef}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPatients = async () => {
    const data = await patientService.getPatients();
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const highRiskCount = patients.filter((p) => p.riskScore >= 70).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
        <Text style={styles.headerSubtitle}>Monitor asthma flare-up risks in real-time</Text>
      </View>

      {/* Stats Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <StatCard
          title="Patients"
          value={patients.length || '--'}
          icon="people"
          color={Colors.dark.accent}
          glow={Colors.dark.accentGlow}
        />
        <StatCard
          title="High Risk"
          value={loading ? '--' : highRiskCount}
          icon="warning"
          color={Colors.dark.danger}
          glow={Colors.dark.dangerGlow}
        />
        <StatCard
          title="Alerts"
          value="14"
          icon="notifications"
          color={Colors.dark.warning}
          glow={Colors.dark.warningGlow}
        />
        <StatCard
          title="Accuracy"
          value="94.2%"
          icon="analytics"
          color={Colors.dark.success}
          glow={Colors.dark.successGlow}
        />
      </ScrollView>

      {/* AI Model Banner */}
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.aiBanner}
      >
        <Ionicons name="hardware-chip" size={28} color="#fff" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.aiBannerTitle}>CAMP-Trained PatchTST Model</Text>
          <Text style={styles.aiBannerSub}>695 patients | Val Loss: 2.18</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>LIVE</Text>
        </View>
      </LinearGradient>

      {/* Patients Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Monitored Patients</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/patients')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? [1, 2, 3].map((i) => <View key={i} style={styles.skeleton} />)
        : patients.map((patient) => (
            <PatientQuickCard
              key={patient.id}
              patient={patient}
              onPress={() => router.push(`/patient/${patient.id}`)}
            />
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { paddingBottom: 30 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.dark.text },
  headerSubtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 },

  statsScroll: { paddingLeft: 20, marginTop: 18, marginBottom: 8 },
  statCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    borderWidth: 1,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.dark.text },
  statTitle: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },

  aiBanner: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  aiBannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark.text },
  seeAll: { fontSize: 13, color: Colors.dark.success, fontWeight: '600' },

  patientCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  patientCardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  patientInfo: { flex: 1, marginLeft: 12 },
  patientName: { fontSize: 15, fontWeight: '700', color: Colors.dark.text },
  patientMeta: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  riskValue: { fontSize: 14, fontWeight: '800' },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 12,
    marginBottom: 10,
    height: 32,
  },
  trendBar: {
    flex: 1,
    borderRadius: 3,
    minHeight: 4,
  },

  vitalsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  vitalItem: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '500' },

  skeleton: {
    height: 130,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    opacity: 0.5,
  },
});
