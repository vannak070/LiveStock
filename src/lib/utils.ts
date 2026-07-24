import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_ROLE_PERMISSIONS, PermissionKey } from "@/types/settings.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasPermission(currentUser: any, key: PermissionKey): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') return true;

  if (currentUser.permissions && Array.isArray(currentUser.permissions)) {
    return currentUser.permissions.includes(key);
  }

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[currentUser.role] || [];
  return defaultPerms.includes(key);
}

export function format2Decimals(val: number | string | null | undefined): string {
  const n = Number(val);
  if (isNaN(n)) return '0.00';
  return n.toFixed(2);
}

export function format2DecimalsWithCommas(val: number | string | null | undefined): string {
  const n = Number(val);
  if (isNaN(n)) return '0.00';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
