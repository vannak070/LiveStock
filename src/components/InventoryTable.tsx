'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit3, DollarSign, RefreshCcw, ChevronLeft, ChevronRight, Activity, Trash2 } from 'lucide-react';
import { StockItem } from '@/lib/xlsx-parser';
import { Button } from './ui/button';
import { ConfirmModal } from './ui/confirm-modal';
import { hasPermission } from '@/lib/utils';

interface InventoryTableProps {
  stock: StockItem[];
  onViewDetails: (cowId: string) => void;
  onEditCow: (cowId: string) => void;
  onRecordSale: (cowId: string) => void;
  onDeleteCow?: (cowId: string) => Promise<void>;
  onAddCowClick?: () => void;
  currentUser?: any;
}

export default function InventoryTable({
  stock,
  onViewDetails,
  onEditCow,
  onRecordSale,
  onDeleteCow,
  onAddCowClick,
  currentUser
}: InventoryTableProps) {
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Filter stock items by status
  const statusFilteredStock = React.useMemo(() => {
    if (selectedStatus === 'All') return stock;
    return stock.filter(item => item.status.toLowerCase().trim() === selectedStatus.toLowerCase().trim());
  }, [stock, selectedStatus]);

  // Extract unique breeds from stock for filtering
  const uniqueBreeds = React.useMemo(() => {
    return ['All', ...new Set(stock.map(item => item.breed).filter(Boolean))];
  }, [stock]);

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
  }, [search, selectedBreed, selectedStatus]);

  // Compute pagination bounds
  const totalRows = filteredStock.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedStock = filteredStock.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 text-left">
            🧑‍🌾 បញ្ជីសារពើភណ្ឌគោ (Cow Inventory Stock)
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold text-left">
            View details, log weights, or delete registered cows from SNR farm database.
          </p>
        </div>
        {onAddCowClick && hasPermission(currentUser, 'stock_create') && (
          <Button
            onClick={onAddCowClick}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs py-2 px-4 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            ➕ ចុះឈ្មោះគោថ្មី (Add Cow)
          </Button>
        )}
      </div>

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
                COW ID <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                BREED <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                SEX <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                WEIGHT <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">
                PURCHASE PRICE <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              </th>
              <th className="py-4 px-5">HEALTH STATUS</th>
              <th className="py-4 px-5">STATUS</th>
              <th className="py-4 px-5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {paginatedStock.length > 0 ? (
              paginatedStock.map((cow, index) => (
                <tr key={cow.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{cow.id}</td>
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
                    <span className="font-semibold">{cow.weight}</span>{' '}
                    <span className="text-slate-400 text-xs">kg</span>
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
              ))
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
