'use client';

import React from 'react';
import { ERPLivestockData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Activity, ShieldAlert, Award, Calendar, DollarSign, Users, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardHomeProps {
  data: ERPLivestockData;
  onNavigateToTab: (tab: any) => void;
}

export default function DashboardHome({ data, onNavigateToTab }: DashboardHomeProps) {
  const activeCows = data.stock.filter(c => c.status.toLowerCase() === 'active');
  const healthyCount = activeCows.filter(c => c.healthStatus.toLowerCase() === 'good').length;
  const healthyPercentage = activeCows.length > 0 ? Math.round((healthyCount / activeCows.length) * 100) : 100;
  
  const sickCows = activeCows.filter(c => c.healthStatus.toLowerCase() === 'poor' || c.healthStatus.toLowerCase() === 'fair');
  const criticalCount = activeCows.filter(c => c.healthStatus.toLowerCase() === 'dead').length; // historical deaths recorded

  // Recent additions
  const recentCows = [...data.stock]
    .sort((a, b) => {
      const timeA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
      const timeB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  // Recent sales
  const recentSales = [...data.salesTracking]
    .sort((a, b) => {
      const timeA = a.salesDate ? new Date(a.salesDate).getTime() : 0;
      const timeB = b.salesDate ? new Date(b.salesDate).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  // Growth performance data for chart
  const weightGainHistory = data.weightTracking.slice(-15).map((w, idx) => ({
    name: w.cowId,
    growth: Math.round(w.gainLoss * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Upper Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Livestock</CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 mt-1">{data.stock.length} Head</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-emerald-600 font-bold">Active: {activeCows.length} • Sold: {data.stock.length - activeCows.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400">Fattening Cohorts</CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 mt-1">{data.batches.filter(b => b.status === 'Active').length} Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <button onClick={() => onNavigateToTab('batch-management')} className="text-[10px] text-emerald-600 hover:underline font-bold">Fattening Program &rarr;</button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400">Herd Health Score</CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600 mt-1">{healthyPercentage}% Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400 font-bold">{healthyCount} of {activeCows.length} active head</p>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm ${sickCows.length > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400">Medical Alerts</CardDescription>
            <CardTitle className={`text-2xl font-black mt-1 ${sickCows.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {sickCows.length} Sick Cow{sickCows.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sickCows.length > 0 ? (
              <button onClick={() => onNavigateToTab('health-tracking')} className="text-[10px] text-rose-500 hover:underline font-bold animate-pulse">View Alerts &rarr;</button>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold">No active veterinarian alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Analytics Charts */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-base font-bold text-slate-800">Development Weight Growth (%)</h4>
            <p className="text-xs text-slate-400">Performance percentage gains logged across recent updates</p>
          </div>
          <div className="h-[250px]">
            {weightGainHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightGainHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                    itemStyle={{ color: '#059669', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2.5} name="Growth %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No growth updates captured.
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Vaccinations */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-base font-bold text-slate-800">Upcoming Vaccination Scheduler</h4>
            <p className="text-xs text-slate-400">Schedule alerts for operational veterinarians</p>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3">
              <Calendar className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Foot and Mouth Disease Shot</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Due in 2 days • Cohort B</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3 opacity-75">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Brucellosis Vet Check</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Due in 1 week • Cohort A</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lists of Recent Additions & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recently Registered */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recently Registered Livestock</h4>
          <div className="divide-y divide-slate-100">
            {recentCows.map((c, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    {c.id.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{c.id}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{c.breed} • {c.sex}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-850">៛ {c.totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Acquired: {c.purchaseDate ? new Date(c.purchaseDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recently Sold */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recently Finalized Sales</h4>
          <div className="divide-y divide-slate-100">
            {recentSales.length > 0 ? (
              recentSales.map((s, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      {s.cowId.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.cowId}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.breed} • {s.weight} kg</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-emerald-600">៛ {s.totalPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Sold: {s.salesDate ? new Date(s.salesDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10 font-bold">No sales records logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
