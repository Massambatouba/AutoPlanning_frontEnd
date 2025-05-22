export interface Employee {
  id: number;
  userId?: number;
  companyId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  employeeCode: string;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
  maxHoursPerWeek: number;
  preferredSites?: number[];
  skillSets?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}