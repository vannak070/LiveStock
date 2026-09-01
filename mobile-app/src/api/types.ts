// Mirrors the real backend types (src/types/*.ts in the main app) — NOT the
// mockup's placeholder field names (tag_id, adg_kg_day, etc). Real data,
// real field names.

export interface StockItem {
  id: string;
  no: string;
  breed: string;
  sex: string;
  age: string;
  weight: number;
  ownerName: string;
  location: string;
  phone: string;
  buyType: string;
  unitPrice: number;
  totalPrice: number;
  healthStatus: string;
  status: string;
  purchaseDate: string | null;
  remark: string;
  purchaseType?: string;
  paymentMethod?: string;
  imageUrl?: string;
}

export interface WeightRecord {
  cowId: string;
  breed: string;
  age: string;
  oldWeight: number;
  currentWeight: number;
  gainLoss: number;
  healthStatus: string;
  status: string;
  trackingDate: string | null;
}

export interface SalesRecord {
  cowId: string;
  breed: string;
  age: string;
  weight: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  salesDate: string | null;
  saleType?: string;
  buyer?: string;
}

export interface BatchItem {
  id: string;
  name: string;
  type: string;
  startDate: string;
  status: 'Active' | 'Closed';
  cowIds: string[];
  notes?: string;
  farmLocation?: string;
  expectedSellingPrice?: number;
}

export interface HealthLogItem {
  id: string;
  cowId: string;
  type: 'Vaccination' | 'Treatment' | 'Disease' | 'Deworming';
  name: string;
  date: string;
  administeredBy: string;
  cost: number;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  farmLocation?: string;
}

export interface FarmItem {
  id: string;
  name: string;
  ownerName?: string;
  address?: string;
  capacity?: number;
  notes?: string;
}

export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permissions?: string[];
  farmLocation?: string;
}

export interface MasterSetup {
  breeds: string[];
  locations: string[];
  users: UserRoleItem[];
  farms?: FarmItem[];
}

export interface FeedProductItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  weightPerUnit: number;
  unitCost: number;
  costPerBag?: number;
  minThresholdBags: number;
  minThresholdKg: number;
  supplier?: string;
  status: 'Active' | 'Inactive';
}

export type FeedTransactionType = 'STOCK_IN' | 'STOCK_OUT';

export interface FeedStockTransaction {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: FeedTransactionType;
  quantityBags: number;
  quantityKg: number;
  unitCost: number;
  totalCost: number;
}
