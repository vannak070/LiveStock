export type PermissionKey =
  | 'dashboard_view'
  | 'stock_view'
  | 'stock_create'
  | 'stock_edit'
  | 'stock_delete'
  | 'batch_view'
  | 'batch_create'
  | 'batch_edit'
  | 'batch_delete'
  | 'weight_view'
  | 'weight_record'
  | 'weight_delete'
  | 'health_view'
  | 'health_record'
  | 'health_delete'
  | 'sales_view'
  | 'sales_record'
  | 'sales_delete'
  | 'expenses_view'
  | 'expenses_record'
  | 'expenses_delete'
  | 'analytics_view'
  | 'settings_manage';

export interface PermissionCategory {
  id: string;
  label: string;
  items: { key: PermissionKey; label: string; description: string }[];
}

export const PERMISSION_MODULES: PermissionCategory[] = [
  {
    id: 'dashboard',
    label: '📊 Dashboard Overview',
    items: [
      { key: 'dashboard_view', label: 'View Dashboard', description: 'Access main KPI overview and metrics.' }
    ]
  },
  {
    id: 'stock',
    label: '🧑‍🌾 Cattle Stock & Inventory',
    items: [
      { key: 'stock_view', label: 'View Inventory', description: 'View cattle stock list and details.' },
      { key: 'stock_create', label: 'Add Cattle', description: 'Register new cattle into inventory.' },
      { key: 'stock_edit', label: 'Edit Cattle Details', description: 'Update breed, weight, owner, location.' },
      { key: 'stock_delete', label: 'Delete Cattle', description: 'Remove cattle records from stock.' }
    ]
  },
  {
    id: 'batch',
    label: '🐂 Fattening Program Batches',
    items: [
      { key: 'batch_view', label: 'View Batches', description: 'View fattening herds and rations.' },
      { key: 'batch_create', label: 'Create Batch', description: 'Create new fattening or breeding groups.' },
      { key: 'batch_edit', label: 'Edit Batch & Rations', description: 'Modify batch settings and diet formulas.' },
      { key: 'batch_delete', label: 'Delete Batch', description: 'Remove batches from the system.' }
    ]
  },
  {
    id: 'weight',
    label: '⚖️ Weight & ADG Tracking',
    items: [
      { key: 'weight_view', label: 'View Weight Logs', description: 'Inspect ADG growth and scaling history.' },
      { key: 'weight_record', label: 'Record Weight', description: 'Log new weight scaling measurements.' },
      { key: 'weight_delete', label: 'Delete Weight Log', description: 'Remove incorrect weight logs.' }
    ]
  },
  {
    id: 'health',
    label: '💉 Health & Vaccination',
    items: [
      { key: 'health_view', label: 'View Health Records', description: 'Access medical history and vet cards.' },
      { key: 'health_record', label: 'Add Medical Record', description: 'Log treatments, vaccines, and diseases.' },
      { key: 'health_delete', label: 'Delete Health Log', description: 'Remove medical entries.' }
    ]
  },
  {
    id: 'sales',
    label: '💰 Sales & Transactions',
    items: [
      { key: 'sales_view', label: 'View Sales History', description: 'Inspect sales invoices and buyers.' },
      { key: 'sales_record', label: 'Record Sale', description: 'Process cattle sales transactions.' },
      { key: 'sales_delete', label: 'Delete Sale Record', description: 'Void or remove sales transactions.' }
    ]
  },
  {
    id: 'expenses',
    label: '💳 Operating Expenses',
    items: [
      { key: 'expenses_view', label: 'View Expenses', description: 'Access farm operating cost ledgers.' },
      { key: 'expenses_record', label: 'Record Expense', description: 'Log feed, vet, or utility costs.' },
      { key: 'expenses_delete', label: 'Delete Expense Record', description: 'Remove expense items.' }
    ]
  },
  {
    id: 'analytics',
    label: '📈 Financial Analytics',
    items: [
      { key: 'analytics_view', label: 'View Analytics', description: 'Access profit, loss, and cost breakdown charts.' }
    ]
  },
  {
    id: 'settings',
    label: '⚙️ ERP Master Setup',
    items: [
      { key: 'settings_manage', label: 'Manage ERP Setup & Users', description: 'Configure master dropdowns and user permissions.' }
    ]
  }
];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_MODULES.flatMap(m => m.items.map(i => i.key));

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  'Super Admin': ALL_PERMISSIONS,
  'Operation User': ALL_PERMISSIONS.filter(p => !p.endsWith('_delete') && p !== 'settings_manage'),
  'Company User': ['dashboard_view', 'stock_view', 'batch_view', 'weight_view', 'health_view', 'sales_view', 'expenses_view', 'analytics_view'],
  'Farm User': ['dashboard_view', 'stock_view', 'stock_create', 'stock_edit', 'batch_view', 'batch_create', 'batch_edit', 'weight_view', 'weight_record', 'health_view', 'health_record', 'expenses_view', 'expenses_record'],
  'Farm Staff User': ['dashboard_view', 'stock_view', 'weight_view', 'weight_record', 'health_view', 'health_record']
};

export interface CustomRoleDefinition {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Operation User' | 'Company User' | 'Farm User' | 'Farm Staff User' | string;
  status: 'Active' | 'Inactive';
  password?: string;
  permissions?: PermissionKey[];
}

export interface MasterSetup {
  breeds: string[];
  locations: string[];
  buyTypes: string[];
  healthStatuses: string[];
  vaccineTypes: string[];
  feedTypes: string[];
  expenseCategories: string[];
  paymentMethods: string[];
  sexes: string[];
  diseaseTypes: string[];
  batchTypes: string[];
  weightUnits: string[];
  revenueTypes: string[];
  purchaseTypes: string[];
  users: UserRoleItem[];
  roles?: CustomRoleDefinition[];
}
