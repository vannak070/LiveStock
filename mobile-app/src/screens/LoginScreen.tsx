import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useAuth, ApiError } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, checkServer, DEFAULT_API_URL, EMULATOR_API_URL } from '../api/client';
import { colors, spacing } from '../theme/colors';

// Brand-green sign-in screen. The earlier version put a warm beige card on
// the green, and beige against saturated green is what read as muddy — so
// the card is pure white here and every surface inside it is tinted from the
// same green rather than from a neutral. That keeps the green field the user
// asked for while letting the form sit in it instead of fighting it.
//
// The server address is editable here on purpose: it is baked in at build
// time, but an emulator, a phone on the office Wi-Fi and a real server each
// need a different one, and rebuilding for that is not reasonable.
export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | 'server' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [showServer, setShowServer] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [serverStatus, setServerStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then(setServerUrl).catch(() => setServerUrl(DEFAULT_API_URL));
  }, []);

  const canSubmit = !!email.trim() && !!password && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid email or password.');
      // A connection failure is not a credentials problem — surface the fix.
      if (err instanceof ApiError && err.status === 0) setShowServer(true);
    } finally {
      setSubmitting(false);
    }
  };

  const applyServer = async (value: string) => {
    const saved = await setApiBaseUrl(value);
    setServerUrl(saved);
    setServerStatus(null);
    setError('');
    return saved;
  };

  const handleTest = async () => {
    setTesting(true);
    setServerStatus(null);
    try {
      setServerStatus(await checkServer(await applyServer(serverUrl)));
    } finally {
      setTesting(false);
    }
  };

  const handleUseEmulator = async () => {
    await applyServer(EMULATOR_API_URL);
    setServerStatus(await checkServer(EMULATOR_API_URL));
  };

  const handleReset = async () => {
    setServerUrl(await resetApiBaseUrl());
    setServerStatus(null);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* A soft green band anchors the brand without flooding the screen. */}
      <View style={styles.band} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoDisc}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Cam Cow Co., Ltd. logo"
            />
          </View>
          <Text style={styles.brand}>CC REPORT</Text>
          <View style={styles.accentRule} />
          <Text style={styles.company}>Cam Cow Co., Ltd.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to view your farm reports</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, focused === 'email' && styles.inputFocused]}
            placeholder="name@camcow.com.kh"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <View style={[styles.passwordWrap, focused === 'password' && styles.inputFocused]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={10} activeOpacity={0.6}>
              <Text style={styles.showToggle}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Log in</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowServer(s => !s)} activeOpacity={0.6} style={styles.serverToggle}>
            <Text style={styles.serverToggleText}>{showServer ? 'Hide server settings' : 'Server settings'}</Text>
          </TouchableOpacity>

          {showServer && (
            <View style={styles.serverPanel}>
              <Text style={styles.serverHint}>
                Where the Cam Cow backend is running. Use Emulator when testing on an Android emulator, or your computer&apos;s Wi-Fi address on a real phone.
              </Text>

              <TextInput
                style={[styles.input, styles.serverInput, focused === 'server' && styles.inputFocused]}
                placeholder="http://192.168.1.50:3002/api/v1"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                value={serverUrl}
                onChangeText={setServerUrl}
                onFocus={() => setFocused('server')}
                onBlur={() => setFocused(null)}
              />

              <View style={styles.serverActions}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleTest} disabled={testing} activeOpacity={0.8}>
                  {testing
                    ? <ActivityIndicator color={colors.green} size="small" />
                    : <Text style={styles.secondaryBtnText}>Save &amp; test</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleUseEmulator} activeOpacity={0.8}>
                  <Text style={styles.secondaryBtnText}>Emulator</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleReset} activeOpacity={0.8}>
                  <Text style={styles.secondaryBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>

              {serverStatus && (
                <View style={[styles.statusBox, serverStatus.ok ? styles.statusOk : styles.statusBad]}>
                  <Text style={[styles.statusText, { color: serverStatus.ok ? colors.greenDark : colors.redDark }]}>
                    {serverStatus.message}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={styles.footnote}>Read-only reports for management.{'\n'}All data entry happens in the operations app.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Tints derived from the brand green (#118F45) so the card and its fields
// belong to the background rather than sitting on it as foreign neutrals.
const GREEN_DEEP = '#0D7A3B';     // lower half, adds depth to the flat field
const ON_GREEN_SOFT = '#CDE8D8';  // secondary text on green
const CARD_EDGE = '#DCEAE1';      // green-tinted card border
const FIELD_FILL = '#F1F8F4';     // input background
const FIELD_EDGE = '#DCEAE1';     // input border
const BTN_IDLE = '#A9D5BD';       // disabled action

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.green },
  // A deeper green behind the lower half gives the flat brand colour some
  // depth without pulling in a gradient library.
  band: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', backgroundColor: GREEN_DEEP },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xxl },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoDisc: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#0C6B33',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  logo: { width: 88, height: 88 },
  brand: { color: colors.white, fontSize: 25, fontWeight: '800', letterSpacing: 3 },
  accentRule: { width: 40, height: 3, borderRadius: 2, backgroundColor: colors.red, marginTop: spacing.sm, marginBottom: spacing.sm },
  company: { color: ON_GREEN_SOFT, fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: CARD_EDGE,
    shadowColor: '#042A16',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  cardTitle: { fontSize: 21, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.4 },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },

  // Sentence case rather than tiny uppercase — easier to read, less shouty.
  label: { fontSize: 13, fontWeight: '600', color: colors.textFaint, marginTop: spacing.lg, marginBottom: 7 },
  input: {
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_EDGE,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary
  },
  inputFocused: { borderColor: colors.green, backgroundColor: colors.white },

  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_EDGE,
    borderRadius: 13,
    paddingHorizontal: 15
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.textPrimary },
  showToggle: { fontSize: 13, fontWeight: '700', color: colors.green, paddingLeft: 10 },

  errorBox: {
    backgroundColor: colors.tintRed,
    borderWidth: 1,
    borderColor: colors.tintRedBorder,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginTop: spacing.lg
  },
  errorText: { color: colors.redDark, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  button: {
    backgroundColor: colors.green,
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.green,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  // Reads as 'not yet' rather than broken — a grey or ghosted slab reads
  // like a bug.
  buttonDisabled: { backgroundColor: BTN_IDLE, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 15.5, letterSpacing: 0.3 },

  serverToggle: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: 4 },
  serverToggleText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },

  serverPanel: { borderTopWidth: 1, borderTopColor: colors.borderFaint, paddingTop: spacing.md, marginTop: spacing.sm },
  serverHint: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: spacing.sm },
  serverInput: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 0 },
  serverActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secondaryBtn: {
    flex: 1,
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_EDGE,
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center'
  },
  secondaryBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.textFaint },

  statusBox: { borderRadius: 11, paddingHorizontal: 13, paddingVertical: 11, marginTop: spacing.sm, borderWidth: 1 },
  statusOk: { backgroundColor: colors.tintGreen, borderColor: colors.tintGreenBorder },
  statusBad: { backgroundColor: colors.tintRed, borderColor: colors.tintRedBorder },
  statusText: { fontSize: 12.5, fontWeight: '600', lineHeight: 18 },

  footnote: { fontSize: 12, color: ON_GREEN_SOFT, textAlign: 'center', marginTop: spacing.xl, marginHorizontal: spacing.xl, lineHeight: 18 }
});
