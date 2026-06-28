import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendMagicLink } = useAuth();

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    const result = await sendMagicLink(email);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Background Glow Effects */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <LinearGradient
          colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}
        >
          <Ionicons name="fitness" size={36} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>AsthmaGuard AI</Text>
        <Text style={styles.subtitle}>Secure Physician Portal</Text>

        {success ? (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.dark.success} />
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successText}>
              We sent a secure magic link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle" size={20} color={Colors.dark.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Authorized Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.dark.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="doctor@hospital.com"
                placeholderTextColor={Colors.dark.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !email}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, (!email || loading) && styles.buttonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -50,
    right: -80,
    width: 250,
    height: 350,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.primaryLight,
    marginTop: 6,
    marginBottom: 36,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 14,
    marginBottom: 20,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    color: Colors.dark.text,
    fontSize: 16,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.dangerGlow,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    color: Colors.dark.danger,
    fontSize: 13,
    flex: 1,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: Colors.dark.successGlow,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    gap: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.success,
  },
  successText: {
    fontSize: 14,
    color: 'rgba(52, 211, 153, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.dark.success,
  },
});
