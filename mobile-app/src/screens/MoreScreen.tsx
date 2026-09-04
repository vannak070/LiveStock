import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenScroll, ScreenTitle, Card } from '../components/ui';
import { useFarmFilter } from '../context/FarmFilterContext';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// "Fattening cycles" (the Batches report) is intentionally not listed here
// anymore — hidden from the mobile nav per product request. The screen and
// its route are still registered (RootNavigator.tsx) so nothing dangles.
const ROWS: { label: string; hint: string; accent: string; screen: keyof RootStackParamList }[] = [
  { label: 'Farm comparison', hint: 'Net profit ranked by farm', accent: colors.green, screen: 'Farms' },
  { label: 'Growth trends', hint: 'Average daily weight gain', accent: colors.green, screen: 'Growth' },
  { label: 'Sales reporting', hint: 'By farm and by period', accent: colors.amber, screen: 'Sales' },
  { label: 'Health & veterinary', hint: 'Alerts and treatment log', accent: colors.red, screen: 'Health' },
  { label: 'Feed inventory', hint: 'Stock levels by product', accent: colors.amber, screen: 'Feed' },
  { label: 'Fattening proposal', hint: 'Annual plan & profitability', accent: colors.green, screen: 'Proposal' },
  { label: 'Account', hint: 'Your profile and session', accent: colors.muted, screen: 'Settings' }
];

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  return (
    <ScreenScroll>
      <ScreenTitle title="Reports" subtitle={effectiveFarm ? `Scoped to ${effectiveFarm}` : 'All farms'} />
      <Card style={{ padding: 0 }}>
        {ROWS.map((r, idx) => (
          <TouchableOpacity key={r.screen} onPress={() => navigation.navigate(r.screen as any)}>
            <View style={{
              padding: 14,
              borderBottomWidth: idx === ROWS.length - 1 ? 0 : 1,
              borderBottomColor: colors.borderFaint,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11
            }}>
              <View style={{ width: 4, height: 26, borderRadius: 2, backgroundColor: r.accent }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{r.label}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{r.hint}</Text>
              </View>
              <Text style={{ color: colors.border, fontSize: 16 }}>{'›'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    </ScreenScroll>
  );
}
