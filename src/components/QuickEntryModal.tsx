'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { StockItem } from '@/lib/xlsx-parser';
import { MasterSetup, BatchItem } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ConfirmModal } from './ui/confirm-modal';
import { 
  FileText, 
  DollarSign, 
  ClipboardCheck, 
  Upload, 
  Tag, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Scale, 
  HelpCircle,
  Clock
} from 'lucide-react';

// Zod validation schemas
const newCowSchema = z.object({
  id: z.string().min(2, "ID must be at least 2 characters").regex(/^[A-Z0-9-]+$/, "ID must contain letters, numbers, hyphens only"),
  breed: z.string().min(1, "Breed is required"),
  sex: z.string().min(1, "Sex is required"),
  age: z.string().min(1, "Age is required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  ownerName: z.string().min(1, "Owner name is required"),
  location: z.string().min(1, "Location is required"),
  phone: z.string().min(1, "Phone is required"),
  buyType: z.string().min(1, "Buy Type is required"),
  unitPrice: z.coerce.number().nonnegative("Unit price must be non-negative"),
  totalPrice: z.coerce.number().nonnegative("Total price must be non-negative"),
  healthStatus: z.string().min(1, "Health status is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  remark: z.string(),
  purchaseType: z.string().min(1, "Purchase Type is required"),
  paymentMethod: z.string().min(1, "Payment Method is required"),
});

const weightSchema = z.object({
  cowId: z.string().min(1, "Cow ID is required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  healthStatus: z.string().min(1, "Health status is required"),
  trackingDate: z.string().min(1, "Tracking date is required"),
});

const saleSchema = z.object({
  cowId: z.string().min(1, "Cow ID is required"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  salesDate: z.string().min(1, "Sales date is required"),
});

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  common: MasterSetup;
  activeCows: StockItem[];
  activeBatches?: BatchItem[];
  defaultTab?: 'add' | 'weight' | 'sale';
  preselectedCowId?: string | null;
  onAddCow: (data: z.infer<typeof newCowSchema>) => Promise<void>;
  onAddWeight: (cowId: string, weight: number, healthStatus: string, date: string) => Promise<void>;
  onRecordSale: (cowId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', date: string, buyer?: string) => Promise<void>;
  onRecordBatchSale?: (batchId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', date: string) => Promise<void>;
}

export default function QuickEntryModal({
  isOpen,
  onClose,
  common,
  activeCows,
  activeBatches = [],
  defaultTab = 'add',
  preselectedCowId = null,
  onAddCow,
  onAddWeight,
  onRecordSale,
  onRecordBatchSale
}: QuickEntryModalProps) {
  // Confirm Modal State
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

  const [tab, setTab] = useState<'add' | 'weight' | 'sale'>(defaultTab);
  const [step, setStep] = useState(1); // For Add Cow multi-step form

  // Sales Tab Custom States to support Batch vs Cow & Lumpsum vs Weight
  const [saleTarget, setSaleTarget] = useState<'cow' | 'batch'>('cow');
  const [saleCowId, setSaleCowId] = useState('');
  const [saleBatchId, setSaleBatchId] = useState('');
  const [saleType, setSaleType] = useState<'Weight' | 'Lumpsum'>('Weight');
  const [saleUnitPrice, setSaleUnitPrice] = useState('9700');
  const [saleWeight, setSaleWeight] = useState('250');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [saleBuyer, setSaleBuyer] = useState('');

  const selectedBatchObj = activeBatches.find(b => b.id === saleBatchId);
  const cohortCows = selectedBatchObj 
    ? activeCows.filter(c => selectedBatchObj.cowIds.includes(c.id))
    : [];

  // Sync selected cow's weight to saleWeight
  React.useEffect(() => {
    if (saleCowId) {
      const cow = activeCows.find(c => c.id === saleCowId);
      if (cow) {
        setSaleWeight(String(cow.weight || 250));
      }
    }
  }, [saleCowId, activeCows]);

  // Reset selected cow if saleTarget or saleBatchId changes
  React.useEffect(() => {
    setSaleCowId('');
  }, [saleTarget, saleBatchId]);

  React.useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setStep(1);
    }
  }, [isOpen, defaultTab]);

  // Form hooks
  const { register: regAdd, handleSubmit: handleAddSubmit, setValue: setAddValue, watch: watchAdd, trigger: triggerAdd, setError: setErrorAdd, formState: { errors: errorsAdd }, reset: resetAdd } = useForm<z.infer<typeof newCowSchema>>({
    resolver: zodResolver(newCowSchema) as any,
    defaultValues: {
      id: '',
      breed: common.breeds[0] || 'គោទន្លេ',
      sex: 'F',
      age: 'N/A',
      weight: 250,
      ownerName: '',
      location: '',
      phone: 'N/A',
      buyType: 'Lumsum',
      unitPrice: 2628500,
      totalPrice: 2628500,
      healthStatus: 'Good',
      purchaseDate: new Date().toISOString().split('T')[0],
      remark: '',
      purchaseType: common.purchaseTypes?.[0] || 'Purchase',
      paymentMethod: common.paymentMethods?.[0] || 'ABA Pay',
    }
  });

  const buyTypeVal = watchAdd('buyType');
  const weightVal = watchAdd('weight');
  const unitPriceVal = watchAdd('unitPrice');

  React.useEffect(() => {
    const wt = Number(weightVal) || 0;
    const price = Number(unitPriceVal) || 0;
    if (buyTypeVal === 'Weight') {
      setAddValue('totalPrice', wt * price);
    } else {
      setAddValue('totalPrice', price);
    }
  }, [buyTypeVal, weightVal, unitPriceVal, setAddValue]);

  const purchaseTypeVal = watchAdd('purchaseType');

  React.useEffect(() => {
    if (purchaseTypeVal === 'Born in Farm') {
      setAddValue('ownerName', 'SNR Farm');
      setAddValue('phone', 'N/A');
      setAddValue('buyType', 'Lumsum');
      setAddValue('unitPrice', 0);
      setAddValue('totalPrice', 0);
      setAddValue('paymentMethod', 'N/A');
    } else if (purchaseTypeVal === 'Transfer') {
      if (watchAdd('ownerName') === 'SNR Farm') setAddValue('ownerName', '');
      setAddValue('phone', 'N/A');
      setAddValue('buyType', 'Lumsum');
      setAddValue('unitPrice', 0);
      setAddValue('totalPrice', 0);
      setAddValue('paymentMethod', 'N/A');
    } else if (purchaseTypeVal === 'Partnership') {
      if (watchAdd('ownerName') === 'SNR Farm') setAddValue('ownerName', '');
      if (watchAdd('phone') === 'N/A') setAddValue('phone', '');
      setAddValue('paymentMethod', 'N/A');
    } else { // 'Purchase'
      if (watchAdd('ownerName') === 'SNR Farm') setAddValue('ownerName', '');
      if (watchAdd('phone') === 'N/A') setAddValue('phone', '');
      if (watchAdd('paymentMethod') === 'N/A') setAddValue('paymentMethod', common.paymentMethods?.[0] || 'ABA Pay');
    }
  }, [purchaseTypeVal, setAddValue, common.paymentMethods]);

  const handleNextToStep2 = async () => {
    const isValid = await triggerAdd(['id', 'breed', 'sex', 'age', 'weight', 'purchaseDate']);
    if (isValid) {
      const enteredId = watchAdd('id');
      const idExists = activeCows.some(c => c.id.toLowerCase() === enteredId.toLowerCase());
      if (idExists) {
        setErrorAdd('id', { type: 'manual', message: 'This Cattle ID is already registered and active.' });
        return;
      }
      setStep(2);
    }
  };

  const handleNextToStep3 = async () => {
    const isValid = await triggerAdd(['ownerName', 'location', 'phone', 'buyType', 'unitPrice', 'purchaseType', 'paymentMethod']);
    if (isValid) {
      setStep(3);
    }
  };

  const { register: regW, handleSubmit: handleWSubmit, setValue: setWValue, formState: { errors: errorsW }, reset: resetW } = useForm<z.infer<typeof weightSchema>>({
    resolver: zodResolver(weightSchema) as any,
    defaultValues: {
      cowId: preselectedCowId || '',
      weight: 250,
      healthStatus: 'Good',
      trackingDate: new Date().toISOString().split('T')[0],
    }
  });

  React.useEffect(() => {
    if (preselectedCowId && tab === 'weight') {
      setWValue('cowId', preselectedCowId);
      const activeCow = activeCows.find(c => c.id === preselectedCowId);
      if (activeCow) {
        setWValue('weight', activeCow.weight);
        setWValue('healthStatus', activeCow.healthStatus);
      }
    }
  }, [preselectedCowId, tab, activeCows, setWValue]);

  React.useEffect(() => {
    if (preselectedCowId && tab === 'sale') {
      setSaleCowId(preselectedCowId);
      setSaleTarget('cow');
    }
  }, [preselectedCowId, tab]);

  // Form Submit Handlers
  const onSubmitAdd = async (data: z.infer<typeof newCowSchema>) => {
    await onAddCow(data);
    setConfirmModal({
      isOpen: true,
      title: 'Livestock Registered',
      description: `Cattle Tag ${data.id} has been registered into farm inventory.`,
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        resetAdd();
        onClose();
      }
    });
  };

  const onSubmitW = async (data: z.infer<typeof weightSchema>) => {
    await onAddWeight(data.cowId, data.weight, data.healthStatus, data.trackingDate);
    setConfirmModal({
      isOpen: true,
      title: 'Weight Logged',
      description: `Current weight of ${data.weight} kg recorded successfully for Cow ${data.cowId}.`,
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        resetW();
        onClose();
      }
    });
  };

  const handleCustomSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleCowId) {
      setConfirmModal({
        isOpen: true,
        title: 'Cow ID Required',
        description: 'Please select a valid Cow ID before recording sale.',
        type: 'info',
        confirmText: 'OK'
      });
      return;
    }

    setIsSubmittingSale(true);
    try {
      if (saleType === 'Weight') {
        const cowObj = activeCows.find(c => c.id === saleCowId);
        if (cowObj && Number(saleWeight) !== cowObj.weight) {
          await onAddWeight(saleCowId, Number(saleWeight), cowObj.healthStatus, saleDate);
        }
      }

      await onRecordSale(saleCowId, Number(saleUnitPrice), saleType, saleDate, saleBuyer);
      setConfirmModal({
        isOpen: true,
        title: 'Sale Recorded',
        description: `Sale transaction has been successfully recorded for cow ${saleCowId}.`,
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => {
          setSaleCowId('');
          setSaleBatchId('');
          onClose();
        }
      });
    } catch (err: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Sale Registration Failed',
        description: err.message || 'Unknown error occurred while recording sale transaction.',
        type: 'danger',
        confirmText: 'Dismiss'
      });
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const modalTitles = {
    add: {
      title: '➕ ចុះឈ្មោះគោថ្មី (Register New Cow)',
      desc: 'Register new cow tag, breed, supplier, and barn location details.'
    },
    weight: {
      title: '⚖️ កត់ត្រាគីឡូគោ (Log Cattle Weight)',
      desc: 'Record weight scaling, select health status, and tracking dates.'
    },
    sale: {
      title: '💰 កត់ត្រាការលក់គោ (Record Cattle Sale)',
      desc: 'Finalize sales transactions, specify unit prices, weight, and buyer.'
    }
  };

  const currentMeta = modalTitles[tab] || {
    title: 'Quick Action Panel',
    desc: 'Log information, record weights, or finalize cow sales.'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[540px] bg-white border border-slate-100 text-slate-800 p-6 rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-lg font-black text-slate-800 text-left">{currentMeta.title}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-medium text-left">
            {currentMeta.desc}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        {!defaultTab && (
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 text-xs font-bold mb-4 shadow-inner">
            <button
              onClick={() => setTab('add')}
              className={`py-1.5 rounded-lg transition-all duration-150 ${tab === 'add' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Add Cow
            </button>
            <button
              onClick={() => setTab('weight')}
              className={`py-1.5 rounded-lg transition-all duration-150 ${tab === 'weight' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Log Weight
            </button>
            <button
              onClick={() => setTab('sale')}
              className={`py-1.5 rounded-lg transition-all duration-150 ${tab === 'sale' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Record Sale
            </button>
          </div>
        )}

        {/* Tab 1: ADD COW (Multi-step) */}
        {tab === 'add' && (
          <form onSubmit={handleAddSubmit(onSubmitAdd)} className="space-y-5">
            {/* Step Indicators */}
            <div className="relative flex items-center justify-between px-6 mb-8 mt-2">
              {/* Stepper Connective Line */}
              <div className="absolute left-10 right-10 top-5 h-[3px] bg-slate-100 -translate-y-1/2 z-0 rounded-full">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-350"
                  style={{ width: `${(step - 1) * 50}%` }}
                />
              </div>
              
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                className="relative z-10 flex flex-col items-center gap-2 focus:outline-none group"
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step >= 1 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105' 
                    : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
                }`}>
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${step >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>Specs</span>
              </button>

              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                className="relative z-10 flex flex-col items-center gap-2 focus:outline-none group"
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step >= 2 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105' 
                    : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
                }`}>
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${step >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>Finance</span>
              </button>

              <button
                type="button"
                className="relative z-10 flex flex-col items-center gap-2 focus:outline-none group"
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step === 3 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105' 
                    : 'bg-white border border-slate-200 text-slate-400'
                }`}>
                  <ClipboardCheck className="h-4.5 w-4.5" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${step === 3 ? 'text-emerald-700' : 'text-slate-400'}`}>Review</span>
              </button>
            </div>

            {/* STEP 1: SPECIFICATIONS */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
                {/* Visual Image Upload Dropzone */}
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 bg-slate-50/50 hover:bg-emerald-50/10 rounded-2xl p-4.5 transition-all duration-150 flex flex-col items-center justify-center cursor-pointer text-center group">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-2 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Upload className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Upload Cattle Image</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Drag and drop, or click to select (PNG, JPG up to 5MB)</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="id" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                    <span>Cattle Tag / ID (លេខត្រចៀកគោ)</span>
                    <span className="text-[9px] font-medium text-slate-400 normal-case">Letters, numbers, hyphens</span>
                  </Label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input id="id" placeholder="e.g. SNR-204" {...regAdd('id')} className="rounded-xl pl-10" />
                  </div>
                  {errorsAdd.id && <p className="text-red-500 text-xs font-semibold">{errorsAdd.id.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="breed" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Breed (ពូជគោ)</Label>
                    <select
                      id="breed"
                      {...regAdd('breed')}
                      className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                    >
                      {common.breeds.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sex" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sex (ភេទ)</Label>
                    <select
                      id="sex"
                      {...regAdd('sex')}
                      className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                    >
                      {common.sexes.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age / DOB (អាយុ)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input id="age" placeholder="e.g. 18 Months" {...regAdd('age')} className="rounded-xl pl-10" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Weight (ទម្ងន់ដើម)</Label>
                    <div className="relative">
                      <Input id="weight" type="number" {...regAdd('weight')} className="rounded-xl pr-10 font-mono font-bold" />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">kg</span>
                    </div>
                    {errorsAdd.weight && <p className="text-red-500 text-xs font-semibold">{errorsAdd.weight.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="purchaseDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Date (ថ្ងៃទិញចូល)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                    <Input id="purchaseDate" type="date" {...regAdd('purchaseDate')} className="rounded-xl pl-10 cursor-pointer text-slate-700 font-medium" />
                  </div>
                </div>

                <Button type="button" onClick={handleNextToStep2} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 font-bold shadow-md shadow-emerald-500/15 transition-all">
                  Next: Financial Details
                </Button>
              </div>
            )}

            {/* STEP 2: FINANCIALS & OWNER */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
                <div className="space-y-1.5">
                  <Label htmlFor="purchaseType" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Type (ប្រភេទលទ្ធកម្ម)</Label>
                  <select
                    id="purchaseType"
                    {...regAdd('purchaseType')}
                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                  >
                    {(common.purchaseTypes || []).map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barn / Location (ក្រោលគោ)</Label>
                    <select
                      id="location"
                      {...regAdd('location')}
                      className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                    >
                      {common.locations.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {purchaseTypeVal === 'Purchase' && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <Label htmlFor="paymentMethod" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method (វិធីទូទាត់)</Label>
                      <select
                        id="paymentMethod"
                        {...regAdd('paymentMethod')}
                        className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                      >
                        {(common.paymentMethods || []).map(pm => (
                          <option key={pm} value={pm}>{pm}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {purchaseTypeVal !== 'Born in Farm' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label htmlFor="ownerName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {purchaseTypeVal === 'Transfer' ? 'Transfer From Owner (ប្រភពផ្ទេរ)' : 
                         purchaseTypeVal === 'Partnership' ? 'Partner Name (ដៃគូសហការ)' : 
                         'Source Supplier / Owner (ប្រភពទិញ)'}
                      </Label>
                      <Input id="ownerName" placeholder={purchaseTypeVal === 'Partnership' ? "Partner's name..." : "Owner Name..."} {...regAdd('ownerName')} className="rounded-xl" />
                      {errorsAdd.ownerName && <p className="text-red-500 text-xs font-semibold">{errorsAdd.ownerName.message}</p>}
                    </div>

                    {purchaseTypeVal !== 'Transfer' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone (លេខទូរស័ព្ទ)</Label>
                        <Input id="phone" {...regAdd('phone')} className="rounded-xl" />
                      </div>
                    )}
                  </div>
                )}

                {(purchaseTypeVal === 'Purchase' || purchaseTypeVal === 'Partnership') && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-1">
                        <Label htmlFor="buyType" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buy Type (លក្ខខណ្ឌ)</Label>
                        <select
                          id="buyType"
                          {...regAdd('buyType')}
                          className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                        >
                          {common.buyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label htmlFor="unitPrice" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {buyTypeVal === 'Weight' ? 'Price per kg (៛ / គីឡូ)' : 'Cow Price / Unit Price (តម្លៃ ៛)'}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-extrabold">៛</span>
                          <Input id="unitPrice" type="number" {...regAdd('unitPrice')} className="rounded-xl pl-8 font-mono font-bold" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="totalPrice" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                        <span>Total Capital Valuation (ទុនសរុប)</span>
                        {buyTypeVal === 'Weight' && <span className="text-[9px] text-slate-450 normal-case font-medium">Auto: Weight &times; Unit Price</span>}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 text-xs font-extrabold">៛</span>
                        <Input id="totalPrice" type="number" {...regAdd('totalPrice')} className="rounded-xl pl-8 font-mono text-emerald-700 font-black bg-emerald-50/40 border border-emerald-100 shadow-inner" readOnly />
                      </div>
                    </div>
                  </div>
                )}

                {purchaseTypeVal === 'Born in Farm' && (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
                    Cattle born on the farm requires zero capital asset valuation and payment options.
                  </div>
                )}

                {purchaseTypeVal === 'Transfer' && (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100/60 rounded-2xl text-xs font-semibold text-blue-800 animate-in fade-in duration-200">
                    Internal barn transfers assume ownership migration without direct immediate transaction settlements.
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 rounded-xl border-slate-200">
                    Back
                  </Button>
                  <Button type="button" onClick={handleNextToStep3} className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/15 transition-all">
                    Next: Final Review
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: FINALIZE */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
                {/* Visual summary review card */}
                <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2 flex items-center justify-between">
                    <span>Registration Review</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-normal">
                      Ready to register
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Cattle ID / Tag</p>
                      <p className="font-bold text-slate-800 mt-0.5">{watchAdd('id') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Breed & Sex</p>
                      <p className="font-bold text-slate-800 mt-0.5">{watchAdd('breed')} ({watchAdd('sex')})</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Initial Weight</p>
                      <p className="font-bold text-slate-800 mt-0.5">{watchAdd('weight')} kg</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Barn / Location</p>
                      <p className="font-bold text-slate-800 mt-0.5">{watchAdd('location') || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Financial Setup details</p>
                      <p className="font-bold text-slate-850 mt-0.5">{watchAdd('purchaseType')} &bull; {watchAdd('paymentMethod')}</p>
                    </div>
                    <div className="col-span-2 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Acquisition ({watchAdd('buyType')})</p>
                        <p className="font-extrabold text-slate-900 mt-0.5">៛ {Number(watchAdd('unitPrice')).toLocaleString()}{watchAdd('buyType') === 'Weight' ? '/kg' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Total Capital</p>
                        <p className="text-sm font-black text-emerald-600 mt-0.5">៛ {Number(watchAdd('totalPrice')).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="healthStatus" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Health Condition</Label>
                  <select
                    id="healthStatus"
                    {...regAdd('healthStatus')}
                    className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-semibold cursor-pointer"
                  >
                    {common.healthStatuses.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="remark" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks & Notes</Label>
                  <textarea
                    id="remark"
                    rows={3}
                    placeholder="Enter any medical, genetic, or supplier remarks..."
                    className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 shadow-sm"
                    {...regAdd('remark')}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3 rounded-xl border-slate-200">
                    Back
                  </Button>
                  <Button type="submit" className="w-2/3 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl font-bold shadow-md shadow-amber-500/15 transition-all">
                    Register Livestock
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: LOG WEIGHT */}
        {tab === 'weight' && (
          <form onSubmit={handleWSubmit(onSubmitW)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="w_cowId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Cow ID</Label>
              <select
                id="w_cowId"
                {...regW('cowId')}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-medium cursor-pointer"
              >
                <option value="">-- Choose active cow --</option>
                {activeCows.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} ({c.breed} - {c.weight} kg)
                  </option>
                ))}
              </select>
              {errorsW.cowId && <p className="text-red-500 text-xs font-semibold">{errorsW.cowId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="w_weight" className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Weight (kg)</Label>
                <Input id="w_weight" type="number" {...regW('weight')} />
                {errorsW.weight && <p className="text-red-500 text-xs font-semibold">{errorsW.weight.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="w_health" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Status</Label>
                <select
                  id="w_health"
                  {...regW('healthStatus')}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-medium cursor-pointer"
                >
                  {common.healthStatuses.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w_date" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking Date</Label>
              <Input id="w_date" type="date" {...regW('trackingDate')} />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 font-bold shadow-md shadow-emerald-500/10 mt-2">
              Log Weight Record
            </Button>
          </form>
        )}

        {/* Tab 3: RECORD SALE */}
        {tab === 'sale' && (
          <form onSubmit={handleCustomSaleSubmit} className="space-y-4">
            {/* Sale Target Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sale Target</Label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setSaleTarget('cow')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    saleTarget === 'cow'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Individual Cow
                </button>
                <button
                  type="button"
                  onClick={() => setSaleTarget('batch')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    saleTarget === 'batch'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Cohort Batch
                </button>
              </div>
            </div>

            {/* Target Select Dropdown */}
            {saleTarget === 'cow' ? (
              <div className="space-y-1.5">
                <Label htmlFor="sale_cowId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Cow ID</Label>
                <select
                  id="sale_cowId"
                  value={saleCowId}
                  onChange={e => setSaleCowId(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-medium cursor-pointer"
                >
                  <option value="">-- Choose active cow --</option>
                  {activeCows.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} ({c.breed} - {c.weight} kg)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sale_batchId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Cohort Batch</Label>
                  <select
                    id="sale_batchId"
                    value={saleBatchId}
                    onChange={e => setSaleBatchId(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-medium cursor-pointer"
                  >
                    <option value="">-- Choose active batch --</option>
                    {activeBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.cowIds.length} active cows)
                      </option>
                    ))}
                  </select>
                </div>

                {saleBatchId && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <Label htmlFor="sale_batch_cowId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Cow from Batch</Label>
                    <select
                      id="sale_batch_cowId"
                      value={saleCowId}
                      onChange={e => setSaleCowId(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm font-medium cursor-pointer"
                    >
                      <option value="">-- Choose cow inside cohort --</option>
                      {cohortCows.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.id} ({c.breed} - {c.weight} kg)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Sale Type (Weight vs Lumpsum) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sale Type</Label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setSaleType('Weight')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    saleType === 'Weight'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Weight Scale (Price * kg)
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType('Lumpsum')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    saleType === 'Lumpsum'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/40'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Lumpsum (Fixed Price)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {saleType === 'Weight' ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="sale_weight" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scale Weight (kg)</Label>
                    <div className="relative">
                      <Input
                        id="sale_weight"
                        type="number"
                        required
                        min={1}
                        value={saleWeight}
                        onChange={e => setSaleWeight(e.target.value)}
                        className="text-slate-800 pr-10"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">kg</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sale_price" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (៛ / kg)</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-extrabold">៛</span>
                      <Input
                        id="sale_price"
                        type="number"
                        required
                        min={1}
                        value={saleUnitPrice}
                        onChange={e => setSaleUnitPrice(e.target.value)}
                        className="text-slate-800 pl-8 font-mono font-bold"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="sale_price" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fixed Lumpsum Price (៛)</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-extrabold">៛</span>
                    <Input
                      id="sale_price"
                      type="number"
                      required
                      min={1}
                      value={saleUnitPrice}
                      onChange={e => setSaleUnitPrice(e.target.value)}
                      className="text-slate-800 pl-8 font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="sale_date" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Date</Label>
                <Input
                  id="sale_date"
                  type="date"
                  required
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                  className="text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sale_buyer" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buyer / Sold To (លក់ជូន)</Label>
              <Input
                id="sale_buyer"
                type="text"
                placeholder="e.g. Phnom Penh Meat Distributor"
                value={saleBuyer}
                onChange={e => setSaleBuyer(e.target.value)}
                className="text-slate-800 rounded-xl"
              />
            </div>

            {/* Live Pricing Preview */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl flex justify-between items-center text-xs font-bold animate-in fade-in duration-200">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Estimated Revenue:</span>
              <span className="text-emerald-700 text-sm font-black">
                ៛ {(saleType === 'Weight' ? Number(saleWeight) * Number(saleUnitPrice) : Number(saleUnitPrice)).toLocaleString()}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmittingSale}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 font-bold shadow-md shadow-emerald-500/10 mt-2"
            >
              {isSubmittingSale ? 'Processing...' : 'Record Sale & Finalize Transaction'}
            </Button>
          </form>
        )}
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
      </DialogContent>
    </Dialog>
  );
}
