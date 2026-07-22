'use client';

import React, { useState } from 'react';
import { ERPLivestockData, ExpenseItem } from '@/lib/types';
import { SalesRecord } from '@/lib/xlsx-parser';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, ClipboardList, TrendingUp, ShoppingBag, Edit3, Trash2 } from 'lucide-react';
import { ConfirmModal } from './ui/confirm-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { hasPermission } from '@/lib/utils';

interface FinanceTabProps {
  data: ERPLivestockData;
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => Promise<void>;
  onUpdateExpense?: (id: string, updates: Partial<ExpenseItem>) => Promise<void>;
  onDeleteExpense?: (id: string) => Promise<void>;
  onDeleteSalesRecord?: (cowId: string) => Promise<void>;
  onUpdateSalesRecord?: (cowId: string, updates: Partial<SalesRecord>) => Promise<void>;
  onRecordSaleClick?: () => void;
  currentUser?: any;
}

export default function FinanceTab({ 
  data, 
  onAddExpense, 
  onUpdateExpense, 
  onDeleteExpense,
  onDeleteSalesRecord,
  onUpdateSalesRecord,
  onRecordSaleClick,
  currentUser
}: FinanceTabProps) {
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

  const [isLogging, setIsLogging] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [ledgerView, setLedgerView] = useState<'expenses' | 'revenue'>('expenses');
  
  const [editingSalesRecord, setEditingSalesRecord] = useState<{
    cowId: string;
    salesDate: string;
    saleType: 'Scale' | 'Lumpsum';
    buyer: string;
    weight: number;
    unitPrice: number;
  } | null>(null);

  // Form states for Expense
  const [category, setCategory] = useState('Feed');
  const [amount, setAmount] = useState(150000); // default riel amount
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Financial aggregates
  const totalSales = data.salesTracking.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalPurchases = data.stock.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const netEarnings = totalSales - totalPurchases - totalExpenses;

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    if (editingExpenseId && onUpdateExpense) {
      await onUpdateExpense(editingExpenseId, {
        category,
        amount: Number(amount),
        date,
        description
      });
      setConfirmModal({
        isOpen: true,
        title: 'Expense Updated',
        description: 'The expense transaction has been successfully updated.',
        type: 'success',
        confirmText: 'OK'
      });
    } else {
      await onAddExpense({
        category,
        amount: Number(amount),
        date,
        description
      });
      setConfirmModal({
        isOpen: true,
        title: 'Expense Recorded',
        description: 'New operational expense transaction has been successfully saved.',
        type: 'success',
        confirmText: 'OK'
      });
    }

    setIsLogging(false);
    setEditingExpenseId(null);
    setDescription('');
    setAmount(150000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Feed Costs & Revenue Ledger</h3>
          <p className="text-xs text-slate-400 font-medium">Track feed costs, veterinary expenses, cattle acquisition, and fattening sales revenue.</p>
        </div>
        {ledgerView === 'expenses' && hasPermission(currentUser, 'expenses_record') && (
          <Button
            onClick={() => {
              if (isLogging) {
                setIsLogging(false);
                setEditingExpenseId(null);
                setDescription('');
                setAmount(150000);
              } else {
                setIsLogging(true);
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs py-2 shadow"
          >
            {isLogging ? 'View Finance Ledger' : '+ Record Expense'}
          </Button>
        )}
      </div>

      {/* Mini Stats Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-200 transition-colors" onClick={() => { setLedgerView('revenue'); setIsLogging(false); }}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
            <h4 className="text-lg font-black text-emerald-600 mt-1">៛ {totalSales.toLocaleString()}</h4>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cattle Acquisition Cost</p>
            <h4 className="text-lg font-black text-slate-800 mt-1">៛ {totalPurchases.toLocaleString()}</h4>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center">
            <FileText className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:border-rose-250 transition-colors" onClick={() => { setLedgerView('expenses'); }}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feed & Operational Expense</p>
            <h4 className="text-lg font-black text-rose-500 mt-1">៛ {totalExpenses.toLocaleString()}</h4>
          </div>
          <div className="h-9 w-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <ArrowDownRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className={`border p-4 rounded-xl flex items-center justify-between shadow-sm ${
          netEarnings >= 0 ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'
        }`}>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net P&L Margin</p>
            <h4 className={`text-lg font-black mt-1 ${netEarnings >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              ៛ {netEarnings.toLocaleString()}
            </h4>
          </div>
          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
            netEarnings >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Ledger Navigation Tabs */}
      {!isLogging && (
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => setLedgerView('expenses')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition-colors ${
              ledgerView === 'expenses'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Feed & Operations Ledger
          </button>
          <button
            type="button"
            onClick={() => setLedgerView('revenue')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition-colors flex items-center gap-1.5 ${
              ledgerView === 'revenue'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Revenue of Sales
          </button>
        </div>
      )}

      {isLogging ? (
        /* Record Expense Form Panel */
        <Card className="max-w-md bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-slate-800">
              {editingExpenseId ? 'Edit Operational Expense' : 'Record Operational Expense'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSub} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="e_cat" className="text-xs font-bold uppercase text-slate-450 tracking-wider">Expense Category</Label>
                <select
                  id="e_cat"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none cursor-pointer font-medium"
                >
                  {data.settings.expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="e_amount" className="text-xs font-bold uppercase text-slate-450 tracking-wider">Amount (៛)</Label>
                  <Input id="e_amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e_date" className="text-xs font-bold uppercase text-slate-450 tracking-wider">Transaction Date</Label>
                  <Input id="e_date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="e_desc" className="text-xs font-bold uppercase text-slate-450 tracking-wider">Description Detail</Label>
                <textarea
                  id="e_desc"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  placeholder="e.g. Bought 5 bags of silage feed, 50kg each"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsLogging(false);
                    setEditingExpenseId(null);
                    setDescription('');
                    setAmount(150000);
                  }}
                  className="w-1/3 text-slate-500 rounded-xl font-bold py-2.5"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold py-2.5 shadow">
                  {editingExpenseId ? 'Save Changes' : 'Save Expense Record'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : ledgerView === 'expenses' ? (
        /* Expenses Table Ledger */
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 font-mono">Expense Transactions</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20 text-[#003B33] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Transaction Date</th>
                  <th className="py-3.5 px-4">Description Detail</th>
                  <th className="py-3.5 px-4 text-right">Expense Cost (៛)</th>
                  <th className="py-3.5 px-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                {data.expenses.length > 0 ? (
                  data.expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg font-bold border border-slate-200 text-slate-650 bg-slate-50 text-[10px] uppercase">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-slate-800">{expense.description}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-900 font-extrabold text-right">៛ {expense.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2.5">
                          {hasPermission(currentUser, 'expenses_record') && (
                            <button
                              type="button"
                              onClick={() => {
                                setCategory(expense.category);
                                setAmount(expense.amount);
                                setDate(expense.date);
                                setDescription(expense.description);
                                setEditingExpenseId(expense.id);
                                setIsLogging(true);
                              }}
                              className="text-slate-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer"
                              title="Edit Expense Record"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDeleteExpense && hasPermission(currentUser, 'expenses_delete') && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Expense Record',
                                  description: 'Are you sure you want to permanently delete this operational expense record?',
                                  type: 'danger',
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    try {
                                      await onDeleteExpense(expense.id);
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Record Deleted',
                                        description: 'Expense record has been successfully removed from ledger.',
                                        type: 'success',
                                        confirmText: 'OK'
                                      });
                                    } catch (err: any) {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Deletion Failed',
                                        description: err.message || 'Unknown error occurred while deleting expense.',
                                        type: 'danger',
                                        confirmText: 'Dismiss'
                                      });
                                    }
                                  }
                                });
                              }}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              title="Delete Expense Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                      No expense transactions logged. Record one using the button above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Revenue of Sales Ledger */
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 font-mono">Gross Sales Revenue Ledger</h4>
              {onRecordSaleClick && (
                <Button
                  onClick={onRecordSaleClick}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs py-1.5 px-4 shadow-sm cursor-pointer"
                >
                  ➕ កត់ត្រាការលក់ (Record Sales)
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/20 text-[#003B33] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Cattle ID</th>
                    <th className="py-3.5 px-4">Sales Date</th>
                    <th className="py-3.5 px-4">Breed</th>
                    <th className="py-3.5 px-4">Sales Type</th>
                    <th className="py-3.5 px-4">Sale To</th>
                    <th className="py-3.5 px-4 text-right">Sale Weight</th>
                    <th className="py-3.5 px-4 text-right">Unit Price (៛)</th>
                    <th className="py-3.5 px-4 text-right">Gross Income (៛)</th>
                    <th className="py-3.5 px-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data.salesTracking.length > 0 ? (
                    [...data.salesTracking]
                      .sort((a, b) => new Date(b.salesDate || '').getTime() - new Date(a.salesDate || '').getTime())
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((sale, idx) => {
                        const deducedSaleType = sale.saleType || (sale.weight <= 2 || sale.totalPrice === sale.unitPrice ? 'Lumpsum' : 'Scale');
                        const deducedBuyer = sale.buyer || 'Local Market';
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800">{sale.cowId}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">
                              {sale.salesDate ? new Date(sale.salesDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-550">{sale.breed}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                deducedSaleType.toLowerCase().startsWith('scale') || deducedSaleType.toLowerCase().startsWith('weight')
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {deducedSaleType}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-600">{deducedBuyer}</td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">{sale.weight} kg</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-500">៛ {sale.unitPrice.toLocaleString()}</td>
                            <td className="py-3.5 px-4 font-mono text-emerald-600 font-extrabold text-right">៛ {sale.totalPrice.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2.5">
                                {hasPermission(currentUser, 'sales_record') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSalesRecord({
                                        cowId: sale.cowId,
                                        salesDate: sale.salesDate ? sale.salesDate.split('T')[0] : '',
                                        saleType: deducedSaleType === 'Scale' || deducedSaleType === 'Weight' ? 'Scale' : 'Lumpsum',
                                        buyer: deducedBuyer,
                                        weight: sale.weight,
                                        unitPrice: sale.unitPrice
                                      });
                                    }}
                                    className="text-slate-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer"
                                    title="Edit Sales Record"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {onDeleteSalesRecord && hasPermission(currentUser, 'sales_delete') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: 'Delete Sales Record',
                                        description: `Are you sure you want to permanently delete the sales record for Cattle ID "${sale.cowId}"? This will revert its status back to "Active" and add it back to inventory.`,
                                        type: 'danger',
                                        confirmText: 'Delete Record',
                                        onConfirm: async () => {
                                          try {
                                            await onDeleteSalesRecord(sale.cowId);
                                            setConfirmModal({
                                              isOpen: true,
                                              title: 'Record Deleted',
                                              description: 'Sales record has been successfully deleted. Cattle is now active again.',
                                              type: 'success',
                                              confirmText: 'OK'
                                            });
                                          } catch (err: any) {
                                            setConfirmModal({
                                              isOpen: true,
                                              title: 'Deletion Failed',
                                              description: err.message || 'Unknown error occurred while deleting sales record.',
                                              type: 'danger',
                                              confirmText: 'Dismiss'
                                            });
                                          }
                                        }
                                      });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                    title="Delete Sales Record"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                        No sales revenue records registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {data.salesTracking.length > 0 && (
            <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <p>
                Showing <span className="font-bold text-slate-800">{Math.min(data.salesTracking.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> to{' '}
                <span className="font-bold text-slate-800">{Math.min(data.salesTracking.length, currentPage * ITEMS_PER_PAGE)}</span> of{' '}
                <span className="font-bold text-slate-800">{data.salesTracking.length}</span> records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="rounded-lg text-[10px] font-bold uppercase tracking-wider h-8"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage * ITEMS_PER_PAGE >= data.salesTracking.length}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(data.salesTracking.length / ITEMS_PER_PAGE), prev + 1))}
                  className="rounded-lg text-[10px] font-bold uppercase tracking-wider h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {editingSalesRecord && (
        <Dialog open={!!editingSalesRecord} onOpenChange={(open) => !open && setEditingSalesRecord(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-100 text-slate-800 rounded-2xl shadow-xl p-6">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-800">Edit Sales Record</DialogTitle>
              <DialogDescription className="text-xs text-slate-405 font-mono mt-0.5">
                Cattle ID: {editingSalesRecord.cowId}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (onUpdateSalesRecord) {
                try {
                  await onUpdateSalesRecord(editingSalesRecord.cowId, {
                    salesDate: editingSalesRecord.salesDate,
                    saleType: editingSalesRecord.saleType,
                    buyer: editingSalesRecord.buyer,
                    weight: editingSalesRecord.weight,
                    unitPrice: editingSalesRecord.unitPrice
                  });
                  setConfirmModal({
                    isOpen: true,
                    title: 'Sales Record Updated',
                    description: 'Sales details have been successfully updated in database.',
                    type: 'success',
                    confirmText: 'OK'
                  });
                } catch (err: any) {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Update Failed',
                    description: err.message || 'Unknown error occurred while updating sales record.',
                    type: 'danger',
                    confirmText: 'Dismiss'
                  });
                }
              }
              setEditingSalesRecord(null);
            }} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="es_date" className="text-xs font-bold uppercase text-slate-455 tracking-wider">Sales Date</Label>
                  <Input
                    id="es_date"
                    type="date"
                    required
                    value={editingSalesRecord.salesDate}
                    onChange={e => setEditingSalesRecord(prev => prev ? { ...prev, salesDate: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="es_type" className="text-xs font-bold uppercase text-slate-455 tracking-wider">Sale Type</Label>
                  <select
                    id="es_type"
                    value={editingSalesRecord.saleType}
                    onChange={e => setEditingSalesRecord(prev => prev ? { ...prev, saleType: e.target.value as 'Scale' | 'Lumpsum' } : null)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none"
                  >
                    <option value="Scale">Scale (per kg)</option>
                    <option value="Lumpsum">Lumpsum (fixed)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="es_buyer" className="text-xs font-bold uppercase text-slate-455 tracking-wider">Buyer Name</Label>
                <Input
                  id="es_buyer"
                  type="text"
                  required
                  value={editingSalesRecord.buyer}
                  onChange={e => setEditingSalesRecord(prev => prev ? { ...prev, buyer: e.target.value } : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="es_weight" className="text-xs font-bold uppercase text-slate-455 tracking-wider">Weight (kg)</Label>
                  <Input
                    id="es_weight"
                    type="number"
                    required
                    value={editingSalesRecord.weight}
                    onChange={e => setEditingSalesRecord(prev => prev ? { ...prev, weight: Number(e.target.value) } : null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="es_price" className="text-xs font-bold uppercase text-slate-455 tracking-wider">
                    {editingSalesRecord.saleType === 'Scale' ? 'Unit Price (៛/kg)' : 'Lumpsum Price (៛)'}
                  </Label>
                  <Input
                    id="es_price"
                    type="number"
                    required
                    value={editingSalesRecord.unitPrice}
                    onChange={e => setEditingSalesRecord(prev => prev ? { ...prev, unitPrice: Number(e.target.value) } : null)}
                  />
                </div>
              </div>

              {/* Total gross income preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Gross Income</span>
                <span className="font-mono text-emerald-600 font-extrabold text-sm">
                  ៛ {(editingSalesRecord.saleType === 'Scale' ? editingSalesRecord.weight * editingSalesRecord.unitPrice : editingSalesRecord.unitPrice).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingSalesRecord(null)} className="rounded-xl font-bold py-2">Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold py-2 text-white">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
