import { ERPLivestockData } from './types';
import { Actor, redactSettingsFor } from './authz';

function farmMatcher(farmLocation: string) {
  const f = farmLocation.trim().toLowerCase();
  return (loc?: string) => {
    if (!loc) return false;
    const l = loc.trim().toLowerCase();
    if (l === f) return true;
    if ((f === 'រទាំង' || f.includes('snr')) && (l === 'រទាំង' || l.includes('snr'))) return true;
    return false;
  };
}

/**
 * Trims the full dataset down to what this user is allowed to receive.
 * This runs on the server before anything is sent to the browser: users
 * tied to one farm get only that farm's records, and the account roster
 * goes only to people who manage accounts.
 */
export function scopeDataForActor(data: ERPLivestockData, actor: Actor): ERPLivestockData {
  const settings = redactSettingsFor(actor, data.settings);
  if (!actor.farmLocation) return { ...data, settings }; // not tied to a farm: sees every farm

  const farmLoc = actor.farmLocation;
  const matchesFarm = farmMatcher(farmLoc);

  const stock = data.stock.filter(item => matchesFarm(item.location));
  const stockIds = new Set(stock.map(c => c.id));

  const batches = data.batches
    .map(batch => ({ ...batch, cowIds: batch.cowIds.filter(id => stockIds.has(id)) }))
    .filter(batch => matchesFarm(batch.farmLocation) || !batch.farmLocation || batch.cowIds.length > 0);

  return {
    ...data,
    settings,
    stock,
    batches,
    weightTracking: data.weightTracking.filter(item => stockIds.has(item.cowId)),
    healthLogs: data.healthLogs.filter(item => stockIds.has(item.cowId)),
    salesTracking: data.salesTracking.filter(item => stockIds.has(item.cowId)),
    expenses: data.expenses.filter(item => item.farmLocation === farmLoc),
    common: { ...data.common, locations: [farmLoc] }
  };
}
