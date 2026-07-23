'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit3, DollarSign, RefreshCcw, ChevronLeft, ChevronRight, Activity, Trash2 } from 'lucide-react';
import { StockItem, WeightRecord } from '@/lib/xlsx-parser';
import { FarmItem } from '@/lib/types';
import { Button } from './ui/button';
import { ConfirmModal } from './ui/confirm-modal';
import { hasPermission } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import FarmFilterBar from './FarmFilterBar';

interface InventoryTableProps {
  stock: StockItem[];
  weightTracking?: WeightRecord[];
  onViewDetails: (cowId: string) => void;
  onEditCow: (cowId: string) => void;
  onRecordSale: (cowId: string) => void;
  onDeleteCow?: (cowId: string) => Promise<void>;
  onAddCowClick?: () => void;
  currentUser?: any;
  farms?: FarmItem[];
}

export default function InventoryTable({
  stock,
  weightTracking = [],
  onViewDetails,
  onEditCow,
  onRecordSale,
  onDeleteCow,
  onAddCowClick,
  currentUser,
  farms = []
}: InventoryTableProps) {
  const { t } = useLanguage();
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
    type: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'warning'
  });

  const [search, setSearch] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Sold' | 'All'>('Active');
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Count per farm (from all stock)
  const countByFarm = React.useMemo(() => {
    const map: Record<string, number> = {};
    stock.forEach(item => {
      if (item.location) map[item.location] = (map[item.location] || 0) + 1;
    });
    return map;
  }, [stock]);

  // Filter by farm first
  const farmFilteredStock = React.useMemo(() => {
    if (!selectedFarm) return stock;
    return stock.filter(item => item.location === selectedFarm);
  }, [stock, selectedFarm]);

  // Filter stock items by status
  const statusFilteredStock = React.useMemo(() => {
    if (selectedStatus === 'All') return farmFilteredStock;
    return farmFilteredStock.filter(item => item.status.toLowerCase().trim() === selectedStatus.toLowerCase().trim());
  }, [farmFilteredStock, selectedStatus]);

  // Extract unique breeds from stock for filtering
  const uniqueBreeds = React.useMemo(() => {
    return ['All', ...new Set(farmFilteredStock.map(item => item.breed).filter(Boolean))];
  }, [farmFilteredStock]);

  // Sort stock: Latest purchase date first, then highest ID first (latest registration)
  const sortedStock = React.useMemo(() => {
    return [...statusFilteredStock].sort((a, b) => {
      const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
      const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return b.id.localeCompare(a.id);
    });
  }, [statusFilteredStock]);

  // Filter stock items
  const filteredStock = React.useMemo(() => {
    return sortedStock.filter(item => {
      const matchesSearch = item.id.toLowerCase().includes(search.toLowerCase()) ||
        (item.ownerName && item.ownerName.toLowerCase().includes(search.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(search.toLowerCase()));
      const matchesBreed = selectedBreed === 'All' || item.breed === selectedBreed;
      return matchesSearch && matchesBreed;
    });
  }, [sortedStock, search, selectedBreed]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBreed, selectedStatus, selectedFarm]);

  // Compute pagination bounds
  const totalRows = filteredStock.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedStock = filteredStock.slice(indexOfFirstRow, indexOfLastRow);

  const getFarmName = (locationCodeOrId?: string) => {
    if (!locationCodeOrId || !locationCodeOrId.trim()) return 'N/A';
    const loc = locationCodeOrId.trim();
    const farm = farms.find(f => 
      f.id === loc || 
      f.name?.toLowerCase() === loc.toLowerCase()
    );
    return farm ? farm.name : loc;
  };

  const getCowWeights = (cow: StockItem) => {
    const cowLogs = (weightTracking || [])
      .filter(w => w.cowId === cow.id)
      .sort((a, b) => {
        const timeA = a.trackingDate ? new Date(a.trackingDate).getTime() : 0;
        const timeB = b.trackingDate ? new Date(b.trackingDate).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        if (a.oldWeight === 0 && b.oldWeight !== 0) return -1;
        if (a.oldWeight !== 0 && b.oldWeight === 0) return 1;
        return a.currentWeight - b.currentWeight;
      });

    let initialWeight = cow.weight || 0;
    let currentWeight = cow.weight || 0;

    if (cowLogs.length > 0) {
      const firstLog = cowLogs[0];
      initialWeight = firstLog.oldWeight > 0 ? firstLog.oldWeight : firstLog.currentWeight;
      
      const lastLog = cowLogs[cowLogs.length - 1];
      currentWeight = Math.max(lastLog.currentWeight, cow.weight || 0);
    }

    const weightGain = Math.round((currentWeight - initialWeight) * 10) / 10;

    return { initialWeight, currentWeight, weightGain };
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 text-left">
            🐄 {t('inventory.title')}
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold text-left">
            {t('inventory.subtitle')}
          </p>
        </div>
        {onAddCowClick && hasPermission(currentUser, 'stock_create') && (
          <Button
            onClick={onAddCowClick}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs py-2 px-4 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            ➕ {t('inventory.registerCow')}
          </Button>
        )}
      </div>

      {/* Farm Filter Bar */}
      <FarmFilterBar
        farms={farms}
        selectedFarm={selectedFarm}
        onFarmChange={setSelectedFarm}
        countByFarm={countByFarm}
        totalCount={stock.length}
        label="cattle"
        currentUser={currentUser}
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Cow ID (e.g. C-002)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Inline Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100/70 p-1 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setSelectedStatus('Active')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                selectedStatus === 'Active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active ({stock.filter(s => s.status.toLowerCase().trim() === 'active').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Sold')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                selectedStatus === 'Sold'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sold ({stock.filter(s => s.status.toLowerCase().trim() === 'sold').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('All')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                selectedStatus === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({stock.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 font-extrabold uppercase tracking-wider">Breed:</span>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl text-xs py-1.5 px-3 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer"
            >
              {uniqueBreeds.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(search || selectedBreed !== 'All' || selectedStatus !== 'Active') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedBreed('All');
                setSelectedStatus('Active');
              }}
              className="h-8 text-xs gap-1 rounded-xl border-slate-200"
            >
              <RefreshCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Grid Design Matching Screenshot */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/20 text-[#003B33] text-xs font-black uppercase tracking-wider">
              <th className="py-4 px-5">
                {t('inventory.cowId')} <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                {t('inventory.farm')} <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                {t('inventory.breed')} <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                {t('inventory.sex')} <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                {t('inventory.initialWeight')} <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                {t('inventory.currentWeight')} <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                {t('inventory.purchasePrice')} <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">{t('inventory.healthStatus')}</th>
              <th className="py-4 px-5">{t('inventory.status')}</th>
              <th className="py-4 px-5 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {paginatedStock.length > 0 ? (
              paginatedStock.map((cow, index) => {
                const { initialWeight, currentWeight, weightGain } = getCowWeights(cow);
                return (
                  <tr key={cow.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{cow.id}</td>
                    <td className="py-3.5 px-5 text-slate-800 font-semibold">
                      <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-extrabold text-slate-700">
                        🏢 {getFarmName(cow.location)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-800">{cow.breed}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                        cow.sex === 'M'
                          ? 'bg-blue-50/50 text-blue-500 border-blue-150'
                          : 'bg-rose-50/50 text-rose-500 border-rose-150'
                      }`}>
                        {cow.sex}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-800">
                      <span className="font-semibold">{initialWeight}</span>{' '}
                      <span className="text-slate-400 text-xs">kg</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-800">
                      <span className="font-black text-emerald-700">{currentWeight}</span>{' '}
                      <span className="text-slate-400 text-xs font-normal">kg</span>
                      {weightGain !== 0 && (
                        <span className={`ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md inline-block ${
                          weightGain > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        }`}>
                          {weightGain > 0 ? `+${weightGain}` : weightGain} kg
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-800 font-semibold">
                      {cow.totalPrice > 0 ? `៛ ${cow.totalPrice.toLocaleString()}` : 'N/A'}
                    </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border flex items-center gap-1.5 w-max ${
                      cow.healthStatus.toLowerCase().trim() === 'good'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : cow.healthStatus.toLowerCase().trim() === 'fair'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-rose-50 text-rose-500 border-rose-200'
                    }`}>
                      <Activity className="h-3.5 w-3.5" />
                      {cow.healthStatus.trim() === 'Dead' ? 'Dead' : cow.healthStatus.trim()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                      cow.status.toLowerCase().trim() === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {cow.status.trim()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(cow.id)}
                        className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hasPermission(currentUser, 'stock_edit') || hasPermission(currentUser, 'weight_record') ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditCow(cow.id)}
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl"
                          title="Log Weight / Edit"
                          disabled={cow.status.toLowerCase() === 'sold'}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {hasPermission(currentUser, 'sales_record') ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRecordSale(cow.id)}
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl"
                          title="Record Sale"
                          disabled={cow.status.toLowerCase() === 'sold'}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {onDeleteCow && hasPermission(currentUser, 'stock_delete') ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Cattle Record',
                              description: `Are you sure you want to permanently delete cow ${cow.id}? This will remove all its weight history and medical logs.`,
                              type: 'danger',
                              confirmText: 'Delete',
                              onConfirm: async () => {
                                if (onDeleteCow) {
                                  try {
                                    await onDeleteCow(cow.id);
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Cattle Deleted',
                                      description: `Cow ${cow.id} record has been successfully deleted.`,
                                      type: 'success',
                                      confirmText: 'OK'
                                    });
                                  } catch (err: any) {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Deletion Failed',
                                      description: err.message || 'Error occurred while deleting cow.',
                                      type: 'danger',
                                      confirmText: 'Dismiss'
                                    });
                                  }
                                }
                              }
                            });
                          }}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                          title="Delete Permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                  No stock items match the active filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalRows > rowsPerPage && (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="text-xs text-slate-400 font-semibold">
            Showing <span className="text-slate-800 font-bold">{indexOfFirstRow + 1}</span> to{' '}
            <span className="text-slate-800 font-bold">{Math.min(indexOfLastRow, totalRows)}</span> of{' '}
            <span className="text-slate-800 font-bold">{totalRows}</span> entries
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 rounded-xl border-slate-200"
            >
              <ChevronLeft className="h-4 w-4 text-slate-650" />
            </Button>
            <div className="text-xs text-slate-500 font-bold">
              Page <span className="text-slate-900 font-extrabold">{currentPage}</span> of{' '}
              <span className="text-slate-900 font-extrabold">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 rounded-xl border-slate-200"
            >
              <ChevronRight className="h-4 w-4 text-slate-650" />
            </Button>
          </div>
        </div>
      )}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          description={confirmModal.description}
          type={confirmModal.type}
          confirmText={confirmModal.confirmText}
        />
      )}
    </div>
  );
}
