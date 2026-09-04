import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { useFarmFilter } from '../context/FarmFilterContext';
import { colors, radius, spacing } from '../theme/colors';

// Farm-scope selector for admin-level accounts, shown at the top of every
// report screen. Renders nothing for an account already locked to one farm
// (Farm Staff, Veterinarian) — mirrors FarmFilterBar.tsx on the web, which
// hides itself the same way for the same accounts.
//
// Rendered as a single dropdown control (tap to open a modal list) rather
// than a scrollable chip row, so the current selection is always visible
// without having to scroll a row of chips.
export default function FarmPicker() {
  const { canPickFarm, farmOptions, selectedFarm, setSelectedFarm } = useFarmFilter();
  const [open, setOpen] = useState(false);
  if (!canPickFarm || farmOptions.length === 0) return null;

  const options = ['All farms', ...farmOptions];
  const currentLabel = selectedFarm || 'All farms';

  const handleSelect = (label: string) => {
    setSelectedFarm(label === 'All farms' ? null : label);
    setOpen(false);
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.75}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderRadius: radius.md,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Farm:
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{currentLabel}</Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>{'▾'}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(26,25,23,0.35)', justifyContent: 'center', paddingHorizontal: spacing.xl }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.white,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              maxHeight: '60%',
              overflow: 'hidden'
            }}
            onPress={() => {}}
          >
            <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderFaint }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Select farm</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const active = item === currentLabel;
                return (
                  <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.7}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: spacing.lg,
                        paddingVertical: 13,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderFaint,
                        backgroundColor: active ? colors.tintGreen : colors.white
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: active ? '700' : '600', color: active ? colors.greenDark : colors.textPrimary }}>
                        {item}
                      </Text>
                      {active ? <Text style={{ color: colors.green, fontWeight: '700' }}>{'✓'}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
