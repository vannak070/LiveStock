import { TranslationKeys } from './en';

export const km: TranslationKeys = {
  // Navigation & Header
  nav: {
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    cattleRegistry: 'បញ្ជីសារពើភណ្ឌគោ',
    batchManagement: 'គ្រប់គ្រងក្រុមគោ និង ចំណី',
    healthVaccines: 'ព្យាបាល និង វ៉ាក់សាំង',
    financeLedger: 'ចំណាយចំណី និង ចំណូល',
    analytics: 'របាយការណ៍ និង វិភាគ',
    farmsBranches: 'កសិដ្ឋាន និង ក្រោលគោ',
    masterSettings: 'ការកំណត់ប្រព័ន្ធ',
    systemTitle: 'ប្រព័ន្ធគ្រប់គ្រងកសិដ្ឋាន',
    systemSubtitle: 'ប្រព័ន្ធគ្រប់គ្រងការបំប៉នគោសាច់',
    role: 'តួនាទី',
    logout: 'ចាកចេញ',
    overview: 'ទិដ្ឋភាពទូទៅ',
    livestockErp: 'គ្រប់គ្រងកសិដ្ឋាន',
    financials: 'ហិរញ្ញវត្ថុ',
    insights: 'វិភាគទិន្នន័យ',
    administration: 'ការគ្រប់គ្រង'
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
    loading: 'កំពុងទាញយក...',
    clear: 'សម្អាត',
    select: 'ជ្រើសរើស'
  },
  // Cattle Inventory Table & Forms
  inventory: {
    title: 'បញ្ជីសារពើភណ្ឌគោបំប៉ន',
    subtitle: 'គ្រប់គ្រងស្តុកគោ តាមដានការលូតលាស់ និងព័ត៌មានលម្អិត។',
    registerCow: 'ចុះឈ្មោះគោបំប៉ន',
    cowId: 'លេខកូដគោ',
    farm: 'កសិដ្ឋាន / ក្រោលគោ',
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
    searchPlaceholder: 'ស្វែងរកតាមលេខកូដ ឬ ពូជគោ...',
    paymentMethod: 'វិធីទូទាត់',
    purchaseType: 'ប្រភេទនៃការទិញ',
    supplier: 'អ្នកផ្គត់ផ្គង់ / ម្ចាស់',
    remark: 'ចំណាំ'
  },
  // Weight & Growth
  weight: {
    title: 'កំណត់ត្រាទម្ងន់ និង ការលូតលាស់',
    logWeight: 'កត់ត្រាទម្ងន់គោ',
    oldWeight: 'ទម្ងន់មុន',
    currentWeight: 'ទម្ងន់បច្ចុប្បន្ន',
    weightGain: 'ការឡើង/ស្រុតទម្ងន់',
    adg: 'កម្រិតឡើងទម្ងន់ប្រចាំថ្ងៃ',
    trackingDate: 'កាលបរិច្ឆេទកត់ត្រា',
    recordWeights: 'កត់គីឡូគោបំប៉ន'
  },
  // Batches & Diet
  batches: {
    title: 'កម្មវិធីបំប៉នគោសាច់',
    subtitle: 'គ្រប់គ្រងរបបចំណី ទម្ងន់ និងកម្រិតឡើងទម្ងន់ប្រចាំថ្ងៃ (ADG)។',
    newBatch: 'ក្រុមថ្មី',
    editBatch: 'កែប្រែក្រុមគោ',
    deleteBatch: 'លុបក្រុមគោ',
    deleteConfirmTitle: 'តើអ្នកប្រាកដជាចង់លុបក្រុមគោនេះទេ?',
    herdAllocation: 'ហ្វូងគោបំប៉ន និង បែងចែក',
    dailyFeedRation: 'ចំណីអាហារប្រចាំថ្ងៃ',
    adgReports: 'របាយការណ៍លូតលាស់ និង ADG',
    ingredientName: 'ឈ្មោះធាតុផ្សំចំណី',
    portionHead: 'បរិមាណក្នុងមួយក្បាល (គក)',
    unitCost: 'តម្លៃក្នុងមួយខ្នាត (៛)',
    totalRationCost: 'ចំណាយចំណីសរុប'
  },
  // Sales & Revenue
  sales: {
    title: 'ការលក់គោ និង ចំណូល',
    recordSale: 'កត់ត្រាការលក់គោ',
    unitPrice: 'តម្លៃក្នុងមួយគីឡូ (៛)',
    totalPrice: 'ប្រាក់សរុបពីការលក់',
    buyer: 'ឈ្មោះអ្នកទិញ',
    saleType: 'រូបភាពលក់',
    salesDate: 'កាលបរិច្ឆេទលក់',
    weightBasis: 'លក់គិតតាមគីឡូ',
    lumpsumBasis: 'លក់ផ្តាច់ក្បាល'
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
    checkup: 'ពិនិត្យសុខភាពទូទៅ',
    medicalCost: 'ចំណាយព្យាបាល'
  },
  // Dashboard & Metrics
  dashboard: {
    totalHerd: 'ចំនួនគោសរុប',
    totalFarms: 'ចំនួនកសិដ្ឋាន',
    avgWeight: 'ទម្ងន់មធ្យមភាគ',
    assetValue: 'តម្លៃទ្រព្យសកម្ម',
    monthlySales: 'ចំណូលប្រចាំខែ',
    recentActivity: 'សកម្មភាពកសិដ្ឋានថ្មីៗ'
  }
};
