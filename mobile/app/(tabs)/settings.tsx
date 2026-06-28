import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
  const { userEmail, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const SettingsRow = ({
    icon,
    title,
    subtitle,
    color = Colors.dark.textSecondary,
    onPress,
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? Colors.dark.dangerGlow : Colors.dark.primaryGlow }]}>
        <Ionicons name={icon} size={20} color={danger ? Colors.dark.danger : Colors.dark.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, danger && { color: Colors.dark.danger }]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={28} color={Colors.dark.primary} />
        </View>
        <View>
          <Text style={styles.profileName}>Physician</Text>
          <Text style={styles.profileEmail}>{userEmail || 'Not signed in'}</Text>
        </View>
      </View>

      {/* General Settings */}
      <Text style={styles.sectionLabel}>General</Text>
      <View style={styles.section}>
        <SettingsRow icon="notifications-outline" title="Notifications" subtitle="Push alerts for high-risk patients" />
        <SettingsRow icon="moon-outline" title="Appearance" subtitle="Dark mode (default)" />
        <SettingsRow icon="language-outline" title="Language" subtitle="English" />
      </View>

      {/* AI & Data Settings */}
      <Text style={styles.sectionLabel}>AI Model</Text>
      <View style={styles.section}>
        <SettingsRow icon="hardware-chip-outline" title="Model Version" subtitle="PatchTST v1 - CAMP fine-tuned" />
        <SettingsRow icon="server-outline" title="API Endpoint" subtitle="asthmaguard.onrender.com" />
        <SettingsRow icon="shield-checkmark-outline" title="Data Compliance" subtitle="HIPAA / NIH DUA" />
      </View>

      {/* Account */}
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.section}>
        <SettingsRow
          icon="log-out-outline"
          title="Log Out"
          onPress={handleLogout}
          danger
        />
      </View>

      <Text style={styles.version}>AsthmaGuard AI v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 14,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: { fontSize: 17, fontWeight: '700', color: Colors.dark.text },
  profileEmail: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 2 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark.text },
  rowSubtitle: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  version: {
    textAlign: 'center',
    color: Colors.dark.textMuted,
    fontSize: 12,
    marginTop: 30,
  },
});
