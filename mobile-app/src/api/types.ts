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

// A batch's optional feeding program — mirrors src/types/batch.types.ts in
// the main app. `expectedSellingPrice` on BatchItem below is a price PER KG
// (₹/kg), not a lump total — see BatchTab.tsx's " / kg" label web-side.
export interface FeedIngredientConfig {
  name: string;
  portionPerHead: number; // kg/head/day
  unitCost: number; // ₹/kg
}

export interface FeedingProgramConfig {
  ingredients: FeedIngredientConfig[];
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Paused' | 'Completed';
  notes?: string;
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
  expectedSellingPrice?: number; // ₹ per kg (target price), not a total
  sellingTargetDate?: string; // ISO date (YYYY-MM-DD) — planned sell/harvest date, set at batch creation
  feedingProgram?: FeedingProgramConfig;
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

// Mirrors src/types/proposal.types.ts in the main app — the Fattening
// Proposal/Plan tool's simulation inputs, last saved from the web app via
// its "Save Plan" button. The mobile Proposal screen is read-only: it
// re-derives the same annual summary figures from these inputs using the
// exact same formula chain as ProposalPlanTab.tsx's `calculations` useMemo,
// rather than fetching precomputed results.
export interface ProposalPlanParams {
  targetStockLevel: number;
  numberOfBatches: number;
  cattlePerBatch: number;
  initialWeightKg: number;
  dailyWeightGainKg: number;
  fatteningPeriodDays: number;
  purchasePricePerKgKhr: number;
  sellingPricePerKgKhr: number;
  bankInterestRateAnnual: number;
  grassKgPerHeadDay: number;
  grassCostPerKgKhr: number;
  concentrateKgPerHeadDay: number;
  concentrateCostPerKgKhr: number;
}

export interface ProposalPlanRecord {
  params: ProposalPlanParams;
  updatedAt: string; // ISO timestamp
}
