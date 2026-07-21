'use client';

import React, { useState } from 'react';
import { ERPLivestockData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, Activity, Scale, ShoppingBag } from 'lucide-react';

interface AnalyticsTabProps {
  data: ERPLivestockData;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function AnalyticsTab({ data }: AnalyticsTabProps) {
  const [subTab, setSubTab] = useState<'performance' | 'batches' | 'financial' | 'sales'>('performance');

  // Compute weight statistics by breed
  const breedPerformance = React.useMemo(() => {
    const map: Record<string, { totalWeight: number; count: number; maxWeight: number }> = {};
    data.stock.forEach(cow => {
      if (cow.status.toLowerCase() !== 'active') return;
      if (!map[cow.breed]) {
        map[cow.breed] = { totalWeight: 0, count: 0, maxWeight: 0 };
      }
      map[cow.breed].totalWeight += cow.weight;
      map[cow.breed].count += 1;
      if (cow.weight > map[cow.breed].maxWeight) {
        map[cow.breed].maxWeight = cow.weight;
      }
    });

    return Object.entries(map).map(([breed, stats]) => ({
      name: breed,
      'Avg Weight (kg)': Math.round(stats.totalWeight / stats.count),
      'Max Weight (kg)': stats.maxWeight,
      count: stats.count
    }));
  }, [data.stock]);

  // Compute breed composition for Pie Chart
  const breedComposition = React.useMemo(() => {
    const map: Record<string, number> = {};
    let activeTotal = 0;
    data.stock.forEach(cow => {
      if (cow.status.toLowerCase() !== 'active') return;
      map[cow.breed] = (map[cow.breed] || 0) + 1;
      activeTotal++;
    });
    return Object.entries(map).map(([breed, count]) => ({
      name: breed,
      value: count,
      percentage: activeTotal > 0 ? Math.round((count / activeTotal) * 100) : 0
    }));
  }, [data.stock]);

  // Compute health status composition for Pie Chart
  const healthComposition = React.useMemo(() => {
    const map: Record<string, number> = {};
    let activeTotal = 0;
    data.stock.forEach(cow => {
      if (cow.status.toLowerCase() !== 'active') return;
      map[cow.healthStatus] = (map[cow.healthStatus] || 0) + 1;
      activeTotal++;
    });
    return Object.entries(map).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: activeTotal > 0 ? Math.round((count / activeTotal) * 100) : 0
    }));
  }, [data.stock]);

  // Compute batch statistics
  const batchAnalytics = React.useMemo(() => {
    return data.batches.map(batch => {
      const cowsInBatch = data.stock.filter(c => batch.cowIds.includes(c.id));
      const activeCows = cowsInBatch.filter(c => c.status.toLowerCase() === 'active');
      const avgWeight = activeCows.length > 0
        ? Math.round(activeCows.reduce((sum, c) => sum + c.weight, 0) / activeCows.length)
        : 0;

      const poorHealthCount = activeCows.filter(c => c.healthStatus.toLowerCase() === 'poor').length;
      const statusPercentage = activeCows.length > 0
        ? Math.round(((activeCows.length - poorHealthCount) / activeCows.length) * 100)
        : 100;

      return {
        name: batch.name,
        code: batch.id,
        type: batch.type,
        count: cowsInBatch.length,
        'Avg Weight (kg)': avgWeight,
        'Health Rate (%)': statusPercentage,
        status: batch.status
      };
    });
  }, [data.batches, data.stock]);

  // Compute monthly financials (Revenue vs Expenses)
  const financialMonthly = React.useMemo(() => {
    // Collect from expenses
    const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};

    data.expenses.forEach(exp => {
      const month = exp.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[month]) {
        monthlyMap[month] = { revenue: 0, expenses: 0 };
      }
      monthlyMap[month].expenses += exp.amount;
    });

    // Collect from sales
    data.salesTracking.forEach(sale => {
      const month = sale.salesDate ? sale.salesDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
      if (!monthlyMap[month]) {
        monthlyMap[month] = { revenue: 0, expenses: 0 };
      }
      monthlyMap[month].revenue += sale.totalPrice;
    });

    // Format for charts
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

  // Expense breakdown pie chart data
  const expenseBreakdown = React.useMemo(() => {
    const map: Record<string, number> = {};
    data.expenses.forEach(exp => {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
  }, [data.expenses]);

  // Sales specific analytics
  const { totalSalesRevenue, totalCowsSold, averageSalePrice, salesChartData } = React.useMemo(() => {
    const totalSalesRevenue = data.salesTracking.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const totalCowsSold = data.salesTracking.length;
    const averageSalePrice = totalCowsSold > 0 ? Math.round(totalSalesRevenue / totalCowsSold) : 0;

    const map: Record<string, number> = {};
    data.salesTracking.forEach(s => {
      if (s.salesDate) {
        const dateStr = new Date(s.salesDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        map[dateStr] = (map[dateStr] || 0) + s.totalPrice;
      }
    });

    const salesChartData = Object.entries(map).map(([date, revenue]) => ({
      date,
      Revenue: revenue
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { totalSalesRevenue, totalCowsSold, averageSalePrice, salesChartData };
  }, [data.salesTracking]);

  return (
    <div className="space-y-6">
      {/* Subtab selection headers */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab('performance')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors ${
            subTab === 'performance'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Scale className="h-4 w-4" />
          Herd Performance
        </button>
        <button
          onClick={() => setSubTab('batches')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors ${
            subTab === 'batches'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Batch Reports
        </button>
        <button
          onClick={() => setSubTab('financial')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors ${
            subTab === 'financial'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Financial Reports
        </button>
        <button
          onClick={() => setSubTab('sales')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-black text-xs uppercase tracking-wider transition-colors ${
            subTab === 'sales'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Sales Reports
        </button>
      </div>

      {/* Performance reports view */}
      {subTab === 'performance' && (
        <div className="space-y-6">
          {/* Row 1: Breed Performance & Breed Composition Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white border border-slate-100 shadow-sm">
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

            <div className="lg:col-span-1">
              <Card className="bg-white border border-slate-100 shadow-sm h-full flex flex-col justify-between">
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
                      {/* Interactive Legend with indicators */}
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

          {/* Row 2: Census Detail List & Health Breakdown Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-white border border-slate-100 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-800">Livestock Census Breakdown</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Total active cows grouped by breed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {breedPerformance.map((bp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/65 border border-slate-100/50 rounded-xl">
                      <div>
                        <p className="text-xs font-black text-slate-800">{bp.name}</p>
                        <p className="text-[9px] text-slate-450 mt-0.5">Avg: {bp['Avg Weight (kg)']} kg • Max: {bp['Max Weight (kg)']} kg</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">
                          {bp.count} Head
                        </span>
                      </div>
                    </div>
                  ))}
                  {breedPerformance.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-450 font-bold">No registered cows found in inventory.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-white border border-slate-100 shadow-sm h-full flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-800">Active Herd Health Status (ស្ថានភាពសុខភាពហ្វូងគោ)</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Distribution of active cattle by health condition</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 py-4">
                  {healthComposition.length > 0 ? (
                    <>
                      <div className="h-[180px] w-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={healthComposition}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {healthComposition.map((entry, index) => {
                                const healthColors: Record<string, string> = {
                                  Good: '#10B981',
                                  Fair: '#F59E0B',
                                  Poor: '#EF4444',
                                  Dead: '#64748B'
                                };
                                return <Cell key={`cell-${index}`} fill={healthColors[entry.name] || COLORS[index % COLORS.length]} />;
                              })}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                              formatter={(value: any, name: any, props: any) => [`${value} cows (${props.payload.percentage}%)`, name]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Health breakdown indicators list */}
                      <div className="flex-1 space-y-2.5 w-full">
                        {healthComposition.map((hc, idx) => {
                          const healthColors: Record<string, string> = {
                            Good: '#10B981',
                            Fair: '#F59E0B',
                            Poor: '#EF4444',
                            Dead: '#64748B'
                          };
                          const color = healthColors[hc.name] || COLORS[idx % COLORS.length];
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <span className="h-3 w-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
                                <span>{hc.name} Condition</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-slate-800">{hc.value} head</span>
                                <span className="text-[10px] text-slate-450 ml-1.5 font-bold">({hc.percentage}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-xs font-semibold py-8 w-full text-center">No active cattle health indicators found.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Batch Reports View */}
      {subTab === 'batches' && (
        <div className="space-y-6">
          <Card className="bg-white border border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800">Batch Health & Weight Metrics</CardTitle>
              <CardDescription className="text-xs text-slate-400">Performance indexes tracking each active/closed batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pl-3">Batch Info</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3 text-center">Cattle Headcount</th>
                      <th className="pb-3">Avg Weight</th>
                      <th className="pb-3">Herd Health Score</th>
                      <th className="pb-3 text-right pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchAnalytics.map((ba, idx) => (
                      <tr key={idx} className="text-xs hover:bg-slate-50/40">
                        <td className="py-4 pl-3">
                          <p className="font-bold text-slate-800">{ba.name}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">{ba.code}</p>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px]">
                            {ba.type}
                          </span>
                        </td>
                        <td className="py-4 text-center font-bold text-slate-800">{ba.count} Head</td>
                        <td className="py-4 font-bold text-slate-800">{ba['Avg Weight (kg)']} kg</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${ba['Health Rate (%)'] < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${ba['Health Rate (%)']}%` }}
                              />
                            </div>
                            <span className="font-extrabold text-[10px] text-slate-600">{ba['Health Rate (%)']}%</span>
                          </div>
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
                    {batchAnalytics.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-xs text-slate-450 font-bold">No batches recorded in setup.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Reports View */}
      {subTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-800">Monthly Revenue vs Expenses P&L</CardTitle>
                <CardDescription className="text-xs text-slate-450">Track cash inflow and feed/medical expenses month over month</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {financialMonthly.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
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

          <div className="lg:col-span-1">
            <Card className="bg-white border border-slate-100 shadow-sm h-full">
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
                {/* Legend summary below chart */}
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
        </div>
      )}

      {/* Sales Reports View */}
      {subTab === 'sales' && (
        <div className="space-y-6">
          {/* Mini Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                <h4 className="text-2xl font-black text-emerald-600 mt-1.5">៛ {totalSalesRevenue.toLocaleString()}</h4>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cows Sold</p>
                <h4 className="text-2xl font-black text-slate-900 mt-1.5">{totalCowsSold} head</h4>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Unit Value</p>
                <h4 className="text-2xl font-black text-slate-900 mt-1.5">៛ {averageSalePrice.toLocaleString()}</h4>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-sm">
              <div>
                <h4 className="text-base font-bold text-slate-800">Revenue Performance Over Time</h4>
                <p className="text-xs text-slate-400">Gross sales tracked by transaction date</p>
              </div>
              <div className="h-[260px]">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        labelStyle={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#059669', fontSize: '13px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Revenue" fill="url(#salesGrad)" radius={[6, 6, 0, 0]} name="Sales (៛)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">
                    No transaction data available.
                  </div>
                )}
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col">
              <div>
                <h4 className="text-base font-bold text-slate-800">Recent Transactions</h4>
                <p className="text-xs text-slate-400">Historical records of closed sales</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[260px] pr-2">
                {data.salesTracking.length > 0 ? (
                  data.salesTracking.map((s, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors px-1 rounded-lg font-medium">
                      <div>
                        <p className="font-bold text-slate-800">Cow ID: {s.cowId}</p>
                        <p className="text-slate-400 font-medium">
                          {s.salesDate ? new Date(s.salesDate).toLocaleDateString() : 'N/A'} • {s.breed}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-emerald-600">៛ {s.totalPrice.toLocaleString()}</p>
                        <p className="text-slate-400 font-mono font-semibold">{s.weight} kg @ ៛ {s.unitPrice.toLocaleString()}/kg</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                    No recent sales.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
