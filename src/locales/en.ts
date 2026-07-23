export const en = {
  // Navigation & Header
  nav: {
    dashboard: 'Dashboard',
    cattleRegistry: 'Cattle Registry',
    batchManagement: 'Batch Management',
    healthVaccines: 'Medical & Vaccines',
    financeLedger: 'Feed Costs & Revenue',
    analytics: 'Growth & Profit Analytics',
    farmsBranches: 'Farms & Stall Branches',
    masterSettings: 'ERP Master Setup',
    systemTitle: 'LiveStock Fattening ERP',
    systemSubtitle: 'Fattening Livestock Management System',
    role: 'Role',
    logout: 'Sign Out',
    overview: 'Overview',
    livestockErp: 'Livestock ERP',
    financials: 'Financials',
    insights: 'Insights',
    administration: 'Administration'
  },
  // Common Actions & Buttons
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search...',
    reset: 'Reset',
    filter: 'Filter',
    allFarms: 'All Farms & Branches',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    notes: 'Notes',
    total: 'Total',
    confirm: 'Confirm',
    close: 'Close',
    loading: 'Loading...',
    clear: 'Clear',
    select: 'Select'
  },
  // Cattle Inventory Table & Forms
  inventory: {
    title: 'Fattening Cattle Registry',
    subtitle: 'Manage cattle stock, view growth, and track biological profiles.',
    registerCow: 'Register Fattening Cattle',
    cowId: 'Cow ID',
    farm: 'Farm / Location',
    breed: 'Breed',
    sex: 'Sex',
    initialWeight: 'Initial Weight',
    currentWeight: 'Current Weight',
    purchasePrice: 'Purchase Price',
    healthStatus: 'Health Status',
    status: 'Status',
    active: 'Active',
    sold: 'Sold',
    quarantine: 'Quarantine',
    dead: 'Dead',
    noCows: 'No stock items match active filters.',
    searchPlaceholder: 'Search Tag ID or Breed...',
    paymentMethod: 'Payment Method',
    purchaseType: 'Purchase Type',
    supplier: 'Supplier / Owner',
    remark: 'Remark / Notes'
  },
  // Weight & Growth
  weight: {
    title: 'Herd Weight Tracking & Growth Log',
    logWeight: 'Log Cattle Weight',
    oldWeight: 'Previous Weight',
    currentWeight: 'Current Weight',
    weightGain: 'Weight Gain / Loss',
    adg: 'Average Daily Gain (ADG)',
    trackingDate: 'Log Date',
    recordWeights: 'Record Weights'
  },
  // Batches & Diet
  batches: {
    title: 'Fattening Management & Rations',
    subtitle: 'Manage rations, weights, and average daily gain (ADG) for the entire fattening herd.',
    newBatch: 'New Batch',
    editBatch: 'Edit Batch',
    deleteBatch: 'Delete Batch',
    deleteConfirmTitle: 'Delete Batch?',
    herdAllocation: 'Herd & Allocation',
    dailyFeedRation: 'Daily Feed Ration',
    adgReports: 'ADG Reports & Growth',
    ingredientName: 'Ingredient Name',
    portionHead: 'Portion / Head (kg)',
    unitCost: 'Unit Cost (KHR)',
    totalRationCost: 'Total Ration Cost'
  },
  // Sales & Revenue
  sales: {
    title: 'Livestock Sales & Revenue',
    recordSale: 'Record Cattle Sale',
    unitPrice: 'Unit Price (KHR/kg)',
    totalPrice: 'Total Sale Amount',
    buyer: 'Buyer Name',
    saleType: 'Sale Basis',
    salesDate: 'Sale Date',
    weightBasis: 'Weight Basis',
    lumpsumBasis: 'Lumpsum Basis'
  },
  // Health & Medical
  health: {
    title: 'Medical & Vaccine Health Logs',
    addLog: 'Add Health Log',
    treatmentType: 'Treatment Type',
    vetDoctor: 'Veterinarian / Doctor',
    cost: 'Cost (KHR)',
    vaccine: 'Vaccination',
    deworming: 'Deworming',
    checkup: 'Routine Checkup',
    medicalCost: 'Medical Cost'
  },
  // Dashboard & Metrics
  dashboard: {
    totalHerd: 'Active Herd',
    totalFarms: 'Total Farms',
    avgWeight: 'Avg Weight',
    assetValue: 'Asset Value',
    monthlySales: 'Monthly Revenue',
    recentActivity: 'Recent Farm Activities'
  }
};

export type TranslationKeys = typeof en;
