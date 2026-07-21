import React from 'react';
import { ExpenseItem } from '@/types';
import { Trash2, Edit2 } from 'lucide-react';

interface ExpenseTableProps {
  expenses: ExpenseItem[];
  onEdit?: (expense: ExpenseItem) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-900/40 rounded-xl border border-dashed border-stone-800 text-stone-500">
        No expense records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-stone-300">
        <thead className="text-xs uppercase bg-stone-900/80 text-stone-400 border-b border-stone-800">
          <tr>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4 text-right">Amount ($)</th>
            {(onEdit || onDelete) && <th className="py-3 px-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-800/60">
          {expenses.map(expense => (
            <tr key={expense.id} className="hover:bg-stone-800/30 transition-colors">
              <td className="py-3 px-4 text-stone-400 text-xs font-mono">{expense.date}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 rounded text-xs bg-stone-800 text-stone-300 border border-stone-700">
                  {expense.category}
                </span>
              </td>
              <td className="py-3 px-4 text-stone-200">{expense.description}</td>
              <td className="py-3 px-4 text-right font-semibold text-rose-400">
                ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              {(onEdit || onDelete) && (
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-stone-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
