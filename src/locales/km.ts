import { TranslationKeys } from './en';

export const km: TranslationKeys = {
  // Navigation & Header
  nav: {
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    cattleRegistry: 'បញ្ជីសារពើភណ្ឌគោ',
    batchManagement: 'គ្រប់គ្រងក្រុមគោ (Batch)',
    healthVaccines: 'សុខភាព និង វ៉ាក់សាំង',
    financeLedger: 'សៀវភៅចំណូលចំណាយ',
    analytics: 'របាយការណ៍ និង វិភាគ',
    farmsBranches: 'កសិដ្ឋាន និង ក្រោលគោ',
    masterSettings: 'ការកំណត់ប្រព័ន្ធ',
    systemTitle: 'ប្រព័ន្ធគ្រប់គ្រងកសិដ្ឋាន HOVA',
    role: 'តួនាទី',
    logout: 'ចាកចេញ'
  },
  // Common Actions & Buttons
  common: {
    add: 'បន្ថែម',
    edit: 'កែប្រែ',
    delete: 'លុប',
    cancel: 'បោះបង់',
    save: 'រក្សាទុក',
    search: 'ស្វែងរក...',
    reset: 'កំណត់ឡើងវិញ',
    filter: 'តម្រង',
    allFarms: 'គ្រប់កសិដ្ឋានទាំងអស់',
    actions: 'សកម្មភាព',
    status: 'ស្ថានភាព',
    date: 'កាលបរិច្ឆេទ',
    notes: 'កំណត់ចំណាំ',
    total: 'សរុប',
    confirm: 'អះអាង',
    close: 'បិទ',
    loading: 'កំពុងទាញយក...'
  },
  // Cattle Inventory Table
  inventory: {
    title: 'បញ្ជីសារពើភណ្ឌគោបំប៉ន',
    subtitle: 'គ្រប់គ្រងស្តុកគោ តាមដានការលូតលាស់ និងព័ត៌មានលម្អិត។',
    registerCow: 'ចុះឈ្មោះគោថ្មី',
    cowId: 'លេខកូដគោ (ID)',
    farm: 'កសិដ្ឋាន',
    breed: 'ពូជគោ',
    sex: 'ភេទទ្រង់',
    initialWeight: 'ទម្ងន់ដើម',
    currentWeight: 'ទម្ងន់បច្ចុប្បន្ន',
    purchasePrice: 'តម្លៃទិញចូល',
    healthStatus: 'ស្ថានភាពសុខភាព',
    status: 'ស្ថានភាព',
    active: 'កំពុងបំប៉ន',
    sold: 'លក់រួច',
    quarantine: 'ចម្រោះសុខភាព',
    dead: 'ស្លាប់',
    noCows: 'មិនមានទិន្នន័យគោត្រូវនឹងតម្រងដែលបានជ្រើសរើសឡើយ។',
    searchPlaceholder: 'ស្វែងរកតាមលេខកូដ ឬ ពូជគោ...'
  },
  // Weight & Growth
  weight: {
    title: 'កំណត់ត្រាទម្ងន់ និង ការលូតលាស់',
    logWeight: 'កត់ត្រាទម្ងន់គោ',
    oldWeight: 'ទម្ងន់មុន',
    currentWeight: 'ទម្ងន់បច្ចុប្បន្ន',
    weightGain: 'ការឡើង/ស្រុតទម្ងន់',
    adg: 'កម្រិតឡើងទម្ងន់ប្រចាំថ្ងៃ (ADG)',
    trackingDate: 'កាលបរិច្ឆេទកត់ត្រា'
  },
  // Sales & Revenue
  sales: {
    title: 'ការលក់គោ និង ចំណូល',
    recordSale: 'កត់ត្រាការលក់គោ',
    unitPrice: 'តម្លៃក្នុងមួយគីឡូ (៛)',
    totalPrice: 'ប្រាក់សរុបពីការលក់',
    buyer: 'ឈ្មោះអ្នកទិញ',
    saleType: 'រូបភាពលក់',
    salesDate: 'កាលបរិច្ឆេទលក់'
  },
  // Health & Medical
  health: {
    title: 'កំណត់ត្រាព្យាបាល និង វ៉ាក់សាំង',
    addLog: 'បន្ថែមព័ត៌មានព្យាបាល',
    treatmentType: 'ប្រភេទព្យាបាល',
    vetDoctor: 'គ្រូពេទ្យសត្វ',
    cost: 'ចំណាយ (៛)',
    vaccine: 'ចាក់វ៉ាក់សាំង',
    deworming: 'ទម្លាក់ព្រូន',
    checkup: 'ពិនិត្យសុខភាពទូទៅ'
  },
  // Dashboard & Metrics
  dashboard: {
    totalHerd: 'ចំនួនគោសរុប',
    totalFarms: 'ចំនួនកសិដ្ឋាន',
    avgWeight: 'ទម្ងន់មធ្យមភាគ',
    monthlySales: 'ចំណូលប្រចាំខែ',
    recentActivity: 'សកម្មភាពកសិដ្ឋានថ្មីៗ'
  }
};
