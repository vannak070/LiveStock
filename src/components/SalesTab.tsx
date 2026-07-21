'use client';

import React from 'react';
import { SalesRecord } from '@/lib/xlsx-parser';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

interface SalesTabProps {
  sales: SalesRecord[];
}

export default function SalesTab({ sales }: SalesTabProps) {
  // Stats
  const totalSalesRevenue = sales.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalCowsSold = sales.length;
  const averageSalePrice = totalCowsSold > 0 ? Math.round(totalSalesRevenue / totalCowsSold) : 0;
  
  // Aggregate sales by date for charts
  const salesByDateMap: { [key: string]: number } = {};
  sales.forEach(s => {
    if (s.salesDate) {
      const dateStr = new Date(s.salesDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      salesByDateMap[dateStr] = (salesByDateMap[dateStr] || 0) + s.totalPrice;
    }
  });

  const chartData = Object.entries(salesByDateMap).map(([date, revenue]) => ({
    date,
    Revenue: revenue
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
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
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
            {sales.length > 0 ? (
              sales.map((s, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors px-1 rounded-lg">
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
  );
}
