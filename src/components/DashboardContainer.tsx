'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLivestockDataAction, 
  addStockItemAction, 
  addWeightRecordAction, 
  recordSaleAction, 
  recordBatchSaleAction, 
  createBatchAction, 
  assignCowsToBatchAction, 
  addHealthLogAction, 
  addExpenseAction, 
  updateExpenseAction, 
  deleteExpenseAction, 
  removeCowFromBatchAction, 
  updateBatchAction, 
  recordBatchWeightsAction, 
  recordBatchHealthLogAction, 
  deleteStockItemAction,
  deleteBatchAction,
  deleteHealthLogAction,
  updateHealthLogAction,
  deleteWeightRecordAction,
  updateWeightRecordAction,
  deleteSalesRecordAction,
  updateSalesRecordAction
} from '@/app/actions';
import SidebarLayout, { ActiveTabType } from './layout/SidebarLayout';
import DashboardHome from './DashboardHome';
import InventoryTable from './InventoryTable';
import BatchTab from './BatchTab';
import HealthTab from './HealthTab';
import WeightTab from './WeightTab';
import FinanceTab from './FinanceTab';
import AnalyticsTab from './AnalyticsTab';
import SettingsTab from './SettingsTab';
import CowDetails from './CowDetails';
import QuickEntryModal from './QuickEntryModal';
import { ERPLivestockData } from '@/lib/types';
import { SalesRecord } from '@/lib/xlsx-parser';
import { hasPermission } from '@/lib/utils';
import { PermissionKey } from '@/types/settings.types';

interface DashboardContainerProps {
  initialData: ERPLivestockData;
}

export default function DashboardContainer({ initialData }: DashboardContainerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // Authentication Management
  const [currentUser, setCurrentUser] = React.useState<any | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = React.useState(false);

  // Modal States
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryTab, setQuickEntryTab] = useState<'add' | 'weight' | 'sale'>('add');
  const [preselectedCowId, setPreselectedCowId] = useState<string | null>(null);

  const [selectedCowDetailsId, setSelectedCowDetailsId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // TanStack Query for dynamic data fetching
  const { data: rawDbData } = useQuery<ERPLivestockData>({
    queryKey: ['livestock'],
    queryFn: async () => {
      const res = await getLivestockDataAction();
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.error || 'Failed to fetch data');
    },
    initialData: initialData,
    refetchOnWindowFocus: true,
  });

  // Scoped Data based on Current User's farmLocation
  const dbData = useMemo(() => {
    if (!rawDbData) return rawDbData;
    if (!currentUser || !currentUser.farmLocation) return rawDbData;

    const farmLoc = currentUser.farmLocation;

    // 1. Filter stock items to only those at this farm location
    const scopedStock = rawDbData.stock.filter(item => item.location === farmLoc);
    const scopedStockIds = scopedStock.map(c => c.id);

    // 2. Filter batches that contain cows at this farm location
    const scopedBatches = rawDbData.batches.map(batch => ({
      ...batch,
      cowIds: batch.cowIds.filter(id => scopedStockIds.includes(id))
    })).filter(batch => batch.cowIds.length > 0 || batch.status === 'Active');

    // 3. Filter weight records for cows at this farm
    const scopedWeightTracking = rawDbData.weightTracking.filter(item => scopedStockIds.includes(item.cowId));

    // 4. Filter health logs for cows at this farm
    const scopedHealthLogs = rawDbData.healthLogs.filter(item => scopedStockIds.includes(item.cowId));

    // 5. Filter sales records for cows at this farm
    const scopedSalesTracking = rawDbData.salesTracking.filter(item => scopedStockIds.includes(item.cowId));

    // 6. Common settings locations list (restrict to user's farm location so they cannot create/edit cows to other farms)
    const scopedCommon = {
      ...rawDbData.common,
      locations: [farmLoc]
    };

    return {
      ...rawDbData,
      stock: scopedStock,
      batches: scopedBatches,
      weightTracking: scopedWeightTracking,
      healthLogs: scopedHealthLogs,
      salesTracking: scopedSalesTracking,
      common: scopedCommon
    };
  }, [rawDbData, currentUser]);

  // Mutations
  const addCowMutation = useMutation({
    mutationFn: async (newCow: any) => {
      const res = await addStockItemAction(newCow);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const addWeightMutation = useMutation({
    mutationFn: async ({ cowId, weight, healthStatus, date }: any) => {
      const res = await addWeightRecordAction(cowId, weight, healthStatus, date);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const recordSaleMutation = useMutation({
    mutationFn: async ({ cowId, unitPrice, saleType, date, buyer }: any) => {
      const res = await recordSaleAction(cowId, unitPrice, saleType, date, buyer);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const recordBatchSaleMutation = useMutation({
    mutationFn: async ({ batchId, unitPrice, saleType, date }: any) => {
      const res = await recordBatchSaleAction(batchId, unitPrice, saleType, date);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const createBatchMutation = useMutation({
    mutationFn: async (batch: any) => {
      const res = await createBatchAction(batch);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const assignCowsMutation = useMutation({
    mutationFn: async ({ batchId, cowIds }: any) => {
      const res = await assignCowsToBatchAction(batchId, cowIds);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const addHealthLogMutation = useMutation({
    mutationFn: async (log: any) => {
      const res = await addHealthLogAction(log);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: any) => {
      const res = await addExpenseAction(expense);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: any) => {
      const res = await updateExpenseAction(id, updates);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteExpenseAction(id);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const removeCowMutation = useMutation({
    mutationFn: async ({ batchId, cowId }: any) => {
      const res = await removeCowFromBatchAction(batchId, cowId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ batchId, updates }: any) => {
      const res = await updateBatchAction(batchId, updates);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const recordBatchWeightsMutation = useMutation({
    mutationFn: async (records: { cowId: string; currentWeight: number; healthStatus: string; trackingDate?: string }[]) => {
      const res = await recordBatchWeightsAction(records);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const recordBatchHealthLogMutation = useMutation({
    mutationFn: async ({ batchId, log }: any) => {
      const res = await recordBatchHealthLogAction(batchId, log);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const deleteStockItemMutation = useMutation({
    mutationFn: async (cowId: string) => {
      const res = await deleteStockItemAction(cowId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: string) => {
      const res = await deleteBatchAction(batchId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const deleteHealthLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      const res = await deleteHealthLogAction(logId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const updateHealthLogMutation = useMutation({
    mutationFn: async ({ logId, updates }: any) => {
      const res = await updateHealthLogAction(logId, updates);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const deleteWeightRecordMutation = useMutation({
    mutationFn: async ({ cowId, trackingDate }: any) => {
      const res = await deleteWeightRecordAction(cowId, trackingDate);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const updateWeightRecordMutation = useMutation({
    mutationFn: async ({ cowId, trackingDate, currentWeight, healthStatus }: any) => {
      const res = await updateWeightRecordAction(cowId, trackingDate, currentWeight, healthStatus);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const deleteSalesRecordMutation = useMutation({
    mutationFn: async (cowId: string) => {
      const res = await deleteSalesRecordAction(cowId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const updateSalesRecordMutation = useMutation({
    mutationFn: async ({ cowId, updates }: any) => {
      const res = await updateSalesRecordAction(cowId, updates);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  // Active cows list for drop downs
  const activeCows = dbData.stock.filter(c => c.status.toLowerCase() === 'active');
  const healthAlertsCount = activeCows.filter(c => c.healthStatus.toLowerCase() === 'poor').length;
  const vaccineAlertsCount = 1; // Mock due vaccinations count

  // Trigger Action panel
  const handleOpenQuickEntry = (tabType: 'add' | 'weight' | 'sale' = 'add', cowId: string | null = null) => {
    setQuickEntryTab(tabType);
    setPreselectedCowId(cowId);
    setIsQuickEntryOpen(true);
  };

  const handleViewDetails = (cowId: string) => {
    setSelectedCowDetailsId(cowId);
    setIsDetailsOpen(true);
  };

  const [emailInput, setEmailInput] = React.useState('');
  const [passwordInput, setPasswordInput] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('snr_farm_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Verify user still exists and is active in db settings
        const freshUser = dbData.settings.users.find(u => u.id === parsed.id && u.status === 'Active');
        if (freshUser) {
          setCurrentUser(freshUser);
        } else {
          localStorage.removeItem('snr_farm_user');
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsAuthLoaded(true);
  }, [dbData.settings.users]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const user = dbData.settings.users.find(
      u => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (!user) {
      setLoginError('Invalid corporate email or password.');
      setIsSubmitting(false);
      return;
    }

    if (user.status !== 'Active') {
      setLoginError('This user account is inactive. Please contact the administrator.');
      setIsSubmitting(false);
      return;
    }

    if (user.password !== passwordInput) {
      setLoginError('Invalid corporate email or password.');
      setIsSubmitting(false);
      return;
    }

    setCurrentUser(user);
    localStorage.setItem('snr_farm_user', JSON.stringify(user));
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('snr_farm_user');
  };

  React.useEffect(() => {
    if (!currentUser) return;
    if (activeTab === 'dashboard') return;

    let permissionKey: PermissionKey | null = null;
    if (activeTab === 'cow-inventory') permissionKey = 'stock_view';
    else if (activeTab === 'batch-management') permissionKey = 'batch_view';
    else if (activeTab === 'health-tracking') permissionKey = 'health_view';
    else if (activeTab === 'weight-tracking') permissionKey = 'weight_view';
    else if (activeTab === 'sales-finance') permissionKey = 'sales_view';
    else if (activeTab === 'analytics') permissionKey = 'analytics_view';
    else if (activeTab === 'settings') permissionKey = 'settings_manage';

    if (permissionKey && !hasPermission(currentUser, permissionKey)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser]);

  // If authorization status is not loaded yet, display loading layout
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, render the login card layout
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-50/60 blur-3xl -z-10" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-50/60 blur-3xl -z-10" />

        <div className="w-full max-w-md bg-white border border-slate-100/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-[#002D26] p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 to-teal-500/10 opacity-70" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-250">
                <img src="/logo.png" alt="SNR Farm Logo" className="h-12 w-auto object-contain" />
              </div>
              <h1 className="font-black text-lg leading-tight tracking-wider uppercase text-white">SNR Farm Portal</h1>
              <p className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase mt-1">Livestock ERP Authentication</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@snrfarm.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>

              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Authenticate Access'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider">SNR Farm Enterprise Systems</p>
              <p className="text-[9px] text-slate-400 mt-1">Authorized personnel only. Sessions are monitored and logged.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      stock={dbData.stock}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenQuickEntry={() => handleOpenQuickEntry('add')}
      healthAlertsCount={healthAlertsCount}
      vaccineAlertsCount={vaccineAlertsCount}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {/* Dynamic Tab Rendering */}
      {activeTab === 'dashboard' && (
        <DashboardHome
          data={dbData}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'cow-inventory' && (
        <InventoryTable
          stock={dbData.stock}
          onViewDetails={handleViewDetails}
          onEditCow={(cowId) => handleOpenQuickEntry('weight', cowId)}
          onRecordSale={(cowId) => handleOpenQuickEntry('sale', cowId)}
          onDeleteCow={async (cowId) => {
            await deleteStockItemMutation.mutateAsync(cowId);
          }}
          onAddCowClick={() => handleOpenQuickEntry('add', null)}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'batch-management' && (
        <BatchTab
          data={dbData}
          onCreateBatch={async (batch) => {
            await createBatchMutation.mutateAsync(batch);
          }}
          onAssignCows={async (batchId, cowIds) => {
            await assignCowsMutation.mutateAsync({ batchId, cowIds });
          }}
          onRemoveCow={async (batchId, cowId) => {
            await removeCowMutation.mutateAsync({ batchId, cowId });
          }}
          onUpdateBatch={async (batchId, updates) => {
            await updateBatchMutation.mutateAsync({ batchId, updates });
          }}
          onRecordBatchWeights={async (records) => {
            await recordBatchWeightsMutation.mutateAsync(records);
          }}
          onRecordBatchHealthLog={async (batchId, log) => {
            await recordBatchHealthLogMutation.mutateAsync({ batchId, log });
          }}
          onDeleteBatch={async (batchId) => {
            await deleteBatchMutation.mutateAsync(batchId);
          }}
        />
      )}

      {activeTab === 'health-tracking' && (
        <HealthTab
          data={dbData}
          onAddHealthLog={async (log) => {
            await addHealthLogMutation.mutateAsync(log);
          }}
          onDeleteHealthLog={async (logId) => {
            await deleteHealthLogMutation.mutateAsync(logId);
          }}
          onUpdateHealthLog={async (logId, updates) => {
            await updateHealthLogMutation.mutateAsync({ logId, updates });
          }}
        />
      )}

      {activeTab === 'weight-tracking' && (
        <WeightTab
          data={dbData}
          onOpenLogWeight={(cowId) => handleOpenQuickEntry('weight', cowId || null)}
          onDeleteWeightRecord={async (cowId, trackingDate) => {
            await deleteWeightRecordMutation.mutateAsync({ cowId, trackingDate });
          }}
          onUpdateWeightRecord={async (cowId, trackingDate, currentWeight, healthStatus) => {
            await updateWeightRecordMutation.mutateAsync({ cowId, trackingDate, currentWeight, healthStatus });
          }}
        />
      )}

      {activeTab === 'sales-finance' && (
        <FinanceTab
          data={dbData}
          onAddExpense={async (expense) => {
            await addExpenseMutation.mutateAsync(expense);
          }}
          onUpdateExpense={async (id, updates) => {
            await updateExpenseMutation.mutateAsync({ id, updates });
          }}
          onDeleteExpense={async (id) => {
            await deleteExpenseMutation.mutateAsync(id);
          }}
          onDeleteSalesRecord={async (cowId: string) => {
            await deleteSalesRecordMutation.mutateAsync(cowId);
          }}
          onUpdateSalesRecord={async (cowId: string, updates: Partial<SalesRecord>) => {
            await updateSalesRecordMutation.mutateAsync({ cowId, updates });
          }}
          onRecordSaleClick={() => handleOpenQuickEntry('sale', null)}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab
          data={dbData}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          settings={dbData.settings}
        />
      )}

      {/* View Details Modal */}
      <CowDetails
        cowId={selectedCowDetailsId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        stock={dbData.stock}
        weightTracking={dbData.weightTracking}
        salesTracking={dbData.salesTracking}
        healthLogs={dbData.healthLogs}
      />

      {/* Quick Entry / Action Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        common={dbData.settings} // Feed the settings master data instead of old hardcoded sheet
        activeCows={activeCows}
        activeBatches={dbData.batches.filter(b => b.status === 'Active')}
        defaultTab={quickEntryTab}
        preselectedCowId={preselectedCowId}
        onAddCow={async (data) => {
          await addCowMutation.mutateAsync(data);
        }}
        onAddWeight={async (cowId, weight, healthStatus, date) => {
          await addWeightMutation.mutateAsync({ cowId, weight, healthStatus, date });
        }}
        onRecordSale={async (cowId, unitPrice, saleType, date, buyer) => {
          await recordSaleMutation.mutateAsync({ cowId, unitPrice, saleType, date, buyer });
        }}
        onRecordBatchSale={async (batchId, unitPrice, saleType, date) => {
          await recordBatchSaleMutation.mutateAsync({ batchId, unitPrice, saleType, date });
        }}
      />
    </SidebarLayout>
  );
}
