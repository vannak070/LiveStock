import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

export function ScreenScroll({
  children,
  refreshing,
  onRefresh
}: {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.green} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function BackRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{'‹'} {label}</Text>
    </TouchableOpacity>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, accent = colors.green }: { title: string; accent?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: spacing.sm }}>
      <View style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: accent }} />
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
    </View>
  );
}

export function KpiTile({
  label,
  value,
  hint,
  tone = 'default'
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'brand' | 'danger';
}) {
  const isBrand = tone === 'brand';
  const isDanger = tone === 'danger';
  return (
    <View
      style={[
        styles.kpiTile,
        isBrand && { backgroundColor: colors.green, borderColor: colors.green },
        isDanger && { backgroundColor: colors.tintRed, borderColor: colors.tintRedBorder }
      ]}
    >
      <Text style={[styles.kpiLabel, isBrand && { color: '#DFF2E7' }, isDanger && { color: colors.redDark }]}>{label}</Text>
      <Text style={[styles.kpiValue, isBrand && { color: colors.white }, isDanger && { color: colors.red }]}>{value}</Text>
      {hint ? <Text style={[styles.kpiHint, isBrand && { color: '#DFF2E7' }, isDanger && { color: colors.redDark }]}>{hint}</Text> : null}
    </View>
  );
}

export function Pill({ label, tone = 'grey' }: { label: string; tone?: 'green' | 'amber' | 'red' | 'grey' }) {
  const map: Record<string, { bg: string; color: string }> = {
    green: { bg: colors.tintGreen, color: colors.greenDark },
    amber: { bg: colors.tintAmber, color: colors.amber },
    red: { bg: colors.tintRed, color: colors.redDark },
    grey: { bg: colors.tintGrey, color: colors.textSecondary }
  };
  const c = map[tone];
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill }}>
      <Text style={{ fontSize: 9.5, fontWeight: '700', color: c.color, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ pct, color = colors.green }: { pct: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgRoot, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${clamped}%`, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export function LoadingView({ label = 'Loading report…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.green} size="large" />
      <Text style={{ marginTop: spacing.md, color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.red, textAlign: 'center', marginBottom: 6 }}>Couldn't load this report</Text>
      <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl }}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
        <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12.5 }}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

export function EmptyRow({ label }: { label: string }) {
  return (
    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function Row({
  left,
  right,
  onPress,
  style
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={[styles.row, style]} activeOpacity={0.7}>
      <View style={{ flex: 1, minWidth: 0 }}>{left}</View>
      {right ? <View>{right}</View> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 27, fontWeight: '700', letterSpacing: -0.6, color: colors.textPrimary },
  subtitle: { fontSize: 11.5, color: colors.textSecondary, marginTop: 3, fontFamily: 'Menlo' },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg
  },
  kpiTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14
  },
  kpiLabel: { fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textSecondary, marginBottom: 8, fontWeight: '700' },
  kpiValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.8, color: colors.textPrimary },
  kpiHint: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, backgroundColor: colors.bg },
  retryBtn: { backgroundColor: colors.green, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill },
  row: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  }
});
