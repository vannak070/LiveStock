'use client';

import React from 'react';
import { ERPLivestockData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Activity, ShieldAlert, Calendar, DollarSign, Scale, Beef, TrendingUp, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

interface DashboardHomeProps {
  data: ERPLivestockData;
  onNavigateToTab: (tab: any) => void;
}

export default function DashboardHome({ data, onNavigateToTab }: DashboardHomeProps) {
  const activeCows = data.stock.filter(c => c.status.toLowerCase() === 'active');
  const soldCows = data.stock.filter(c => c.status.toLowerCase() === 'sold');
  const healthyCount = activeCows.filter(c => c.healthStatus.toLowerCase() === 'good').length;
  const sickCows = activeCows.filter(c => c.healthStatus.toLowerCase() === 'poor' || c.healthStatus.toLowerCase() === 'fair');

  // Active fattening batches
  const activeBatches = data.batches.filter(b => b.status === 'Active');

  // Total revenue from fattening sales
  const totalRevenue = data.salesTracking.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Average weight gain across active cattle
  const recentWeights = data.weightTracking.slice(-30);
  const avgGain = recentWeights.length > 0
    ? recentWeights.reduce((sum, w) => sum + (w.gainLoss || 0), 0) / recentWeights.length
    : 0;

  // Weight growth chart — group by date bucket
  const growthByDate: Record<string, number[]> = {};
  data.weightTracking.slice(-30).forEach(w => {
    const day = w.trackingDate ? new Date(w.trackingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
    if (!growthByDate[day]) growthByDate[day] = [];
    growthByDate[day].push(w.gainLoss || 0);
  });
  const growthChartData = Object.entries(growthByDate).slice(-10).map(([date, gains]) => ({
    date,
    avgGain: parseFloat((gains.reduce((s, g) => s + g, 0) / gains.length).toFixed(2))
  }));

  // Sales revenue per month (last 5 months)
  const revenueByMonth: Record<string, number> = {};
  data.salesTracking.forEach(s => {
    const month = s.salesDate ? new Date(s.salesDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A';
    revenueByMonth[month] = (revenueByMonth[month] || 0) + (s.totalPrice || 0);
  });
  const revenueChartData = Object.entries(revenueByMonth).slice(-6).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue / 1000)
  }));

  // Recent intake / acquisition
  const recentCows = [...data.stock]
    .sort((a, b) => new Date(b.purchaseDate || 0).getTime() - new Date(a.purchaseDate || 0).getTime())
    .slice(0, 5);

  // Recent sales
  const recentSales = [...data.salesTracking]
    .sort((a, b) => new Date(b.salesDate || 0).getTime() - new Date(a.salesDate || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

        {/* Active Fattening Herd */}
        <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigateToTab('cow-inventory')}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Beef className="h-3.5 w-3.5 text-emerald-600" /> Active Fattening Herd
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 mt-1">{activeCows.length} Head</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-emerald-600 font-bold">Total Intake: {data.stock.length} • Sold: {soldCows.length}</p>
          </CardContent>
        </Card>

        {/* Active Batches */}
        <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigateToTab('batch-management')}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-teal-600" /> Fattening Batches
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 mt-1">{activeBatches.length} Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-teal-600 font-bold">Total batches: {data.batches.length}</p>
          </CardContent>
        </Card>

        {/* Avg Weight Gain */}
        <Card className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-amber-600" /> Avg Fattening Gain
            </CardDescription>
            <CardTitle className={`text-2xl font-black mt-1 ${avgGain >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {avgGain >= 0 ? '+' : ''}{avgGain.toFixed(1)} kg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 font-bold">Per head, last 30 weight updates</p>
          </CardContent>
        </Card>

        {/* Medical Alerts */}
        <Card
          className={`border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${sickCows.length > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}
          onClick={() => sickCows.length > 0 && onNavigateToTab('health-tracking')}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Health Alerts
            </CardDescription>
            <CardTitle className={`text-2xl font-black mt-1 ${sickCows.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {sickCows.length} Sick
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sickCows.length > 0 ? (
              <button onClick={() => onNavigateToTab('health-tracking')} className="text-[10px] text-rose-500 hover:underline font-bold animate-pulse flex items-center gap-1">
                View Alerts <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold">Herd healthy. No active alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Profit Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">Total Sales Revenue</p>
          <p className="text-2xl font-black mt-1">៛ {totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] opacity-60 mt-1">From {soldCows.length} fattened cattle sold</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Expenses</p>
          <p className="text-2xl font-black mt-1 text-rose-500">៛ {totalExpenses.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Feed, medical, labor & operations</p>
        </div>
        <div className={`p-5 rounded-2xl shadow-sm border ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Profit / Loss</p>
          <p className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {netProfit >= 0 ? '+' : ''}៛ {netProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Revenue minus total expenditure</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Avg Weight Gain Line Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Daily Avg Weight Gain Trend (kg)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Average growth per head across recent daily weigh-ins</p>
          </div>
          <div className="h-[220px]">
            {growthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px' }}
                    itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="avgGain" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Avg Gain (kg)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No weight data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Sales Revenue Bar Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Monthly Sales Revenue (Thousands ៛)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Revenue generated from fattened cattle sold per month</p>
          </div>
          <div className="h-[220px]">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px' }}
                    itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                    formatter={(v: any) => [`${v}K ៛`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue (K ៛)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No sales data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Intake & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Recently Acquired Cattle */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recently Acquired Cattle</h4>
            <button onClick={() => onNavigateToTab('cow-inventory')} className="text-[10px] text-emerald-600 hover:underline font-bold flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentCows.length > 0 ? recentCows.map((c, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs border border-emerald-100">
                    {c.id.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{c.id}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{c.breed} • {c.sex} • {(c as any).currentWeight ?? '—'} kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">៛ {c.totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{c.purchaseDate ? new Date(c.purchaseDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-8 font-semibold">No cattle acquired yet.</p>
            )}
          </div>
        </div>

        {/* Right: Recent Fattening Sales */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recent Fattening Sales</h4>
            <button onClick={() => onNavigateToTab('sales-finance')} className="text-[10px] text-emerald-600 hover:underline font-bold flex items-center gap-1">
              View Ledger <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSales.length > 0 ? recentSales.map((s, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs border border-amber-100">
                    {s.cowId.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{s.cowId}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{s.breed} • {s.weight} kg sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-emerald-600">+៛ {s.totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{s.salesDate ? new Date(s.salesDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-8 font-semibold">No sales finalized yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
