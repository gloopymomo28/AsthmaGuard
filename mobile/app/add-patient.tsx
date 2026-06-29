import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { patientService } from '../services/api';

export default function AddPatientScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    sex: 'Male',
    severity: 'Mild Intermittent',
    baselineFEV1: '',
    smokingStatus: 'Never Smoked',
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.baselineFEV1) {
      Alert.alert('Missing Fields', 'Please fill in Name, Age, and Baseline FEV1.');
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name,
      age: Number(form.age),
      sex: form.sex,
      weight_kg: 70.0,
      height_cm: 170.0,
      asthma_severity: form.severity,
      baseline_fev1_percent: Number(form.baselineFEV1),
      smoking_status: form.smokingStatus,
      feno_level: 0,
      blood_eosinophils: 0,
      fvc: 0,
      fev1_fvc_ratio: 0,
      methacholine_pc20: 0,
      act_score: 25,
      exacerbations_last_year: 0,
      comorbidities: [],
      allergies: [],
      riskScore: Math.floor(Math.random() * 40) + 10,
      lastUpdated: 'Just now',
      trend: [20, 25, 22, 28],
      vitals: { hr: 75, rr: 14, spo2: 98, pef: 350 },
    };

    const result = await patientService.createPatient(payload);
    setLoading(false);

    if (result) {
      Alert.alert('Success', `${form.name} has been added.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to add patient. Check your connection.');
    }
  };

  const SexOption = ({ value }: { value: string }) => (
    <TouchableOpacity
      style={[styles.sexOption, form.sex === value && styles.sexOptionActive]}
      onPress={() => update('sex', value)}
    >
      <Text style={[styles.sexOptionText, form.sex === value && styles.sexOptionTextActive]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  const SeverityOption = ({ value }: { value: string }) => (
    <TouchableOpacity
      style={[styles.severityOption, form.severity === value && styles.severityOptionActive]}
      onPress={() => update('severity', value)}
    >
      <Text
        style={[styles.severityOptionText, form.severity === value && styles.severityOptionTextActive]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Jane Doe"
        placeholderTextColor={Colors.dark.textMuted}
        value={form.name}
        onChangeText={(v) => update('name', v)}
      />

      {/* Age */}
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 34"
        placeholderTextColor={Colors.dark.textMuted}
        keyboardType="numeric"
        value={form.age}
        onChangeText={(v) => update('age', v)}
      />

      {/* Sex */}
      <Text style={styles.label}>Sex</Text>
      <View style={styles.sexRow}>
        <SexOption value="Male" />
        <SexOption value="Female" />
        <SexOption value="Other" />
      </View>

      {/* Baseline FEV1 */}
      <Text style={styles.label}>Baseline FEV1 (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 85"
        placeholderTextColor={Colors.dark.textMuted}
        keyboardType="numeric"
        value={form.baselineFEV1}
        onChangeText={(v) => update('baselineFEV1', v)}
      />

      {/* Severity */}
      <Text style={styles.label}>Asthma Severity</Text>
      <View style={styles.severityGrid}>
        <SeverityOption value="Mild Intermittent" />
        <SeverityOption value="Mild Persistent" />
        <SeverityOption value="Moderate Persistent" />
        <SeverityOption value="Severe Persistent" />
      </View>

      {/* Submit */}
      <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.submitText}>Add Patient</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
    fontSize: 15,
    color: Colors.dark.text,
  },
  sexRow: { flexDirection: 'row', gap: 10 },
  sexOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
  },
  sexOptionActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primaryGlow,
  },
  sexOptionText: { fontSize: 14, color: Colors.dark.textSecondary, fontWeight: '600' },
  sexOptionTextActive: { color: Colors.dark.primary },
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  severityOption: {
    width: '47%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
  },
  severityOptionActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primaryGlow,
  },
  severityOptionText: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '600' },
  severityOptionTextActive: { color: Colors.dark.primary },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    marginTop: 30,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
