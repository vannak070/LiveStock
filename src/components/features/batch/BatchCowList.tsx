import React from 'react';
import { StockItem } from '@/types';
import { User, Trash2 } from 'lucide-react';

interface BatchCowListProps {
  cows: StockItem[];
  onRemoveCow?: (cowId: string) => void;
}

export const BatchCowList: React.FC<BatchCowListProps> = ({ cows, onRemoveCow }) => {
  if (cows.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-900/40 rounded-xl border border-dashed border-stone-800 text-stone-500">
        No cattle currently assigned to this batch.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-stone-300">
        <thead className="text-xs uppercase bg-stone-900/80 text-stone-400 border-b border-stone-800">
          <tr>
            <th className="py-3 px-4">Cow ID</th>
            <th className="py-3 px-4">Breed</th>
            <th className="py-3 px-4">Sex</th>
            <th className="py-3 px-4">Weight (kg)</th>
            <th className="py-3 px-4">Health Status</th>
            <th className="py-3 px-4">Status</th>
            {onRemoveCow && <th className="py-3 px-4 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-800/60">
          {cows.map(cow => (
            <tr key={cow.id} className="hover:bg-stone-800/30 transition-colors">
              <td className="py-3 px-4 font-mono text-emerald-400 font-medium">{cow.id}</td>
              <td className="py-3 px-4">{cow.breed}</td>
              <td className="py-3 px-4">{cow.sex}</td>
              <td className="py-3 px-4 font-semibold text-stone-100">{cow.weight}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {cow.healthStatus}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  cow.status.toLowerCase() === 'active' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}>
                  {cow.status}
                </span>
              </td>
              {onRemoveCow && (
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onRemoveCow(cow.id)}
                    className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove cow from batch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
