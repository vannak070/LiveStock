import React from 'react';
import { BatchItem, StockItem } from '@/types';
import { Layers, Calendar, ChevronRight } from 'lucide-react';

interface BatchCardProps {
  batch: BatchItem;
  assignedCows: StockItem[];
  isSelected: boolean;
  onSelect: (batch: BatchItem) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch, assignedCows, isSelected, onSelect }) => {
  const activeCount = assignedCows.filter(c => c.status.toLowerCase() === 'active').length;

  return (
    <div
      onClick={() => onSelect(batch)}
      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
          : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-stone-800/80 rounded-xl text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-100 text-lg">{batch.name}</h3>
            <p className="text-xs text-stone-400 font-mono">{batch.id}</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            batch.status === 'Active'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-stone-800 text-stone-400 border border-stone-700'
          }`}
        >
          {batch.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-stone-800/60 text-xs">
        <div>
          <p className="text-stone-500">Cattle Headcount</p>
          <p className="text-stone-200 font-semibold text-sm">{activeCount} / {assignedCows.length} Active</p>
        </div>
        <div>
          <p className="text-stone-500">Program Type</p>
          <p className="text-stone-200 font-medium">{batch.type}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800/40">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          {batch.startDate}
        </span>
        <span className="flex items-center text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
          Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </div>
  );
};
