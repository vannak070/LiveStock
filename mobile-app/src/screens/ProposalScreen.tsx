import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiData } from '../hooks/useApiData';
import { ProposalPlanParams, ProposalPlanRecord } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, KpiTile, Card, SectionHeader, LoadingView, ErrorView } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { formatMoney } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Mirrors DEFAULT_PLAN in the web ProposalPlanTab.tsx. Management must be
// able to model an idea without waiting for someone to save a plan on the
// web first, so these are the starting figures when nothing is saved yet.
const BENCHMARK_PLAN: ProposalPlanParams = {
  targetStockLevel: 400,
  numberOfBatches: 10,
  cattlePerBatch: 40,
  initialWeightKg: 300,
  dailyWeightGainKg: 1.25,
  fatteningPeriodDays: 120,
  purchasePricePerKgKhr: 11000,
  sellingPricePerKgKhr: 12500,
  bankInterestRateAnnual: 8.0,
  grassKgPerHeadDay: 30,
  grassCostPerKgKhr: 200,
  concentrateKgPerHeadDay: 7,
  concentrateCostPerKgKhr: 1200
};

// Re-derives the same annual-summary figures the web Proposal/Plan tool
// computes (ProposalPlanTab.tsx's `calculations` useMemo) — identical
// formulas, identical variable names, so the two never drift apart.
//
// Here the assumptions are editable so management can model a scenario on
// the spot and talk it through with someone. Nothing is written anywhere:
// no API call, no database, not even local storage. The company plan is
// fetched once as the starting point, every edit lives in component state
// for as long as the screen is open, and "Reset" puts it back. Closing the
// screen discards the scenario — which is the intent, not a limitation.
function computeSummary(params: ProposalPlanParams) {
  const {
    targetStockLevel,
    numberOfBatches,
    initialWeightKg,
    dailyWeightGainKg,
    fatteningPeriodDays,
    purchasePricePerKgKhr,
    sellingPricePerKgKhr,
    bankInterestRateAnnual,
    grassKgPerHeadDay,
    grassCostPerKgKhr,
    concentrateKgPerHeadDay,
    concentrateCostPerKgKhr
  } = params;

  const totalCattle = targetStockLevel || 400;
  // Cattle per batch is not an independent figure — it is the herd split
  // across the batches, so it is derived rather than typed. Keeping it as a
  // free input let the three numbers drift into states that cannot exist.
  const batches = Math.max(1, Math.round(numberOfBatches || 1));
  const cattlePerBatch = Math.max(1, Math.round(totalCattle / batches));
  const fatteningMonths = Math.max(1, Math.round(fatteningPeriodDays / 30));
  const monthlyBatchQty = Math.max(1, Math.round(totalCattle / fatteningMonths));
  const monthlySalesTarget = monthlyBatchQty;
  const monthlyReplacementPurchase = monthlyBatchQty;

  const totalWeightGainKgPerHead = dailyWeightGainKg * fatteningPeriodDays;
  const finalWeightKgPerHead = initialWeightKg + totalWeightGainKgPerHead;

  const purchasePricePerHeadKhr = initialWeightKg * purchasePricePerKgKhr;
  const sellingPricePerHeadKhr = finalWeightKgPerHead * sellingPricePerKgKhr;

  const dailyGrassKgTotal = totalCattle * grassKgPerHeadDay;
  const monthlyGrassKgTotal = dailyGrassKgTotal * 30;
  const monthlyGrassCostKhr = monthlyGrassKgTotal * grassCostPerKgKhr;

  const dailyConcentrateKgTotal = totalCattle * concentrateKgPerHeadDay;
  const monthlyConcentrateKgTotal = dailyConcentrateKgTotal * 30;
  const monthlyConcentrateCostKhr = monthlyConcentrateKgTotal * concentrateCostPerKgKhr;

  const monthlyTotalFeedCostKhr = monthlyGrassCostKhr + monthlyConcentrateCostKhr;

  const perHeadPeriodGrassCostKhr = grassKgPerHeadDay * fatteningPeriodDays * grassCostPerKgKhr;
  const perHeadPeriodConcentrateCostKhr = concentrateKgPerHeadDay * fatteningPeriodDays * concentrateCostPerKgKhr;
  const perHeadPeriodTotalFeedCostKhr = perHeadPeriodGrassCostKhr + perHeadPeriodConcentrateCostKhr;

  const initialCattlePurchaseKhr = totalCattle * purchasePricePerHeadKhr;
  const monthlyInterestRateFraction = (bankInterestRateAnnual / 100) / 12;
  const monthlyBankInterestKhr = initialCattlePurchaseKhr * monthlyInterestRateFraction;

  const monthlyReplacementPurchaseKhr = monthlyReplacementPurchase * purchasePricePerHeadKhr;
  const monthlySalesRevenueKhr = monthlySalesTarget * sellingPricePerHeadKhr;

  const annualCattlePurchasesKhr = monthlyReplacementPurchaseKhr * 12;
  const annualTotalFeedCostKhr = monthlyTotalFeedCostKhr * 12;
  const annualBankInterestKhr = monthlyBankInterestKhr * 12;

  const annualTotalFarmCostKhr = annualCattlePurchasesKhr + annualTotalFeedCostKhr + annualBankInterestKhr;
  const annualSalesRevenueKhr = monthlySalesRevenueKhr * 12;
  const annualNetProfitKhr = annualSalesRevenueKhr - annualTotalFarmCostKhr;

  const annualNetMarginPercent = annualSalesRevenueKhr > 0 ? (annualNetProfitKhr / annualSalesRevenueKhr) * 100 : 0;
  const annualRoiPercent = initialCattlePurchaseKhr > 0 ? (annualNetProfitKhr / initialCattlePurchaseKhr) * 100 : 0;

  const revenuePerCattleKhr = sellingPricePerHeadKhr;
  const bankInterestPerCattleKhr = purchasePricePerHeadKhr * (monthlyInterestRateFraction * fatteningMonths);
  const totalCostPerCattleKhr = purchasePricePerHeadKhr + perHeadPeriodTotalFeedCostKhr + bankInterestPerCattleKhr;
  const profitPerCattleKhr = revenuePerCattleKhr - totalCostPerCattleKhr;
  const profitMarginPercent = revenuePerCattleKhr > 0 ? (profitPerCattleKhr / revenuePerCattleKhr) * 100 : 0;

  const perBatchPeriodTotalFeedCostKhr = perHeadPeriodTotalFeedCostKhr * cattlePerBatch;
  const batchRevenueKhr = cattlePerBatch * sellingPricePerHeadKhr;
  const batchTotalCostKhr = (cattlePerBatch * purchasePricePerHeadKhr) + perBatchPeriodTotalFeedCostKhr + (cattlePerBatch * bankInterestPerCattleKhr);
  const batchNetProfitKhr = batchRevenueKhr - batchTotalCostKhr;

  return {
    totalCattle,
    batches,
    cattlePerBatch,
    batchRevenueKhr,
    batchTotalCostKhr,
    batchNetProfitKhr,
    fatteningMonths,
    finalWeightKgPerHead,
    purchasePricePerHeadKhr,
    sellingPricePerHeadKhr,
    annualSalesRevenueKhr,
    annualTotalFarmCostKhr,
    annualNetProfitKhr,
    annualNetMarginPercent,
    annualRoiPercent,
    profitPerCattleKhr,
    totalCostPerCattleKhr,
    revenuePerCattleKhr,
    profitMarginPercent,
    annualCattlePurchasesKhr,
    annualTotalFeedCostKhr,
    annualBankInterestKhr
  };
}

export default function ProposalScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh, refreshing } = useApiData<ProposalPlanRecord | null>('/proposal-plan');

  // `override` holds only what the user has changed; the saved company plan
  // shows through until then. Deriving the draft rather than copying the
  // fetched plan into state via an effect keeps this a single render pass —
  // and means a refresh can never clobber an in-progress scenario.
  const [override, setOverride] = useState<ProposalPlanParams | null>(null);
  // Inputs lead the screen, so they start open — hiding the primary
  // control behind a button made the page look read-only.
  const [showInputs, setShowInputs] = useState(true);

  const saved = data?.params ?? null;
  // Falls back to the benchmark so the planner always works, saved plan or not.
  const draft = override ?? saved ?? BENCHMARK_PLAN;

  const summary = useMemo(() => (draft ? computeSummary(draft) : null), [draft]);

  // Compared field by field, so editing a value back to its original figure
  // correctly stops calling this a scenario.
  const baseline = saved ?? BENCHMARK_PLAN;
  const edited = useMemo(() => {
    if (!override) return false;
    return (Object.keys(override) as (keyof ProposalPlanParams)[]).some(k => override[k] !== baseline[k]);
  }, [override, baseline]);

  const setField = (key: keyof ProposalPlanParams, raw: string) => {
    // Allow an empty box mid-typing without collapsing the whole model.
    const n = raw === '' ? 0 : Number(raw.replace(/[^0-9.]/g, ''));
    setOverride({ ...draft, [key]: isNaN(n) ? 0 : n });
  };

  const resetToSaved = () => setOverride(null);

  if (loading) return <LoadingView label="Loading proposal plan…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle
        title="Fattening proposal"
        subtitle={
          edited
            ? 'Scenario — your figures, not saved'
            : saved
              ? `Company plan · saved ${new Date(data!.updatedAt).toLocaleDateString()}`
              : 'Standard benchmark — no company plan saved yet'
        }
      />

      {summary && (
        <>
          <SectionHeader title="Assumptions" />
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 11.5, color: colors.textSecondary, lineHeight: 17, marginBottom: showInputs ? spacing.sm : 0 }}>
              Set the figures for your proposal. Every result below updates as you type. Nothing here is saved — the company plan is untouched.
            </Text>

            {showInputs && (
              <View style={{ marginTop: 4 }}>
                <FieldGroup title="Herd" />
                <Field label="Target herd size" unit="head" value={draft.targetStockLevel} onChange={v => setField('targetStockLevel', v)} />
                <Field label="Number of batches" unit="batches" value={draft.numberOfBatches} onChange={v => setField('numberOfBatches', v)} />
                <DerivedField label="Cattle per batch" unit={`${summary.totalCattle} head ÷ ${summary.batches} batches`} value={`${summary.cattlePerBatch}`} />

                <FieldGroup title="Growth" />
                <Field label="Entry weight" unit="kg" value={draft.initialWeightKg} onChange={v => setField('initialWeightKg', v)} />
                <Field label="Daily gain" unit="kg/day" value={draft.dailyWeightGainKg} onChange={v => setField('dailyWeightGainKg', v)} />
                <Field label="Fattening period" unit="days" value={draft.fatteningPeriodDays} onChange={v => setField('fatteningPeriodDays', v)} />

                <FieldGroup title="Prices" />
                <Field label="Purchase price" unit="៛/kg" value={draft.purchasePricePerKgKhr} onChange={v => setField('purchasePricePerKgKhr', v)} />
                <Field label="Selling price" unit="៛/kg" value={draft.sellingPricePerKgKhr} onChange={v => setField('sellingPricePerKgKhr', v)} />
                <Field label="Bank interest" unit="%/year" value={draft.bankInterestRateAnnual} onChange={v => setField('bankInterestRateAnnual', v)} />

                <FieldGroup title="Feed" />
                <Field label="Grass intake" unit="kg/head/day" value={draft.grassKgPerHeadDay} onChange={v => setField('grassKgPerHeadDay', v)} />
                <Field label="Grass cost" unit="៛/kg" value={draft.grassCostPerKgKhr} onChange={v => setField('grassCostPerKgKhr', v)} />
                <Field label="Concentrate intake" unit="kg/head/day" value={draft.concentrateKgPerHeadDay} onChange={v => setField('concentrateKgPerHeadDay', v)} />
                <Field label="Concentrate cost" unit="៛/kg" value={draft.concentrateCostPerKgKhr} onChange={v => setField('concentrateCostPerKgKhr', v)} />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <TouchableOpacity style={styles.btn} onPress={() => setShowInputs(v => !v)} activeOpacity={0.8}>
                <Text style={styles.btnText}>{showInputs ? 'Hide figures' : 'Show figures'}</Text>
              </TouchableOpacity>
              {edited && (
                <TouchableOpacity style={styles.btn} onPress={resetToSaved} activeOpacity={0.8}>
                  <Text style={styles.btnText}>{saved ? 'Reset' : 'Benchmark'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>

          {/* Everything from here down is calculated from the figures above. */}
          <SectionHeader title="Results" />
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
            <KpiTile tone="brand" label="Target herd" value={`${summary.totalCattle}`} hint={`${summary.fatteningMonths} mo cycle`} />
            <KpiTile label="Final weight" value={`${Math.round(summary.finalWeightKgPerHead)} kg`} hint="per head" />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <KpiTile label="Purchase / head" value={formatMoney(summary.purchasePricePerHeadKhr)} />
            <KpiTile label="Selling / head" value={formatMoney(summary.sellingPricePerHeadKhr)} />
          </View>

          <SectionHeader title="Annual projection" />
          <Card style={{ marginBottom: spacing.lg }}>
            <Row label="Revenue" value={formatMoney(summary.annualSalesRevenueKhr)} />
            <Row label="Total farm cost" value={formatMoney(summary.annualTotalFarmCostKhr)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.borderFaint }}>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.textPrimary }}>Net profit</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: summary.annualNetProfitKhr >= 0 ? colors.green : colors.red }}>
                {formatMoney(summary.annualNetProfitKhr)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Margin {summary.annualNetMarginPercent.toFixed(1)}%</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>ROI {summary.annualRoiPercent.toFixed(1)}%/yr</Text>
            </View>
          </Card>


          <SectionHeader title="Annual cost breakdown" />
          <Card style={{ marginBottom: spacing.lg }}>
            <Row label="Cattle purchases" value={formatMoney(summary.annualCattlePurchasesKhr)} />
            <Row label="Feed (grass + concentrate)" value={formatMoney(summary.annualTotalFeedCostKhr)} />
            <Row label="Bank interest" value={formatMoney(summary.annualBankInterestKhr)} last />
          </Card>

          <SectionHeader title="Per batch" />
          <Card style={{ marginBottom: spacing.lg }}>
            <Row label={`Revenue (${summary.cattlePerBatch} head)`} value={formatMoney(summary.batchRevenueKhr)} />
            <Row label="Total cost" value={formatMoney(summary.batchTotalCostKhr)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.borderFaint }}>
              <Text style={{ fontSize: 12.5, fontWeight: '700' }}>Net profit per batch</Text>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: summary.batchNetProfitKhr >= 0 ? colors.green : colors.red }}>
                {formatMoney(summary.batchNetProfitKhr)}
              </Text>
            </View>
          </Card>

          <SectionHeader title="Per head economics" />
          <Card>
            <Row label="Revenue" value={formatMoney(summary.revenuePerCattleKhr)} />
            <Row label="Total cost" value={formatMoney(summary.totalCostPerCattleKhr)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.borderFaint }}>
              <Text style={{ fontSize: 12.5, fontWeight: '700' }}>Profit</Text>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: summary.profitPerCattleKhr >= 0 ? colors.green : colors.red }}>
                {formatMoney(summary.profitPerCattleKhr)} ({summary.profitMarginPercent.toFixed(1)}%)
              </Text>
            </View>
          </Card>

          <Text style={styles.footnote}>
            A scenario you model here is never saved and is not visible to anyone else. To change the company plan, use Proposal / Plan in the web app.
          </Text>
        </>
      )}
    </ScreenScroll>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: last ? 0 : 9 }}>
      <Text style={{ fontSize: 11.5, color: colors.textSecondary, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 12.5, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

function FieldGroup({ title }: { title: string }) {
  return <Text style={styles.groupTitle}>{title}</Text>;
}

function Field({
  label,
  unit,
  value,
  onChange
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: string) => void;
}) {
  // While the field has focus the raw keystrokes are shown, not the parsed
  // number. Without this, "1." reformats to "1" mid-entry and a decimal can
  // never be typed, and clearing the box snaps it back to "0".
  const [text, setText] = useState<string | null>(null);

  return (
    <View style={styles.fieldRow}>
      <View style={{ flex: 1, paddingRight: spacing.sm }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
      </View>
      <TextInput
        style={styles.fieldInput}
        value={text ?? String(value)}
        onChangeText={t => {
          const clean = t.replace(/[^0-9.]/g, '');
          setText(clean);
          onChange(clean);
        }}
        onFocus={() => setText(String(value))}
        onBlur={() => setText(null)}
        keyboardType="decimal-pad"
        selectTextOnFocus
      />
    </View>
  );
}

// A figure the model works out for itself — shown, never typed.
function DerivedField({ label, unit, value }: { label: string; unit: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <View style={{ flex: 1, paddingRight: spacing.sm }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldUnit}>{unit}</Text>
      </View>
      <View style={[styles.fieldInput, styles.fieldDerived]}>
        <Text style={styles.fieldDerivedText}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: spacing.md,
    marginBottom: 4
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint
  },
  fieldLabel: { fontSize: 12.5, color: colors.textPrimary, fontWeight: '600' },
  fieldUnit: { fontSize: 10.5, color: colors.muted, marginTop: 1 },
  fieldInput: {
    width: 108,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right'
  },
  fieldDerived: {
    backgroundColor: colors.tintGreen,
    borderColor: colors.tintGreenBorder,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  fieldDerivedText: { fontSize: 14, fontWeight: '700', color: colors.greenDark },
  btn: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center'
  },
  btnText: { fontSize: 12.5, fontWeight: '700', color: colors.textFaint },
  footnote: { fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: spacing.lg, textAlign: 'center' }
});
