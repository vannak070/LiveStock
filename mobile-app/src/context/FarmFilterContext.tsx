import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api/client';
import { MasterSetup } from '../api/types';
import { useAuth } from './AuthContext';

interface FarmFilterContextValue {
  // The farm every report screen should scope its data to, or null for
  // "all farms". Locked accounts and an admin's active pick both flow
  // through this one value so screens never need to know which case
  // they're in — they just read effectiveFarm.
  effectiveFarm: string | null;
  // An admin's own picked farm (mirrors effectiveFarm for admins; always
  // null for a locked account, since they never had a choice to make).
  selectedFarm: string | null;
  // False for accounts already tied to one farm (Farm Staff, Veterinarian)
  // — same accounts the web app's FarmFilterBar.tsx hides itself for
  // (`if (currentUser?.farmLocation) return null;`). Those users only ever
  // see their own farm's data, on mobile exactly as on desktop.
  canPickFarm: boolean;
  farmOptions: string[];
  setSelectedFarm: (farm: string | null) => void;
}

const FarmFilterContext = createContext<FarmFilterContextValue | undefined>(undefined);

export function FarmFilterProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const lockedFarm = user?.farmLocation?.trim() || null;
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [farmOptions, setFarmOptions] = useState<string[]>([]);

  useEffect(() => {
    // Locked accounts never need the farm list — they can't pick one.
    if (lockedFarm) return;
    let cancelled = false;
    apiFetch<MasterSetup>('/settings')
      .then(s => { if (!cancelled) setFarmOptions((s.farms || []).map(f => f.name).filter(Boolean)); })
      .catch(() => { /* farm picker just stays empty/hidden if this fails */ });
    return () => { cancelled = true; };
  }, [lockedFarm]);

  // A fresh login (different account, or one that's now locked/unlocked)
  // should never inherit the previous account's picked farm.
  useEffect(() => { setSelectedFarm(null); }, [lockedFarm]);

  const effectiveFarm = lockedFarm || selectedFarm;

  const value = useMemo<FarmFilterContextValue>(() => ({
    effectiveFarm,
    selectedFarm,
    canPickFarm: !lockedFarm,
    farmOptions,
    setSelectedFarm
  }), [effectiveFarm, selectedFarm, lockedFarm, farmOptions]);

  return <FarmFilterContext.Provider value={value}>{children}</FarmFilterContext.Provider>;
}

export function useFarmFilter(): FarmFilterContextValue {
  const ctx = useContext(FarmFilterContext);
  if (!ctx) throw new Error('useFarmFilter must be used within FarmFilterProvider');
  return ctx;
}
