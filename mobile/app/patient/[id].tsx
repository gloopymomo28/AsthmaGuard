import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { patientService, predictionService } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function VitalCard({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.vitalCard}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.vitalValue}>
        {value}
        <Text style={styles.vitalUnit}> {unit}</Text>
      </Text>
      <Text style={styles.vitalLabel}>{label}</Text>
    </View>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const chartWidth = SCREEN_WIDTH - 80;
  const barWidth = chartWidth / data.length - 2;

  return (
    <View style={styles.chartContainer}>
      {data.map((val, i) => (
        <View
          key={i}
          style={[
            styles.chartBar,
            {
              height: Math.max(4, (val / max) * 80),
              width: barWidth,
              backgroundColor: color,
              opacity: 0.3 + (val / max) * 0.7,
              borderRadius: 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    const data = await patientService.getPatient(id!);
    setPatient(data);
    setLoading(false);
  };

  const runPrediction = async () => {
    setPredicting(true);
    const result = await predictionService.generateDemoPrediction();
    setPrediction(result);
    setPredicting(false);
  };

  if (loading || !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const riskColor =
    patient.riskScore >= 70
      ? Colors.dark.danger
      : patient.riskScore >= 40
      ? Colors.dark.warning
      : Colors.dark.success;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Patient Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View
            style={[styles.avatarLarge, { backgroundColor: riskColor + '15', borderColor: riskColor + '30' }]}
          >
            <Text style={[styles.avatarLargeText, { color: riskColor }]}>
              {patient.name.split(' ').map((n: string) => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientDetails}>
              {patient.age} years | {patient.sex} | {patient.severity}
            </Text>
          </View>
        </View>

        {/* Risk Score Bar */}
        <View style={styles.riskBarContainer}>
          <View style={styles.riskBarHeader}>
            <Text style={styles.riskBarLabel}>Current Risk Level</Text>
            <Text style={[styles.riskBarValue, { color: riskColor }]}>{patient.riskScore}%</Text>
          </View>
          <View style={styles.riskBarTrack}>
            <LinearGradient
              colors={[Colors.dark.success, Colors.dark.warning, Colors.dark.danger]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.riskBarFill, { width: `${patient.riskScore}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Vitals Grid */}
      <Text style={styles.sectionTitle}>Current Vitals</Text>
      <View style={styles.vitalsGrid}>
        <VitalCard label="Heart Rate" value={patient.vitals.hr} unit="bpm" icon="heart" color={Colors.dark.danger} />
        <VitalCard label="Resp. Rate" value={patient.vitals.rr} unit="/min" icon="pulse" color={Colors.dark.accent} />
        <VitalCard label="SpO2" value={patient.vitals.spo2} unit="%" icon="water" color={Colors.dark.primary} />
        <VitalCard label="Peak Flow" value={patient.vitals.pef} unit="L/m" icon="speedometer" color={Colors.dark.success} />
      </View>

      {/* Risk Trend */}
      <Text style={styles.sectionTitle}>Risk Trend</Text>
      <View style={styles.chartCard}>
        <MiniChart data={patient.trend} color={riskColor} />
        <Text style={styles.chartLabel}>Last 4 assessments</Text>
      </View>

      {/* AI Prediction Button */}
      <TouchableOpacity onPress={runPrediction} disabled={predicting} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.predictButton}
        >
          {predicting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.predictText}>Run AI Prediction</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* AI Prediction Results */}
      {prediction && (
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Ionicons name="hardware-chip" size={20} color={Colors.dark.primary} />
            <Text style={styles.predictionTitle}>PatchTST Prediction</Text>
          </View>

          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Alert Level</Text>
            <View
              style={[
                styles.alertBadge,
                {
                  backgroundColor:
                    prediction.alert_level === 'High'
                      ? Colors.dark.dangerGlow
                      : prediction.alert_level === 'Medium'
                      ? Colors.dark.warningGlow
                      : Colors.dark.successGlow,
                },
              ]}
            >
              <Text
                style={[
                  styles.alertBadgeText,
                  {
                    color:
                      prediction.alert_level === 'High'
                        ? Colors.dark.danger
                        : prediction.alert_level === 'Medium'
                        ? Colors.dark.warning
                        : Colors.dark.success,
                  },
                ]}
              >
                {prediction.alert_level}
              </Text>
            </View>
          </View>

          {prediction.contributing_factors && (
            <>
              <Text style={styles.factorsTitle}>SHAP Analysis (Explainable AI)</Text>
              {prediction.contributing_factors.map((factor: any, index: number) => (
                <View key={index} style={styles.factorRow}>
                  <Text style={styles.factorLabel} numberOfLines={1}>{factor.feature}</Text>
                  <View style={styles.factorBarTrack}>
                    <View
                      style={[
                        styles.factorBarFill,
                        { 
                          width: `${Math.min(Math.abs(factor.value) * 100, 100)}%`, 
                          backgroundColor: factor.value > 0 ? Colors.dark.danger : Colors.dark.success 
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.factorValue, { color: factor.value > 0 ? Colors.dark.danger : Colors.dark.success }]}>
                    {factor.impact}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Baseline Info */}
      <View style={styles.baselineCard}>
        <Text style={styles.baselineTitle}>Baseline</Text>
        <View style={styles.baselineRow}>
          <Text style={styles.baselineLabel}>FEV1</Text>
          <Text style={styles.baselineValue}>{patient.baselineFEV1}% predicted</Text>
        </View>
        <View style={styles.baselineRow}>
          <Text style={styles.baselineLabel}>Last Updated</Text>
          <Text style={styles.baselineValue}>{patient.lastUpdated}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background },

  headerCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarLargeText: { fontSize: 20, fontWeight: '800' },
  headerInfo: { marginLeft: 14 },
  patientName: { fontSize: 20, fontWeight: '800', color: Colors.dark.text },
  patientDetails: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 },

  riskBarContainer: {},
  riskBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  riskBarLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  riskBarValue: { fontSize: 16, fontWeight: '800' },
  riskBarTrack: {
    height: 8,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskBarFill: { height: '100%', borderRadius: 4 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  vitalCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 14,
    width: (SCREEN_WIDTH - 50) / 2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 4,
  },
  vitalValue: { fontSize: 22, fontWeight: '800', color: Colors.dark.text },
  vitalUnit: { fontSize: 13, fontWeight: '400', color: Colors.dark.textSecondary },
  vitalLabel: { fontSize: 12, color: Colors.dark.textSecondary },

  chartCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 80,
    gap: 4,
  },
  chartBar: {},
  chartLabel: { fontSize: 11, color: Colors.dark.textMuted, textAlign: 'center', marginTop: 8 },

  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 16,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  predictText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  predictionCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 20,
  },
  predictionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  predictionTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.text },
  predictionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  predictionLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  alertBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  alertBadgeText: { fontSize: 13, fontWeight: '700' },
  factorsTitle: { fontSize: 13, fontWeight: '600', color: Colors.dark.textSecondary, marginBottom: 10 },
  factorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  factorLabel: { fontSize: 13, color: Colors.dark.text, width: 100, textTransform: 'capitalize' },
  factorBarTrack: { flex: 1, height: 6, backgroundColor: Colors.dark.surfaceElevated, borderRadius: 3, overflow: 'hidden' },
  factorBarFill: { height: '100%', borderRadius: 3 },
  factorValue: { fontSize: 12, fontWeight: '600', color: Colors.dark.textSecondary, width: 35, textAlign: 'right' },

  baselineCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  baselineTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark.text, marginBottom: 10 },
  baselineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  baselineLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  baselineValue: { fontSize: 13, fontWeight: '600', color: Colors.dark.text },
});
