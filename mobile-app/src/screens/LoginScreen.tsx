import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useAuth, ApiError } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.brand}>CAM COW CO., LTD.</Text>
        <Text style={styles.tagline}>Management reports</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="name@camcow.com.kh"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting || !email || !password}>
          {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Log in</Text>}
        </TouchableOpacity>

        <Text style={styles.footnote}>Read-only reports for management. All data entry happens in the operations app.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  header: { backgroundColor: colors.green, paddingVertical: 40, alignItems: 'center' },
  brand: { color: colors.white, fontSize: 16, fontWeight: '800', letterSpacing: 1.3 },
  tagline: { color: '#BFE6CE', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 6 },
  form: { padding: spacing.xl, gap: spacing.sm },
  label: { fontSize: 10.5, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary
  },
  error: { color: colors.red, fontSize: 12, fontWeight: '600', marginTop: 4 },
  button: {
    backgroundColor: colors.green,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md
  },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.4 },
  footnote: { fontSize: 10.5, color: colors.muted, textAlign: 'center', marginTop: spacing.lg, lineHeight: 15 }
});
