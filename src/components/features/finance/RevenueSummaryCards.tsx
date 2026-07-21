import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

interface RevenueSummaryCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  marginPercentage: number;
}

export const RevenueSummaryCards: React.FC<RevenueSummaryCardsProps> = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  marginPercentage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Sales Revenue</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-stone-100">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Operating Expenses */}
      <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Operating Expenses</span>
          <CreditCard className="w-4 h-4 text-rose-400" />
        </div>
        <p className="text-2xl font-bold text-rose-400">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Net Profit */}
      <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Net Estimated Profit</span>
          {netProfit >= 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-400" />
          )}
        </div>
        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Profit Margin */}
      <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-xl">
        <div className="flex items-center justify-between text-stone-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Profit Margin</span>
          <span className="text-xs font-mono text-emerald-400">%</span>
        </div>
        <p className="text-2xl font-bold text-stone-100">{marginPercentage.toFixed(1)}%</p>
      </div>
    </div>
  );
};
