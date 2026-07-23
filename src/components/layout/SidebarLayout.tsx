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
  Building,
  ChevronRight,
  Beef,
  Syringe
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

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number | string | null;
  badgeColor?: 'amber' | 'rose' | 'emerald';
}

function NavItem({ icon, label, isActive, onClick, badge, badgeColor = 'amber' }: NavItemProps) {
  const badgeColors = {
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-600/30 shadow-sm'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
          {icon}
        </span>
        <span className="text-[13px] leading-none">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        {badge ? (
          <span className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[9px] font-black text-white ${badgeColors[badgeColor]} animate-pulse`}>
            {badge}
          </span>
        ) : isActive ? (
          <ChevronRight className="h-3 w-3 text-emerald-400/60" />
        ) : null}
      </span>
    </button>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600 px-3 py-1.5 flex items-center gap-2">
        <span className="h-px flex-1 bg-slate-700/50" />
        {label}
        <span className="h-px flex-1 bg-slate-700/50" />
      </p>
      {children}
    </div>
  );
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

  const activeStock = stock.filter(item => item.status.toLowerCase() === 'active');
  const totalHead = activeStock.length;
  const totalWeight = activeStock.reduce((sum, item) => sum + (item.weight || 0), 0);
  const averageWeight = totalHead > 0 ? Math.round(totalWeight / totalHead) : 0;
  const inventoryValue = activeStock.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalAlerts = healthAlertsCount + vaccineAlertsCount;

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Get user initials for avatar
  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  // Role color badge
  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Admin': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Company': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    'Farm Owner': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Farm Staff': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Veterinarian': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  const roleBadgeClass = roleColors[currentUser?.role || ''] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

  const navContent = (
    <div className="flex flex-col h-full bg-[#0C1F1A]">

      {/* ─── Logo ─── */}
      <div className="flex items-center justify-between h-[72px] px-5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-900/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/logo.png" alt="SNR Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-wide leading-none">LiveStock Fattening</p>
            <p className="text-emerald-500 text-[9px] font-bold tracking-[0.12em] uppercase mt-0.5">Cattle ERP</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ─── Live Herd Stats Strip ─── */}
      <div className="mx-4 mt-4 mb-2 rounded-xl bg-emerald-950/60 border border-emerald-900/40 p-3 grid grid-cols-2 gap-y-2.5 gap-x-2">
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Herd</p>
          <p className="text-base font-black text-white mt-0.5">{totalHead} <span className="text-[10px] font-semibold text-emerald-500">head</span></p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Avg Weight</p>
          <p className="text-base font-black text-white mt-0.5">{averageWeight} <span className="text-[10px] font-semibold text-blue-400">kg</span></p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Asset Value</p>
          <p className="text-xs font-black text-white mt-0.5 truncate">៛{(inventoryValue / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Health</p>
          <p className={`text-xs font-black mt-0.5 ${totalAlerts > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalAlerts > 0 ? `${totalAlerts} Alert${totalAlerts > 1 ? 's' : ''}` : '✓ Stable'}
          </p>
        </div>
      </div>


      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-emerald-900/60">

        {/* Core */}
        <NavSection label="Overview">
          <NavItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            isActive={activeTab === 'dashboard'}
            onClick={() => handleTabChange('dashboard')}
          />
        </NavSection>

        {/* Livestock ERP */}
        {(hasPermission(currentUser, 'stock_view') ||
          hasPermission(currentUser, 'batch_view') ||
          hasPermission(currentUser, 'health_view')) && (
          <NavSection label="Livestock ERP">
            {hasPermission(currentUser, 'stock_view') && (
              <NavItem
                icon={<Beef className="h-4 w-4" />}
                label="Cattle Registry"
                isActive={activeTab === 'cow-inventory'}
                onClick={() => handleTabChange('cow-inventory')}
              />
            )}
            {hasPermission(currentUser, 'batch_view') && (
              <NavItem
                icon={<TrendingUp className="h-4 w-4" />}
                label="Fattening Batches & Diet"
                isActive={activeTab === 'batch-management'}
                onClick={() => handleTabChange('batch-management')}
              />
            )}
            {hasPermission(currentUser, 'health_view') && (
              <NavItem
                icon={<Syringe className="h-4 w-4" />}
                label="Medical & Vaccines"
                isActive={activeTab === 'health-tracking'}
                onClick={() => handleTabChange('health-tracking')}
                badge={totalAlerts > 0 ? totalAlerts : null}
                badgeColor="rose"
              />
            )}
          </NavSection>
        )}

        {/* Financials */}
        {(hasPermission(currentUser, 'sales_view') ||
          hasPermission(currentUser, 'expenses_view')) && (
          <NavSection label="Financials">
            <NavItem
              icon={<DollarSign className="h-4 w-4" />}
              label="Feed Costs & Revenue"
              isActive={activeTab === 'sales-finance'}
              onClick={() => handleTabChange('sales-finance')}
            />
          </NavSection>
        )}

        {/* Analytics */}
        {hasPermission(currentUser, 'analytics_view') && (
          <NavSection label="Insights">
            <NavItem
              icon={<PieChart className="h-4 w-4" />}
              label="Growth & Profit Analytics"
              isActive={activeTab === 'analytics'}
              onClick={() => handleTabChange('analytics')}
            />
          </NavSection>
        )}

        {/* Administration */}
        {(hasPermission(currentUser, 'settings_manage') || hasPermission(currentUser, 'farms_manage')) && (
          <NavSection label="Administration">
            {hasPermission(currentUser, 'farms_manage') && (
              <NavItem
                icon={<Building className="h-4 w-4" />}
                label="Farms & Stall Branches"
                isActive={activeTab === 'farms'}
                onClick={() => handleTabChange('farms')}
              />
            )}
            {hasPermission(currentUser, 'settings_manage') && (
              <NavItem
                icon={<Settings className="h-4 w-4" />}
                label="ERP Master Setup"
                isActive={activeTab === 'settings'}
                onClick={() => handleTabChange('settings')}
              />
            )}
          </NavSection>
        )}
      </nav>

      {/* ─── User Profile Footer ─── */}
      {currentUser && (
        <div className="flex-shrink-0 mx-3 mb-3 mt-1 border-t border-white/5 pt-3">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 hover:bg-white/8 transition-colors">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-black text-xs text-white flex-shrink-0 shadow-md">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate leading-tight">{currentUser.name}</p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${roleBadgeClass}`}>
                {currentUser.role}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-rose-500/10"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col shadow-2xl shadow-slate-900/20">
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] h-full shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-50 min-w-0 overflow-y-auto">

        {/* Top Header Bar */}
        <header className="border-b border-slate-200/70 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                  LiveStock Fattening ERP
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Fattening Livestock Management System
                </p>
              </div>
            </div>
            <div className="hidden lg:flex text-xs text-slate-500 font-semibold bg-slate-50 py-2 px-3.5 rounded-full border border-slate-200 items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Responsive Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Herd</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5 leading-none">{totalHead}<span className="text-[10px] text-emerald-600 font-bold ml-1">head</span></h3>
              </div>
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Database className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg Weight</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5 leading-none">{averageWeight}<span className="text-[10px] text-blue-600 font-bold ml-1">kg</span></h3>
              </div>
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Scale className="h-4 w-4" />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Asset Value</p>
                <h3 className="text-sm font-black text-slate-900 mt-0.5 leading-none truncate">៛ {inventoryValue.toLocaleString()}</h3>
              </div>
              <div className="h-9 w-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>

            <div className={`border rounded-xl p-3 flex items-center justify-between ${
              healthAlertsCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Health Status</p>
                <h3 className={`text-sm font-black mt-0.5 leading-none ${healthAlertsCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {healthAlertsCount > 0 ? `${healthAlertsCount} Alerts` : '✓ All Stable'}
                </h3>
              </div>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 text-white ${
                healthAlertsCount > 0 ? 'bg-rose-500' : 'bg-emerald-600'
              }`}>
                <Activity className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
