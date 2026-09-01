import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenScroll, ScreenTitle, Card } from '../components/ui';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ROWS: { label: string; hint: string; accent: string; screen: keyof RootStackParamList }[] = [
  { label: 'Fattening cycles', hint: 'Active & closed batches', accent: colors.green, screen: 'Batches' },
  { label: 'Farm comparison', hint: 'Net profit ranked by farm', accent: colors.green, screen: 'Farms' },
  { label: 'Growth trends', hint: 'Average daily weight gain', accent: colors.green, screen: 'Growth' },
  { label: 'Sales reporting', hint: 'By farm and by period', accent: colors.amber, screen: 'Sales' },
  { label: 'Health & veterinary', hint: 'Alerts and treatment log', accent: colors.red, screen: 'Health' },
  { label: 'Feed inventory', hint: 'Stock levels by product', accent: colors.amber, screen: 'Feed' },
  { label: 'Account', hint: 'Your profile and session', accent: colors.muted, screen: 'Settings' }
];

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <ScreenScroll>
      <ScreenTitle title="Reports" />
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
