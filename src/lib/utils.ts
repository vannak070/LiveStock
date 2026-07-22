import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_ROLE_PERMISSIONS, PermissionKey } from "@/types/settings.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasPermission(currentUser: any, key: PermissionKey): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'Super Admin') return true;
  
  if (currentUser.permissions && Array.isArray(currentUser.permissions)) {
    return currentUser.permissions.includes(key);
  }
  
  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[currentUser.role] || [];
  return defaultPerms.includes(key);
}
