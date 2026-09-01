import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ScreenScroll, BackRow, ScreenTitle, Card, Pill } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const initials = (user?.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScreenScroll>
      <BackRow label="Reports" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Account" />

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: spacing.md }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.tintGreen, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.green }}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15.5, fontWeight: '600' }}>{user?.name}</Text>
          <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 2 }}>{user?.email}</Text>
        </View>
        <Pill label="Read-only" />
      </Card>

      <Card style={{ padding: 0, marginBottom: spacing.md }}>
        {[
          ['Role', user?.role || '—'],
          ['Farm scope', user?.farmLocation || 'All farms'],
          ['Status', user?.status || '—']
        ].map(([label, value], idx, arr) => (
          <View key={label} style={{ padding: 13, borderBottomWidth: idx === arr.length - 1 ? 0 : 1, borderBottomColor: colors.borderFaint, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13.5 }}>{label}</Text>
            <Text style={{ fontSize: 12.5, color: colors.textSecondary }}>{value}</Text>
          </View>
        ))}
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textFaint }}>
          This app is read-only. It shows herd, batch, financial, sales, health, and feed reports pulled live from your LiveStock ERP.
          All data entry — weigh-ins, purchases, treatments, sales — is done by operations staff in the main app.
        </Text>
      </Card>

      <TouchableOpacity onPress={logout} style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text style={{ color: colors.red, fontWeight: '700', fontSize: 13 }}>Log out</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', fontSize: 10.5, color: colors.muted, marginTop: spacing.xl }}>Cam Cow ERP Reports v1.0.0</Text>
    </ScreenScroll>
  );
}
