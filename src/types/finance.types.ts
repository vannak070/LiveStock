export interface ExpenseItem {
  id: string;
  category: string; // Feed, Medicine, Maintenance, Labor, Utilities, Other
  amount: number;
  date: string;
  description: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  marginPercentage: number;
}
