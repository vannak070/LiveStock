'use client';

import React from 'react';
import { 
  Database, 
  DollarSign, 
  Scale, 
  LogOut, 
  Calendar, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  Heart, 
  Settings, 
  PieChart, 
  LayoutDashboard,
  Users,
  ShoppingBag
} from 'lucide-react';
import { StockItem } from '@/lib/xlsx-parser';
import { UserRoleItem } from '@/lib/types';

export type ActiveTabType = 
  | 'dashboard' 
  | 'cow-inventory' 
  | 'batch-management' 
  | 'health-tracking' 
  | 'weight-tracking' 
  | 'sales-finance' 
  | 'analytics' 
  | 'settings';

interface SidebarLayoutProps {
  children: React.ReactNode;
  stock: StockItem[];
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenQuickEntry: () => void;
  healthAlertsCount: number;
  vaccineAlertsCount: number;
  currentUser?: UserRoleItem | null;
  onLogout?: () => void;
}

export default function SidebarLayout({
  children,
  stock,
  activeTab,
  setActiveTab,
  onOpenQuickEntry,
  healthAlertsCount,
  vaccineAlertsCount,
  currentUser,
  onLogout
}: SidebarLayoutProps) {
  // Compute Stats for ACTIVE stock items (not sold)
  const activeStock = stock.filter(item => item.status.toLowerCase() === 'active');
  const totalHead = activeStock.length;
  
  const totalWeight = activeStock.reduce((sum, item) => sum + (item.weight || 0), 0);
  const averageWeight = totalHead > 0 ? Math.round(totalWeight / totalHead) : 0;
  
  const inventoryValue = activeStock.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar with Dark Teal Color #002D26 */}
      <aside className="w-64 bg-[#002D26] text-slate-100 flex flex-col justify-between shadow-xl flex-shrink-0">
        <div className="overflow-y-auto max-h-[85vh] scrollbar-thin">
          {/* Logo / Title */}
          <div className="h-20 flex items-center gap-3 px-6 border-b border-emerald-950 bg-emerald-950/10 sticky top-0 bg-[#002D26] z-10">
            <div className="p-1.5 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="SNR Farm Logo" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight tracking-wider uppercase text-white">SNR Farm</h1>
              <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">LIVESTOCK ERP</p>
            </div>
          </div>

          {/* Navigation Links Grouped by Modules */}
          <div className="p-4 space-y-5">
            {/* Core Section */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Core</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                    : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Home
              </button>
            </div>

            {/* Livestock ERP Section */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Livestock ERP</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('cow-inventory')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'cow-inventory'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                      : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  Cow Inventory
                </button>
                <button
                  onClick={() => setActiveTab('batch-management')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'batch-management'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                      : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Fattening Program
                </button>
                <button
                  onClick={() => setActiveTab('health-tracking')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'health-tracking'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                      : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Heart className="h-4 w-4" />
                    Health & Medical
                  </span>
                  {(healthAlertsCount > 0 || vaccineAlertsCount > 0) && (
                    <span className="h-2 w-2 rounded-full bg-amber-500 block animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {/* Financial Ledger Section */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Financials</p>
              <button
                onClick={() => setActiveTab('sales-finance')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'sales-finance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                    : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                }`}
              >
                <DollarSign className="h-4 w-4" />
                Ledger & Revenue
              </button>
            </div>

            {/* Reports & Analytics */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Reports</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'analytics'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                      : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                  }`}
                >
                  <PieChart className="h-4 w-4" />
                  Analytics BI
                </button>
              </div>
            </div>

            {/* Configuration */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Administration</p>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow'
                    : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                }`}
              >
                <Settings className="h-4 w-4" />
                ERP Master Setup
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Elements */}
        <div className="p-4 space-y-2.5">
          {/* Contact Details */}
          {currentUser && (
            <div className="flex items-center gap-3 px-2 pt-2 border-t border-emerald-950/60">
              <div className="h-8 w-8 rounded-full bg-emerald-800/65 border border-emerald-700 flex items-center justify-center font-bold text-xs text-emerald-100 flex-shrink-0">
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-50 truncate">{currentUser.name}</p>
                <p className="text-[9px] text-emerald-400/80 truncate">{currentUser.role}</p>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="text-emerald-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto">
        {/* Top Header */}
        <header className="border-b border-slate-200/60 bg-white/85 backdrop-blur-md p-6 sticky top-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                SNR Farm ERP Portal
              </h2>
              <p className="text-xs text-slate-450 font-semibold flex items-center gap-2 mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Active Operations Center & Lifecycle Registry.
              </p>
            </div>
            <div className="text-xs text-emerald-600 font-bold bg-emerald-50/60 py-1.5 px-3.5 rounded-full border border-emerald-100/60 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              System Time: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#F2FAF7] border border-[#D1EBE1] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Head</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalHead} <span className="text-xs text-emerald-600 font-bold">cows</span></h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#057A55] text-white flex items-center justify-center shadow">
                <Database className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average weight</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{averageWeight} <span className="text-xs text-blue-600 font-bold">kg</span></h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow">
                <Scale className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset value</p>
                <h3 className="text-xl font-black text-slate-900 mt-1">៛ {inventoryValue.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${
              healthAlertsCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-[#F2FAF7] border-[#D1EBE1]'
            }`}>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health status</p>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {healthAlertsCount > 0 ? `${healthAlertsCount} Critical Alerts` : '100% Stable'}
                </h3>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow ${
                healthAlertsCount > 0 ? 'bg-red-500 text-white' : 'bg-[#057A55] text-white'
              }`}>
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
