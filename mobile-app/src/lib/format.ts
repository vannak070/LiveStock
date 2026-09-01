// Real data in this app is priced in Cambodian riel (៛) per the web app's
// convention (see src/components/*.tsx use of toLocaleString with the ៛ sign).
export function formatMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}៛ ${Math.abs(Math.round(value)).toLocaleString()}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysBetween(from: string | null | undefined, to: Date = new Date()): number | null {
  if (!from) return null;
  const start = new Date(from);
  if (isNaN(start.getTime())) return null;
  return Math.max(0, Math.round((to.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}
