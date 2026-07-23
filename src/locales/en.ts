export const en = {
  // Navigation & Header
  nav: {
    dashboard: 'Dashboard',
    cattleRegistry: 'Cattle Registry',
    batchManagement: 'Batch Management',
    healthVaccines: 'Health & Vaccines',
    financeLedger: 'Financial Ledger',
    analytics: 'Analytics',
    farmsBranches: 'Farms & Stall Branches',
    masterSettings: 'Master Settings',
    systemTitle: 'HOVA Livestock Management',
    role: 'Role',
    logout: 'Sign Out'
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
    allFarms: 'All Farms',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    notes: 'Notes',
    total: 'Total',
    confirm: 'Confirm',
    close: 'Close',
    loading: 'Loading...'
  },
  // Cattle Inventory Table
  inventory: {
    title: 'Fattening Cattle Registry',
    subtitle: 'Manage cattle stock, view growth, and track biological profiles.',
    registerCow: 'Register New Cow',
    cowId: 'Cow ID',
    farm: 'Farm',
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
    noCows: 'No cattle records match active filters.',
    searchPlaceholder: 'Search Tag ID or Breed...'
  },
  // Weight & Growth
  weight: {
    title: 'Herd Weight Tracking & Growth Log',
    logWeight: 'Log Cattle Weight',
    oldWeight: 'Previous Weight',
    currentWeight: 'Current Weight',
    weightGain: 'Weight Gain / Loss',
    adg: 'Average Daily Gain (ADG)',
    trackingDate: 'Log Date'
  },
  // Sales & Revenue
  sales: {
    title: 'Livestock Sales & Revenue',
    recordSale: 'Record Cattle Sale',
    unitPrice: 'Unit Price (KHR/kg)',
    totalPrice: 'Total Sale Amount',
    buyer: 'Buyer Name',
    saleType: 'Sale Basis',
    salesDate: 'Sale Date'
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
    checkup: 'Routine Checkup'
  },
  // Dashboard & Metrics
  dashboard: {
    totalHerd: 'Total Active Herd',
    totalFarms: 'Total Farms',
    avgWeight: 'Average Herd Weight',
    monthlySales: 'Monthly Revenue',
    recentActivity: 'Recent Farm Activities'
  }
};

export type TranslationKeys = typeof en;
