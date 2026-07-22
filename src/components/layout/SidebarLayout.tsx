'use client';

import React, { useState } from 'react';
import { 
  Database, 
  DollarSign, 
  Scale, 
  LogOut, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Heart, 
  Settings, 
  PieChart, 
  LayoutDashboard,
  Menu,
  X,
  Building
} from 'lucide-react';
import { StockItem } from '@/lib/xlsx-parser';
import { UserRoleItem } from '@/lib/types';
import { hasPermission } from '@/lib/utils';

export type ActiveTabType = 
  | 'dashboard' 
  | 'cow-inventory' 
  | 'batch-management' 
  | 'health-tracking' 
  | 'weight-tracking' 
  | 'sales-finance' 
  | 'analytics' 
  | 'settings'
  | 'farms';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute Stats for ACTIVE stock items (not sold)
  const activeStock = stock.filter(item => item.status.toLowerCase() === 'active');
  const totalHead = activeStock.length;
  const totalWeight = activeStock.reduce((sum, item) => sum + (item.weight || 0), 0);
  const averageWeight = totalHead > 0 ? Math.round(totalWeight / totalHead) : 0;
  const inventoryValue = activeStock.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full text-slate-100">
      <div className="overflow-y-auto scrollbar-thin">
        {/* Logo / Title */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-emerald-950 bg-emerald-950/10 sticky top-0 bg-[#002D26] z-10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white shadow-xs flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="SNR Farm Logo" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight tracking-wider uppercase text-white">SNR Farm</h1>
              <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">LIVESTOCK ERP</p>
            </div>
          </div>
          {/* Close button for mobile menu */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links Grouped by Modules */}
        <div className="p-4 space-y-5">
          {/* Core Section */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Core</p>
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              Dashboard Home
            </button>
          </div>

          {/* Livestock ERP Section */}
          {(hasPermission(currentUser, 'stock_view') || 
            hasPermission(currentUser, 'batch_view') || 
            hasPermission(currentUser, 'health_view')) && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Livestock ERP</p>
              <div className="space-y-1">
                {hasPermission(currentUser, 'stock_view') && (
                  <button
                    onClick={() => handleTabChange('cow-inventory')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      activeTab === 'cow-inventory'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                    }`}
                  >
                    <Database className="h-4 w-4 flex-shrink-0" />
                    Cow Inventory
                  </button>
                )}
                {hasPermission(currentUser, 'batch_view') && (
                  <button
                    onClick={() => handleTabChange('batch-management')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      activeTab === 'batch-management'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 flex-shrink-0" />
                    Fattening Program
                  </button>
                )}
                {hasPermission(currentUser, 'health_view') && (
                  <button
                    onClick={() => handleTabChange('health-tracking')}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      activeTab === 'health-tracking'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="h-4 w-4 flex-shrink-0" />
                      Health & Medical
                    </span>
                    {(healthAlertsCount > 0 || vaccineAlertsCount > 0) && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 block animate-ping" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Financial Ledger Section */}
          {(hasPermission(currentUser, 'sales_view') || 
            hasPermission(currentUser, 'expenses_view')) && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Financials</p>
              <button
                onClick={() => handleTabChange('sales-finance')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'sales-finance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                }`}
              >
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                Ledger & Revenue
              </button>
            </div>
          )}

          {/* Reports & Analytics */}
          {hasPermission(currentUser, 'analytics_view') && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Reports</p>
              <button
                onClick={() => handleTabChange('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                }`}
              >
                <PieChart className="h-4 w-4 flex-shrink-0" />
                Analytics BI
              </button>
            </div>
          )}

          {/* Configuration */}
          {(hasPermission(currentUser, 'settings_manage') || hasPermission(currentUser, 'farms_manage')) && (
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/40 px-3 mb-1.5">Administration</p>
              <div className="space-y-1">
                {hasPermission(currentUser, 'farms_manage') && (
                  <button
                    onClick={() => handleTabChange('farms')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      activeTab === 'farms'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                    }`}
                  >
                    <Building className="h-4 w-4 flex-shrink-0" />
                    Farms & Branches
                  </button>
                )}
                {hasPermission(currentUser, 'settings_manage') && (
                  <button
                    onClick={() => handleTabChange('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-emerald-950/40 hover:text-slate-200'
                    }`}
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    ERP Master Setup
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 space-y-2.5 bg-[#002822]">
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
                className="text-emerald-400 hover:text-white transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Desktop Sidebar (hidden on mobile/tablet) */}
      <aside className="hidden md:flex w-64 bg-[#002D26] shadow-xl flex-shrink-0 flex-col">
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Mobile Navigation Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-[#002D26] h-full shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-50/70 min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md p-4 sm:p-6 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  SNR Farm ERP Portal
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-450 font-semibold flex items-center gap-2 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Active Operations Center & Lifecycle Registry.
                </p>
              </div>
            </div>
            <div className="hidden lg:flex text-xs text-emerald-600 font-bold bg-emerald-50/60 py-1.5 px-3.5 rounded-full border border-emerald-100/60 items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Responsive Stats Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#F2FAF7] border border-[#D1EBE1] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active</p>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{totalHead} <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">cows</span></h3>
              </div>
              <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-[#057A55] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <Database className="h-4 sm:h-5 w-4 sm:w-5" />
              </div>
            </div>

            <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Weight</p>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{averageWeight} <span className="text-[10px] sm:text-xs text-blue-600 font-bold">kg</span></h3>
              </div>
              <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <Scale className="h-4 sm:h-5 w-4 sm:w-5" />
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Value</p>
                <h3 className="text-base sm:text-xl font-black text-slate-900 mt-0.5 sm:mt-1">៛ {inventoryValue.toLocaleString()}</h3>
              </div>
              <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <DollarSign className="h-4 sm:h-5 w-4 sm:w-5" />
              </div>
            </div>

            <div className={`border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xs ${
              healthAlertsCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-[#F2FAF7] border-[#D1EBE1]'
            }`}>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Status</p>
                <h3 className="text-xs sm:text-xl font-black text-slate-900 mt-0.5 sm:mt-1">
                  {healthAlertsCount > 0 ? `${healthAlertsCount} Alerts` : '100% Stable'}
                </h3>
              </div>
              <div className={`h-8 sm:h-10 w-8 sm:w-10 rounded-full flex items-center justify-center shadow-xs flex-shrink-0 ${
                healthAlertsCount > 0 ? 'bg-red-500 text-white' : 'bg-[#057A55] text-white'
              }`}>
                <Activity className="h-4 sm:h-5 w-4 sm:w-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-3 sm:p-6 flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
