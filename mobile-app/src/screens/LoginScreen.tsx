import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useAuth, ApiError } from '../context/AuthContext';
import { colors, spacing } from '../theme/colors';

// Brand-green sign-in screen. The earlier version put a warm beige card on
// the green, and beige against saturated green is what read as muddy — so
// the card is pure white here and every surface inside it is tinted from the
// same green rather than from a neutral. That keeps the green field the user
// asked for while letting the form sit in it instead of fighting it.
//
// PIN-only, deliberately: this app is for management review, and a second
// sign-in path (email/password) invites the wrong question about which one
// to use. Anyone with reporting access gets a PIN from an administrator.
export default function LoginScreen() {
  const { loginWithPin } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pin, setPin] = useState('');
  const PIN_LENGTH = 6;

  const submitPin = async (value: string) => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithPin(value);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Incorrect PIN.');
      setPin('');
    } finally {
      setSubmitting(false);
    }
  };

  const pressDigit = (d: string) => {
    if (submitting || pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    setError('');
    // Submit on the last digit — no separate confirm step to tap.
    if (next.length === PIN_LENGTH) submitPin(next);
  };

  const pressBackspace = () => {
    if (submitting) return;
    setPin(p => p.slice(0, -1));
    setError('');
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
          <Text style={styles.company}>Cam Cow Co., Ltd.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Enter your PIN to view reports</Text>

          <View style={styles.pinDots}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotFilled]} />
            ))}
          </View>

          {error ? (
            <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
          ) : null}

          {submitting ? (
            <View style={{ paddingVertical: spacing.xl }}>
              <ActivityIndicator color={colors.green} />
            </View>
          ) : (
            <View style={styles.keypad}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.key, k === '' && styles.keyBlank]}
                  onPress={() => (k === '⌫' ? pressBackspace() : k ? pressDigit(k) : undefined)}
                  disabled={k === ''}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.keyText, k === '⌫' && styles.keyTextSmall]}>{k}</Text>
                </TouchableOpacity>
              ))}
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
  brand: { color: colors.white, fontSize: 25, fontWeight: '800', letterSpacing: 3, marginBottom: spacing.sm },
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

  pinDots: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: spacing.lg, marginBottom: spacing.md },
  pinDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: FIELD_EDGE, backgroundColor: FIELD_FILL },
  pinDotFilled: { backgroundColor: colors.green, borderColor: colors.green },

  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.sm },
  key: {
    width: '31%',
    aspectRatio: 1.7,
    marginBottom: spacing.sm,
    borderRadius: 13,
    backgroundColor: FIELD_FILL,
    borderWidth: 1.5,
    borderColor: FIELD_EDGE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keyBlank: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontSize: 23, fontWeight: '700', color: colors.textPrimary },
  keyTextSmall: { fontSize: 19, color: colors.textSecondary },

  footnote: { fontSize: 12, color: ON_GREEN_SOFT, textAlign: 'center', marginTop: spacing.xl, marginHorizontal: spacing.xl, lineHeight: 18 }
});
