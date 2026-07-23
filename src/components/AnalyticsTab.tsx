'use client';

import React, { useState, useMemo } from 'react';
import { ERPLivestockData, FarmItem } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Scale, ShoppingBag, PieChart as PieChartIcon, Heart, ShieldAlert, Award } from 'lucide-react';
import FarmFilterBar from './FarmFilterBar';

interface AnalyticsTabProps {
  data: ERPLivestockData;
  currentUser?: any;
  farms?: FarmItem[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

export default function AnalyticsTab({ data, currentUser, farms = [] }: AnalyticsTabProps) {
  const [subTab, setSubTab] = useState<'overview' | 'demographics' | 'batches' | 'health' | 'financial'>('overview');
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);

  // Farm-scoped data — all memos below use this instead of raw `data`
  const farmScopedData = useMemo(() => {
    if (!selectedFarm) return data;
    const scopedStock = data.stock.filter(s => s.location === selectedFarm);
    const scopedIds = scopedStock.map(s => s.id);
    return {
      ...data,
      stock: scopedStock,
      batches: data.batches.filter(b => b.farmLocation === selectedFarm || b.cowIds.some(id => scopedIds.includes(id))),
      weightTracking: data.weightTracking.filter(w => scopedIds.includes(w.cowId)),
      healthLogs: data.healthLogs.filter(h => scopedIds.includes(h.cowId)),
      salesTracking: data.salesTracking.filter(s => scopedIds.includes(s.cowId)),
      expenses: data.expenses.filter(e => e.farmLocation === selectedFarm)
    };
  }, [data, selectedFarm]);

  // Count cattle per farm for the filter bar
  const countByFarm = useMemo(() => {
    const map: Record<string, number> = {};
    data.stock.forEach(s => { if (s.location) map[s.location] = (map[s.location] || 0) + 1; });
    return map;
  }, [data.stock]);

  // Active cattle list
  const activeCows = useMemo(() => {
    return farmScopedData.stock.filter(c => c.status.toLowerCase() === 'active');
  }, [farmScopedData.stock]);

  // Executive BI KPI Summary Metrics
  const biKpis = useMemo(() => {
    const totalActiveHead = activeCows.length;
    const totalAssetValuation = activeCows.reduce((sum, c) => sum + (c.totalPrice || (c.weight * c.unitPrice) || 0), 0);
    const totalSalesRevenue = farmScopedData.salesTracking.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const totalOperatingExpenses = farmScopedData.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalSalesRevenue - totalOperatingExpenses;

    const deadCount = farmScopedData.stock.filter(c => c.healthStatus.toLowerCase() === 'dead' || c.status.toLowerCase() === 'dead').length;
    const mortalityRate = farmScopedData.stock.length > 0 ? ((deadCount / farmScopedData.stock.length) * 100).toFixed(1) : '0';

    return {
      totalActiveHead,
      totalAssetValuation,
      totalSalesRevenue,
      totalOperatingExpenses,
      netProfit,
      deadCount,
      mortalityRate
    };
  }, [activeCows, farmScopedData.stock, farmScopedData.salesTracking, farmScopedData.expenses]);

  // Breed Weight & Valuation Performance
  const breedPerformance = useMemo(() => {
    const map: Record<string, { totalWeight: number; count: number; maxWeight: number; totalValuation: number }> = {};
    activeCows.forEach(cow => {
      if (!map[cow.breed]) {
        map[cow.breed] = { totalWeight: 0, count: 0, maxWeight: 0, totalValuation: 0 };
      }
      map[cow.breed].totalWeight += cow.weight;
      map[cow.breed].count += 1;
      map[cow.breed].totalValuation += (cow.totalPrice || (cow.weight * cow.unitPrice) || 0);
      if (cow.weight > map[cow.breed].maxWeight) {
        map[cow.breed].maxWeight = cow.weight;
      }
    });

    return Object.entries(map).map(([breed, stats]) => ({
      name: breed,
      'Avg Weight (kg)': Math.round(stats.totalWeight / stats.count),
      'Max Weight (kg)': stats.maxWeight,
      count: stats.count,
      totalValuation: stats.totalValuation
    }));
  }, [activeCows]);

  // Demographic Pie Chart Data
  const breedComposition = useMemo(() => {
    const map: Record<string, number> = {};
    activeCows.forEach(cow => {
      map[cow.breed] = (map[cow.breed] || 0) + 1;
    });
    return Object.entries(map).map(([breed, count]) => ({
      name: breed,
      value: count,
      percentage: activeCows.length > 0 ? Math.round((count / activeCows.length) * 100) : 0
    }));
  }, [activeCows]);

  const genderComposition = useMemo(() => {
    const map: Record<string, number> = {};
    activeCows.forEach(cow => {
      const sex = cow.sex || 'Unknown';
      map[sex] = (map[sex] || 0) + 1;
    });
    return Object.entries(map).map(([sex, count]) => ({
      name: sex,
      value: count,
      percentage: activeCows.length > 0 ? Math.round((count / activeCows.length) * 100) : 0
    }));
  }, [activeCows]);

  const acquisitionComposition = useMemo(() => {
    const map: Record<string, number> = {};
    activeCows.forEach(cow => {
      const type = cow.purchaseType || cow.buyType || 'Purchase';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: activeCows.length > 0 ? Math.round((count / activeCows.length) * 100) : 0
    }));
  }, [activeCows]);

  // Health Status Composition
  const healthComposition = useMemo(() => {
    const map: Record<string, number> = {};
    activeCows.forEach(cow => {
      map[cow.healthStatus] = (map[cow.healthStatus] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: activeCows.length > 0 ? Math.round((count / activeCows.length) * 100) : 0
    }));
  }, [activeCows]);

  // Fattening Herd & ADG Growth Calculation
  const batchAnalytics = useMemo(() => {
    return data.batches.map(batch => {
      const cowsInBatch = data.stock.filter(c => batch.cowIds.includes(c.id));
      const activeCowsInBatch = cowsInBatch.filter(c => c.status.toLowerCase() === 'active');
      const avgWeight = activeCowsInBatch.length > 0
        ? Math.round(activeCowsInBatch.reduce((sum, c) => sum + c.weight, 0) / activeCowsInBatch.length)
        : 0;

      // ADG calculation across weight records
      let totalAdgSum = 0;
      let adgCount = 0;

      activeCowsInBatch.forEach(cow => {
        const records = data.weightTracking
          .filter(w => w.cowId === cow.id && w.trackingDate)
          .sort((a, b) => new Date(a.trackingDate!).getTime() - new Date(b.trackingDate!).getTime());
        if (records.length >= 2) {
          const earliest = records[0];
          const latest = records[records.length - 1];
          const daysDiff = Math.max(1, Math.round((new Date(latest.trackingDate!).getTime() - new Date(earliest.trackingDate!).getTime()) / (1000 * 60 * 60 * 24)));
          const weightDiff = latest.currentWeight - earliest.currentWeight;
          if (daysDiff > 0 && weightDiff > 0) {
            totalAdgSum += weightDiff / daysDiff;
            adgCount++;
          }
        }
      });

      const avgAdgKg = adgCount > 0 ? parseFloat((totalAdgSum / adgCount).toFixed(2)) : 0.85; // default benchmark if single weight

      // Daily ration cost per head from feeding program
      let dailyFeedCostPerHead = 0;
      if (batch.feedingProgram && batch.feedingProgram.ingredients) {
        dailyFeedCostPerHead = batch.feedingProgram.ingredients.reduce((sum, ing) => sum + (ing.portionPerHead * ing.unitCost), 0);
      } else {
        dailyFeedCostPerHead = (3.5 * 2000) + (15 * 350) + (2 * 150); // standard default formula ~ 12,550 KHR
      }

      return {
        name: batch.name,
        code: batch.id,
        type: batch.type,
        count: cowsInBatch.length,
        'Avg Weight (kg)': avgWeight,
        'ADG (kg/day)': avgAdgKg,
        dailyFeedCostPerHead,
        status: batch.status
      };
    });
  }, [data.batches, data.stock, data.weightTracking]);

  // Monthly Financial P&L
  const financialMonthly = useMemo(() => {
    const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};

    data.expenses.forEach(exp => {
      const month = exp.date ? exp.date.substring(0, 7) : new Date().toISOString().substring(0, 7);
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0 };
      monthlyMap[month].expenses += exp.amount;
    });

    data.salesTracking.forEach(sale => {
      const month = sale.salesDate ? sale.salesDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0 };
      monthlyMap[month].revenue += sale.totalPrice;
    });

    return Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, values]) => {
        const [year, m] = month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(m) - 1);
        const name = dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        return {
          monthStr: month,
          name,
          'Total Revenue (៛)': values.revenue,
          'Total Expenses (៛)': values.expenses,
          'Net Profit (៛)': values.revenue - values.expenses
        };
      });
  }, [data.expenses, data.salesTracking]);

  // Operating Expense Breakdown
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    data.expenses.forEach(exp => {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
  }, [farmScopedData.expenses]);

  return (
    <div className="space-y-6 text-left">
      {/* Navigation sub-tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setSubTab('overview')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'overview'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <PieChartIcon className="h-4 w-4" />
          Executive BI Overview
        </button>
        <button
          onClick={() => setSubTab('demographics')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'demographics'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Herd Demographics & Stock
        </button>
        <button
          onClick={() => setSubTab('batches')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'batches'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Scale className="h-4 w-4" />
          Fattening & ADG Growth
        </button>
        <button
          onClick={() => setSubTab('health')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'health'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Heart className="h-4 w-4" />
          Health & Vet Analytics
        </button>
        <button
          onClick={() => setSubTab('financial')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'financial'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Financials & Sales BI
        </button>
      </div>

      {/* Farm Filter Bar */}
      <FarmFilterBar
        farms={farms}
        selectedFarm={selectedFarm}
        onFarmChange={setSelectedFarm}
        countByFarm={countByFarm}
        totalCount={data.stock.length}
        label="cattle"
        currentUser={currentUser}
      />

      {/* 1. Executive BI Overview */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Active Herd</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-slate-800">{biKpis.totalActiveHead} <span className="text-xs font-bold text-emerald-600">Head</span></p>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Herd Asset Valuation</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-black text-emerald-600">៛ {biKpis.totalAssetValuation.toLocaleString()}</p>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Award className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Profit / Loss</p>
              <div className="flex items-center justify-between">
                <p className={`text-xl font-black ${biKpis.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ៛ {biKpis.netProfit.toLocaleString()}
                </p>
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mortality Rate (%)</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-slate-800">{biKpis.mortalityRate}% <span className="text-xs text-slate-400 font-normal">({biKpis.deadCount} Dead)</span></p>
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly P&L Financial Area Chart */}
          <Card className="bg-white border border-slate-100 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Monthly Revenue vs Operating Expenses P&L
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Track gross sales revenue against feed, medicine, and farm expenses month over month</CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
              {financialMonthly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      formatter={(val: any) => val ? `៛ ${Number(val).toLocaleString()}` : '៛ 0'}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="Total Revenue (៛)" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="Total Expenses (៛)" stroke="#EF4444" fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">No financial records recorded.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Herd Demographics & Stock */}
      {subTab === 'demographics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Breed Weight Performance */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-slate-100 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-800">Breed Weight Performance (តម្លៃមធ្យមធៀបទម្ងន់អតិបរមា)</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Comparing weight metrics across active breeds</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {breedPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breedPerformance} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                        <Bar dataKey="Avg Weight (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Max Weight (kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">No breed data available.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Breed Composition Pie Chart */}
            <div className="lg:col-span-1">
              <Card className="bg-white border border-slate-100 shadow-xs h-full flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-800">Breed Composition (ចំណែកពូជគោសរុប)</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Percentage share of each breed in active herd</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
                  {breedComposition.length > 0 ? (
                    <div className="w-full h-full flex flex-col justify-between">
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={breedComposition}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {breedComposition.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                              formatter={(value: any, name: any, props: any) => [`${value} cows (${props.payload.percentage}%)`, name]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-[100px] overflow-y-auto pr-1">
                        {breedComposition.map((bc, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold">
                            <span className="h-2 w-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-slate-650 truncate" title={bc.name}>{bc.name} ({bc.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs font-semibold py-8">No breed composition data.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gender Ratio & Acquisition Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-100 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Gender Ratio Breakdown (ភេទ)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {genderComposition.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-xs font-bold text-slate-800">{g.name}</span>
                    <span className="text-xs font-black text-emerald-600">{g.value} Head ({g.percentage}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-100 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Acquisition Methods (របៀបទិញ/ចូល)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {acquisitionComposition.map((ac, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-xs font-bold text-slate-800">{ac.name}</span>
                    <span className="text-xs font-black text-slate-900">{ac.value} Head ({ac.percentage}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. Fattening & ADG Growth */}
      {subTab === 'batches' && (
        <div className="space-y-6">
          <Card className="bg-white border border-slate-100 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600" />
                Fattening Herd ADG Performance & Feed Efficiency
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">Average daily gain (ADG kg/day) and daily ration cost per head across active batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pl-3">Batch Info</th>
                      <th className="pb-3">Program Type</th>
                      <th className="pb-3 text-center">Headcount</th>
                      <th className="pb-3">Avg Weight</th>
                      <th className="pb-3">ADG (kg/day)</th>
                      <th className="pb-3">Daily Feed Cost / Head</th>
                      <th className="pb-3 text-right pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchAnalytics.map((ba, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="py-4 pl-3">
                          <p className="font-bold text-slate-800">{ba.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{ba.code}</p>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px]">
                            {ba.type}
                          </span>
                        </td>
                        <td className="py-4 text-center font-bold text-slate-800">{ba.count} Head</td>
                        <td className="py-4 font-bold text-slate-800">{ba['Avg Weight (kg)']} kg</td>
                        <td className="py-4 font-extrabold text-emerald-600">
                          {ba['ADG (kg/day)']} kg/day
                        </td>
                        <td className="py-4 font-bold text-slate-800">
                          ៛ {ba.dailyFeedCostPerHead.toLocaleString()} / head / day
                        </td>
                        <td className="py-4 text-right pr-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            ba.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {ba.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. Health & Vet Analytics */}
      {subTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border border-slate-100 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Active Herd Health Condition Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthComposition.map((hc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                    <span>{hc.name} Condition</span>
                    <span className="text-slate-900">{hc.value} Head ({hc.percentage}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-100 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Health Log History ({data.healthLogs?.length || 0} Records)</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto space-y-2 text-xs">
                {data.healthLogs && data.healthLogs.length > 0 ? (
                  data.healthLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Cow ID: {log.cowId} • {log.name}</p>
                        <p className="text-[10px] text-slate-400">{log.type} ({log.date ? new Date(log.date).toLocaleDateString() : 'N/A'})</p>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600">៛ {(log.cost || 0).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-semibold py-8 text-center">No medical health logs recorded.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 5. Financials & Sales BI */}
      {subTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Operating Expense Breakdown Pie Chart */}
            <div className="lg:col-span-1">
              <Card className="bg-white border border-slate-100 shadow-xs h-full">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-800">Operational Cost Allocation</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Total expense amounts grouped by category</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] relative">
                  {expenseBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          formatter={(val: any) => val ? `៛ ${Number(val).toLocaleString()}` : '៛ 0'}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">No costs logged.</div>
                  )}
                  <div className="mt-4 space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {expenseBreakdown.map((eb, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-slate-600">{eb.name}</span>
                        </div>
                        <span className="text-slate-900">៛ {eb.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Sales Ledger */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-slate-100 shadow-xs h-full">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-600" />
                    Historical Cattle Sales Ledger ({data.salesTracking.length} Transactions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[360px] overflow-y-auto">
                  <div className="space-y-2">
                    {data.salesTracking.map((s, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold">
                        <div>
                          <p className="font-bold text-slate-800">Cow ID: {s.cowId} • {s.breed}</p>
                          <p className="text-[10px] text-slate-400">{s.salesDate ? new Date(s.salesDate).toLocaleDateString() : 'N/A'} • {s.weight} kg @ ៛ {s.unitPrice.toLocaleString()}/kg</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-emerald-600">៛ {s.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {data.salesTracking.length === 0 && (
                      <p className="text-center py-10 text-xs text-slate-400 font-bold">No sales records found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
