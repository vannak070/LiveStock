import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_ROLE_PERMISSIONS, PermissionKey } from "@/types/settings.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasPermission(currentUser: any, key: PermissionKey): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') return true;

  if (currentUser.role === 'Farm Owner') {
    // Farm Owners have full operational permissions over their farm
    if (key !== 'farms_manage') return true;
  }

  if (currentUser.permissions && Array.isArray(currentUser.permissions)) {
    return currentUser.permissions.includes(key);
  }

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[currentUser.role] || [];
  return defaultPerms.includes(key);
}
