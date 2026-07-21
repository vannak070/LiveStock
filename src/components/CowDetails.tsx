'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { StockItem, WeightRecord, SalesRecord } from '@/lib/xlsx-parser';
import { HealthLogItem } from '@/lib/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Calendar, User, MapPin, Phone, DollarSign, Scale, Activity, FileText, Heart, ShieldAlert, Zap, Layers } from 'lucide-react';

interface CowDetailsProps {
  cowId: string | null;
  isOpen: boolean;
  onClose: () => void;
  stock: StockItem[];
  weightTracking: WeightRecord[];
  salesTracking: SalesRecord[];
  healthLogs: HealthLogItem[];
}

export default function CowDetails({
  cowId,
  isOpen,
  onClose,
  stock,
  weightTracking,
  salesTracking,
  healthLogs
}: CowDetailsProps) {
  if (!cowId) return null;

  const cow = stock.find(c => c.id === cowId);
  if (!cow) return null;

  // Filter weight records
  const history = weightTracking
    .filter(w => w.cowId === cowId)
    .map((w, idx) => ({
      date: w.trackingDate ? new Date(w.trackingDate).toLocaleDateString() : `Log #${idx + 1}`,
      weight: w.currentWeight,
      rawDate: w.trackingDate ? new Date(w.trackingDate).getTime() : 0,
      health: w.healthStatus
    }))
    .sort((a, b) => a.rawDate - b.rawDate);

  // Filter sales details
  const sale = salesTracking.find(s => s.cowId === cowId);

  // Filter health/medical logs for this cow
  const cowMedicalLogs = healthLogs
    .filter(log => log.cowId === cowId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Dynamic P&L Calculation per Cow
  const purchaseCost = cow.totalPrice || 0;
  const medicalExpenses = cowMedicalLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const totalInvestment = purchaseCost + medicalExpenses;
  const salesRevenue = sale ? sale.totalPrice : 0;
  const netProfitLoss = cow.status === 'Sold' 
    ? salesRevenue - totalInvestment 
    : (cow.status.toLowerCase() === 'dead' ? -totalInvestment : -medicalExpenses); // Unrealized P&L or write-off

  // Dynamic Feed Program recommendation based on weight
  const dailyFeedIntake = Math.round(cow.weight * 0.025); // 2.5% of body weight
  const silageRatio = Math.round(dailyFeedIntake * 0.7); // 70% silage
  const concentrateRatio = Math.round(dailyFeedIntake * 0.3); // 30% concentrate

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-white border border-slate-100 text-slate-800 rounded-2xl shadow-xl p-6">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">{cow.id}</span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                  cow.status.toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : cow.status.toLowerCase() === 'dead'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {cow.status}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
                  {cow.breed}
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-450 mt-1.5 font-semibold">
                Herd Registry record • Registered on {cow.purchaseDate ? new Date(cow.purchaseDate).toLocaleDateString() : 'N/A'}
              </DialogDescription>
            </div>
            {cow.status === 'Sold' && sale && (
              <div className="bg-emerald-50 border border-emerald-150 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 block animate-pulse" />
                Sold for <span className="text-emerald-700 font-black">៛ {sale.totalPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Outer ERP grid modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          {/* Column 1: Specs & origin (Left) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Spec Card */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Biological Profile</h4>
              <div className="bg-slate-50/70 border border-slate-250/20 p-4 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <Scale className="h-4.5 w-4.5 text-slate-400" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Current Weight</p>
                    <p className="text-xs font-black text-slate-800">{cow.weight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-4.5 w-4.5 text-slate-400" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Herd Health State</p>
                    <p className="text-xs font-black text-slate-800">{cow.healthStatus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Source Supplier</p>
                    <p className="text-xs font-black text-slate-800">{cow.ownerName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4.5 w-4.5 text-slate-400" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Barn / Location</p>
                    <p className="text-xs font-black text-slate-800">{cow.location || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5 text-slate-400" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Contact Phone</p>
                    <p className="text-xs font-black text-slate-800 font-mono">{cow.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insemination/Breeding Panel for Females */}
            {(cow.sex === 'Female' || cow.sex === 'F') && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Breeding & Pregnancy</h4>
                <div className="bg-rose-50/20 border border-rose-100/60 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Reproductive Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-extrabold text-[10px]">
                      Open / Ready
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-450 leading-relaxed font-medium">
                    No active insemination or gestation period logs found. Register breeding check events in settings.
                  </div>
                </div>
              </div>
            )}

            {/* Feeding Program Program */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nutrition Program</h4>
              <div className="bg-emerald-50/20 border border-emerald-100/50 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Daily Intake Target:</span>
                  <span className="font-bold text-emerald-800">{dailyFeedIntake} kg/day</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 mt-2">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-slate-400 uppercase">Silage Feed</p>
                    <p className="text-sm font-black text-slate-850 mt-0.5">{silageRatio} kg</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-slate-400 uppercase">Concentrate</p>
                    <p className="text-sm font-black text-slate-850 mt-0.5">{concentrateRatio} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Financial Ledger and Weight Charts (Middle) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dynamic Profit & Loss module */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Livestock Financial Ledger (P&L)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Purchase Price</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">៛ {purchaseCost.toLocaleString()}</p>
                  <span className="text-[8px] text-slate-400 uppercase font-black">{cow.buyType} basis</span>
                </div>
                <div className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Medical Costs</p>
                  <p className="text-sm font-black text-rose-500 mt-0.5">៛ {medicalExpenses.toLocaleString()}</p>
                  <span className="text-[8px] text-rose-400 uppercase font-black">{cowMedicalLogs.length} clinics logged</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${
                  netProfitLoss >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Net Profit / Loss</p>
                  <p className={`text-sm font-black mt-0.5 ${netProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ៛ {netProfitLoss.toLocaleString()}
                  </p>
                  <span className={`text-[8px] uppercase font-black ${netProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {cow.status === 'Sold' ? 'Realized P&L' : 'Unrealized asset'}
                  </span>
                </div>
              </div>
            </div>

            {/* Weight curve chart */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Herd Weight Growth Chart</h4>
              <div className="h-[200px] bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px' }}
                        labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#059669', fontSize: '13px', fontWeight: 'bold' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    No weight records found.
                  </div>
                )}
              </div>
            </div>

            {/* Veterinary & Medical Timeline */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Veterinary Timeline Logs</h4>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {cowMedicalLogs.length > 0 ? (
                  cowMedicalLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl flex items-start justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            log.type === 'Vaccination' ? 'bg-emerald-50 text-emerald-700' :
                            log.type === 'Disease' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-bold text-slate-800">{log.name}</span>
                        </div>
                        {log.notes && <p className="text-[10px] text-slate-500 font-semibold mt-1">{log.notes}</p>}
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">By {log.administeredBy} • {new Date(log.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-mono text-[10px] font-black text-slate-700">៛ {log.cost.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-semibold bg-slate-50/50 border border-dashed rounded-xl">
                    No clinical interventions or disease diagnostics logged.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
