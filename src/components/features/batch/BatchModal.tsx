import React, { useState, useEffect } from 'react';
import { BatchItem, StockItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers, CheckCircle2, UserPlus, Edit2 } from 'lucide-react';

import { FarmItem } from '@/lib/types';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batch: Omit<BatchItem, 'cowIds'>, initialCowIds: string[]) => Promise<void>;
  unassignedCows: StockItem[];
  batchTypes?: string[];
  initialBatch?: BatchItem | null;
  currentUser?: any;
  farms?: FarmItem[];
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  unassignedCows,
  batchTypes = ['Fattening Program', 'Quanrantin & Vet Card', 'Selling Pool', 'Breeding Program'],
  initialBatch = null,
  currentUser,
  farms = []
}) => {
  const isEditMode = !!initialBatch;

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Fattening Program');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Active' | 'Closed'>('Active');
  const [farmLocation, setFarmLocation] = useState(currentUser?.farmLocation || '');
  const [notes, setNotes] = useState('');
  const [selectedCowIds, setSelectedCowIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialBatch) {
        setId(initialBatch.id);
        setName(initialBatch.name);
        setType(initialBatch.type || 'Fattening Program');
        setStartDate(initialBatch.startDate ? initialBatch.startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
        setStatus(initialBatch.status || 'Active');
        setFarmLocation(initialBatch.farmLocation || currentUser?.farmLocation || (farms.length > 0 ? farms[0].name : ''));
        setNotes(initialBatch.notes || '');
        setSelectedCowIds([]);
      } else {
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        setId(`BAT-${new Date().getFullYear()}-${randomSuffix}`);
        setName('ហ្វូងបំប៉នថ្មី (New Fattening Herd)');
        setType('Fattening Program');
        setStartDate(new Date().toISOString().split('T')[0]);
        setStatus('Active');
        setFarmLocation(currentUser?.farmLocation || (farms.length > 0 ? farms[0].name : ''));
        setNotes('');
        setSelectedCowIds([]);
      }
    }
  }, [isOpen, initialBatch, currentUser, farms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const defaultFeeding = {
        ingredients: [
          { name: "ចំណីសំរេច (DSR-16)", portionPerHead: 3.5, unitCost: 2000 },
          { name: "ស្មៅ ឬ ពោត ផ្អាប់", portionPerHead: 15.0, unitCost: 350 },
          { name: "ចំបើង", portionPerHead: 2.0, unitCost: 150 }
        ],
        frequency: 'Twice Daily',
        startDate: startDate,
        status: 'Active' as const,
        notes: 'Default fattening ration.'
      };

      const finalId = id.trim() || `BAT-${Date.now().toString(36).toUpperCase()}`;
      await onSubmit({
        id: finalId,
        name: name.trim(),
        type,
        startDate,
        status,
        notes,
        farmLocation: farmLocation || initialBatch?.farmLocation || currentUser?.farmLocation || undefined,
        feedingProgram: initialBatch?.feedingProgram || (type === 'Fattening Program' ? defaultFeeding : undefined)
      }, selectedCowIds);

      onClose();
    } catch (error) {
      console.error('Failed to save batch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCowSelect = (cowId: string) => {
    setSelectedCowIds(prev =>
      prev.includes(cowId) ? prev.filter(c => c !== cowId) : [...prev, cowId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit2 className="h-5 w-5 text-emerald-600" />
                Edit Batch Details
              </>
            ) : (
              <>
                <Layers className="h-5 w-5 text-emerald-600" />
                Create New Batch
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEditMode
              ? `Edit batch details and farm location for ${initialBatch.id}`
              : 'Specify batch details, farm location, start date, and enroll cattle immediately.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="batch_id" className="text-xs font-bold text-slate-700">Batch Code</Label>
              <Input
                id="batch_id"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="e.g. FAT-2026-01"
                required
                disabled={isEditMode}
                className="font-mono text-xs disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="batch_name" className="text-xs font-bold text-slate-700">Batch Name</Label>
              <Input
                id="batch_name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Fattening Batch A"
                required
                className="text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label htmlFor="batch_farm" className="text-xs font-bold text-slate-700">Farm Location</Label>
              <select
                id="batch_farm"
                value={farmLocation}
                onChange={e => setFarmLocation(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                required
              >
                <option value="">-- Select Farm --</option>
                {farms.map(f => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="batch_type" className="text-xs font-bold text-slate-700">Program Type</Label>
              <select
                id="batch_type"
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {batchTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="batch_start_date" className="text-xs font-bold text-slate-700">Start Date</Label>
              <Input
                type="date"
                id="batch_start_date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="batch_status" className="text-xs font-bold text-slate-700">Status</Label>
              <select
                id="batch_status"
                value={status}
                onChange={e => setStatus(e.target.value as 'Active' | 'Closed')}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="batch_notes" className="text-xs font-bold text-slate-700">Notes / Remark</Label>
            <Input
              id="batch_notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ព័ត៌មានបន្ថែមអំពីក្រុមគោនេះ..."
              className="text-xs"
            />
          </div>

          {/* Initial Cows Selection (Only in Create Mode) */}
          {!isEditMode && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  ជ្រើសរើសគោបញ្ចូលក្រុមដំបូង ({selectedCowIds.length} Selected)
                </Label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {unassignedCows.length} Available Cows
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-xl bg-slate-50/50">
                {unassignedCows.length > 0 ? (
                  unassignedCows.map(cow => {
                    const isChecked = selectedCowIds.includes(cow.id);
                    return (
                      <div
                        key={cow.id}
                        onClick={() => toggleCowSelect(cow.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-black text-slate-800">{cow.id}</span>
                          <span className="ml-2 text-slate-500">{cow.breed} • {cow.weight} kg</span>
                        </div>
                        {isChecked && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-center text-slate-400 py-6 font-medium">
                    គ្មានគោទំនេរដាច់ដោយឡែកក្នុងស្តុកឡើយ។
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl px-6"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? '💾 រក្សាទុក (Save Changes)' : '💾 បង្កើតក្រុម (Create Batch)'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
