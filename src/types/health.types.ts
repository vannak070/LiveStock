export interface HealthLogItem {
  id: string;
  cowId: string;
  type: 'Vaccination' | 'Treatment' | 'Disease' | 'Deworming';
  name: string; // E.g., Foot and Mouth Vaccine
  date: string;
  administeredBy: string;
  cost: number;
  notes?: string;
}
