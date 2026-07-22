'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building, 
  User, 
  MapPin, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  BarChart2, 
  Compass, 
  Check,
  AlertCircle
} from 'lucide-react';
import { updateSettingsAction } from '@/app/actions';
import { MasterSetup, FarmItem, UserRoleItem, PermissionKey } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ConfirmModal } from './ui/confirm-modal';
import { hasPermission } from '@/lib/utils';

interface FarmsTabProps {
  settings: MasterSetup;
  currentUser: UserRoleItem | null;
  stock: any[];
  batches: any[];
}

export default function FarmsTab({ settings, currentUser, stock, batches }: FarmsTabProps) {
  const queryClient = useQueryClient();
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<FarmItem | null>(null);

  // Form States
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [farmCapacity, setFarmCapacity] = useState<number>(100);
  const [farmOwnerId, setFarmOwnerId] = useState('');
  const [farmManagerId, setFarmManagerId] = useState('');
  const [farmNotes, setFarmNotes] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
    type: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'warning'
  });

  const farms = settings.farms || [];
  const farmOwners = (settings.users || []).filter(u => u.role === 'Farm Owner');
  const farmStaff = (settings.users || []).filter(u => u.role === 'Farm Staff' || u.role === 'Veterinarian');

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: MasterSetup) => {
      const res = await updateSettingsAction(updatedSettings);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const openCreateFarmModal = () => {
    setEditingFarm(null);
    setFarmName('');
    setFarmAddress('');
    setFarmCapacity(100);
    setFarmOwnerId('');
    setFarmManagerId('');
    setFarmNotes('');
    setIsAddingFarm(true);
  };

  const openEditFarmModal = (farm: FarmItem) => {
    setEditingFarm(farm);
    setFarmName(farm.name);
    setFarmAddress(farm.address || '');
    setFarmCapacity(farm.capacity || 100);
    setFarmOwnerId(farm.ownerId || '');
    setFarmManagerId(farm.managerId || '');
    setFarmNotes(farm.notes || '');
    setIsAddingFarm(true);
  };

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    let updatedFarms = [...farms];
    let updatedLocations = [...(settings.locations || [])];
    let updatedUsers = [...(settings.users || [])];

    if (editingFarm) {
      const oldName = editingFarm.name;
      const newName = farmName.trim();

      updatedFarms = updatedFarms.map(f => f.id === editingFarm.id ? {
        ...f,
        name: newName,
        address: farmAddress.trim(),
        capacity: farmCapacity,
        ownerId: farmOwnerId || undefined,
        managerId: farmManagerId || undefined,
        notes: farmNotes.trim()
      } : f);

      // Sync Location names
      updatedLocations = updatedLocations.map(loc => loc === oldName ? newName : loc);
      if (!updatedLocations.includes(newName)) {
        updatedLocations.push(newName);
      }

      // Sync User location scopes
      updatedUsers = updatedUsers.map(u => {
        let updatedLoc = u.farmLocation;
        if (u.farmLocation === oldName) {
          updatedLoc = newName;
        }
        // If owner selected in form, bind user location
        if (u.id === farmOwnerId) {
          updatedLoc = newName;
        }
        return { ...u, farmLocation: updatedLoc };
      });

    } else {
      const newName = farmName.trim();
      const newFarm: FarmItem = {
        id: `FARM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: newName,
        address: farmAddress.trim(),
        capacity: farmCapacity,
        ownerId: farmOwnerId || undefined,
        managerId: farmManagerId || undefined,
        notes: farmNotes.trim()
      };

      updatedFarms.push(newFarm);

      // Add Location name
      if (!updatedLocations.includes(newName)) {
        updatedLocations.push(newName);
      }

      // Bind location to owner/manager
      updatedUsers = updatedUsers.map(u => {
        if (u.id === farmOwnerId || u.id === farmManagerId) {
          return { ...u, farmLocation: newName };
        }
        return u;
      });
    }

    const updatedSettings: MasterSetup = {
      ...settings,
      farms: updatedFarms,
      locations: updatedLocations,
      users: updatedUsers
    };

    updateSettingsMutation.mutate(updatedSettings);
    setIsAddingFarm(false);
  };

  const handleDeleteFarm = (farmId: string) => {
    const target = farms.find(f => f.id === farmId);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Farm Branch?',
      description: `Are you sure you want to delete the farm "${target.name}"? Active cows and staff assigned to this farm will have their location scopes unassigned.`,
      type: 'danger',
      confirmText: 'Delete Farm',
      onConfirm: () => {
        const updatedFarms = farms.filter(f => f.id !== farmId);
        const updatedLocations = (settings.locations || []).filter(loc => loc !== target.name);
        const updatedUsers = (settings.users || []).map(u => {
          if (u.farmLocation === target.name) {
            return { ...u, farmLocation: undefined };
          }
          return u;
        });

        const updatedSettings: MasterSetup = {
          ...settings,
          farms: updatedFarms,
          locations: updatedLocations,
          users: updatedUsers
        };

        updateSettingsMutation.mutate(updatedSettings);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-emerald-600" />
            Farm Locations & Branches Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, update, and manage locations, capacities, farm owners, and operational parameters.
          </p>
        </div>
        <button
          onClick={openCreateFarmModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Add Farm Branch
        </button>
      </div>

      {/* Farms List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {farms.map(farm => {
          // Calculate herd stats
          const farmCows = stock.filter(c => c.location === farm.name && c.status.toLowerCase() === 'active');
          const cowCount = farmCows.length;
          const capacity = farm.capacity || 100;
          const occupancyRate = Math.min(Math.round((cowCount / capacity) * 100), 100);

          // Find Owner and Staff details
          const owner = settings.users.find(u => u.id === farm.ownerId || (u.role === 'Farm Owner' && u.farmLocation === farm.name));
          const manager = settings.users.find(u => u.id === farm.managerId);
          const staffCount = settings.users.filter(u => u.farmLocation === farm.name && u.role !== 'Farm Owner').length;
          
          // Calculate active feeding batches
          const activeBatches = batches.filter(b => b.status === 'Active' && farmCows.some(c => c.id === b.id || c.batchId === b.id)).length;

          return (
            <div 
              key={farm.id} 
              className="bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
            >
              {/* Header Accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 to-teal-500" />

              <div className="p-6 space-y-5 flex-1">
                {/* Title & Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">{farm.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {farm.id}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditFarmModal(farm)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFarm(farm.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Cattle Occupancy</span>
                    <span className="text-slate-800">{cowCount} / {capacity} Head ({occupancyRate}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyRate > 90 ? 'bg-rose-500' : occupancyRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Staff & Herd Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cattle Count</p>
                    <p className="text-base font-black text-slate-800 mt-0.5">{cowCount}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Size</p>
                    <p className="text-base font-black text-slate-800 mt-0.5">{staffCount}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feed Batches</p>
                    <p className="text-base font-black text-slate-800 mt-0.5">{activeBatches}</p>
                  </div>
                </div>

                {/* People assignments */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Owner:</span>
                    <span className="text-slate-800 font-bold">{owner ? owner.name : 'Not Assigned (គ្មានកំណត់)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Manager:</span>
                    <span className="text-slate-800 font-bold">{manager ? manager.name : 'Not Assigned (គ្មានកំណត់)'}</span>
                  </div>
                </div>

                {/* Location metadata */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {farm.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-650 font-medium leading-relaxed">{farm.address}</span>
                    </div>
                  )}
                  {farm.notes && (
                    <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <AlertCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-slate-500 leading-normal font-medium">{farm.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Farm Branch Dialog Modal */}
      <Dialog open={isAddingFarm} onOpenChange={setIsAddingFarm}>
        <DialogContent className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-600 animate-pulse" />
              {editingFarm ? `Edit Farm: ${editingFarm.name}` : 'Create New Farm Branch'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure parameters, capacities, address and staff assignments for this location.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFarm} className="space-y-4 pt-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Farm Branch Name (ទីតាំងក្រោល)</label>
              <input
                type="text"
                required
                placeholder="e.g. ក្រោល C, ព្រៃវែង"
                value={farmName}
                onChange={e => setFarmName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Capacity (Cows)</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={1000}
                  placeholder="100"
                  value={farmCapacity}
                  onChange={e => setFarmCapacity(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Farm Owner Assign</label>
                <select
                  value={farmOwnerId}
                  onChange={e => setFarmOwnerId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">Unassigned (គ្មានកំណត់)</option>
                  {farmOwners.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Manager Assign</label>
              <select
                value={farmManagerId}
                onChange={e => setFarmManagerId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="">Unassigned (គ្មានកំណត់)</option>
                {farmStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Farm Address / Geo Location</label>
              <input
                type="text"
                placeholder="District, Province, Country..."
                value={farmAddress}
                onChange={e => setFarmAddress(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Operational Notes</label>
              <textarea
                placeholder="Enter specialized diet requirements, hardware setups, or remarks..."
                value={farmNotes}
                onChange={e => setFarmNotes(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setIsAddingFarm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {editingFarm ? '💾 Update Farm Branch' : '💾 Save Farm Branch'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          description={confirmModal.description}
          type={confirmModal.type}
          confirmText={confirmModal.confirmText}
        />
      )}
    </div>
  );
}
