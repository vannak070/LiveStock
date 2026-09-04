import { StockItem, BatchItem, WeightRecord, HealthLogItem, SalesRecord, ExpenseItem } from '../api/types';

// Same fuzzy-match rule DashboardContainer.tsx uses on the web to scope a
// farm-level user's data (case/whitespace-insensitive, plus one legacy
// alias for a farm known by two spellings) — kept identical so mobile's
// farm filter always agrees with what the desktop system would show that
// same account.
export function matchesFarm(loc: string | undefined | null, farm: string): boolean {
  if (!loc) return false;
  const l = loc.trim().toLowerCase();
  const f = farm.trim().toLowerCase();
  if (l === f) return true;
  if ((f === 'រទាំង' || f.includes('snr')) && (l === 'រទាំង' || l.includes('snr'))) return true;
  return false;
}

export interface FarmScopeInput {
  stock?: StockItem[];
  batches?: BatchItem[];
  weightTracking?: WeightRecord[];
  healthLogs?: HealthLogItem[];
  sales?: SalesRecord[];
  expenses?: ExpenseItem[];
}

// Mirrors DashboardContainer.tsx's `dbData` useMemo exactly: scope stock by
// location first, derive the matching cow-id set, then scope every other
// collection off that id set. Expenses are the one exception — like the
// web app, they're matched directly by their own farmLocation field since
// they aren't tied to a specific animal.
//
// Pass `farm: null` to skip scoping entirely (admin viewing "All farms").
export function applyFarmScope<T extends FarmScopeInput>(input: T, farm: string | null): T {
  if (!farm) return input;
  const out: FarmScopeInput = { ...input };
  let scopedIds: string[] | null = null;

  if (input.stock) {
    const scopedStock = input.stock.filter(s => matchesFarm(s.location, farm));
    out.stock = scopedStock;
    scopedIds = scopedStock.map(s => s.id);
  }

  if (input.batches) {
    out.batches = scopedIds
      ? input.batches
          .map(b => ({ ...b, cowIds: (b.cowIds || []).filter(id => scopedIds!.includes(id)) }))
          .filter(b => matchesFarm(b.farmLocation, farm) || !b.farmLocation || b.cowIds.length > 0)
      : input.batches.filter(b => matchesFarm(b.farmLocation, farm));
  }

  if (input.weightTracking) {
    out.weightTracking = scopedIds ? input.weightTracking.filter(w => scopedIds!.includes(w.cowId)) : input.weightTracking;
  }
  if (input.healthLogs) {
    out.healthLogs = scopedIds ? input.healthLogs.filter(h => scopedIds!.includes(h.cowId)) : input.healthLogs;
  }
  if (input.sales) {
    out.sales = scopedIds ? input.sales.filter(s => scopedIds!.includes(s.cowId)) : input.sales;
  }
  if (input.expenses) {
    out.expenses = input.expenses.filter(e => e.farmLocation === farm);
  }

  return out as T;
}
