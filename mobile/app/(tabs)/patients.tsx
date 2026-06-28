import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { patientService } from '../../services/api';

export default function PatientsScreen() {
  const [patients, setPatients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPatients = async () => {
    const data = await patientService.getPatients();
    setPatients(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(patients);
    } else {
      setFiltered(
        patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      );
    }
  }, [search, patients]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const getRiskColor = (score: number) =>
    score >= 70 ? Colors.dark.danger : score >= 40 ? Colors.dark.warning : Colors.dark.success;

  const renderPatient = ({ item }: { item: any }) => {
    const riskColor = getRiskColor(item.riskScore);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/patient/${item.id}`)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.avatar, { backgroundColor: riskColor + '15', borderColor: riskColor + '30' }]}
        >
          <Text style={[styles.avatarText, { color: riskColor }]}>
            {item.name.split(' ').map((n: string) => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{item.name}</Text>
          <Text style={styles.rowMeta}>
            {item.age}y {item.sex} | {item.severity} | FEV1: {item.baselineFEV1}%
          </Text>
        </View>
        <View style={[styles.riskPill, { backgroundColor: riskColor + '15' }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
          <Text style={[styles.riskText, { color: riskColor }]}>{item.riskScore}%</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.dark.textMuted} style={{ marginLeft: 14 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          placeholderTextColor={Colors.dark.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 14 }}>
            <Ionicons name="close-circle" size={18} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyText}>
              {loading ? 'Loading patients...' : 'No patients found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: Colors.dark.text,
    fontSize: 15,
  },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: { fontSize: 14, fontWeight: '800' },
  rowInfo: { flex: 1, marginLeft: 12 },
  rowName: { fontSize: 15, fontWeight: '700', color: Colors.dark.text },
  rowMeta: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 3 },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    gap: 5,
  },
  riskDot: { width: 7, height: 7, borderRadius: 4 },
  riskText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.dark.textMuted },
});
