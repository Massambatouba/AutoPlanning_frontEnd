
import { AgentType } from "./agent-type.model";

export interface Employee {
  id: number;
  userId?: number;
  siteId: number;
  companyId?: number;
  firstName: string;
  agentTypes : AgentType[];
  lastName: string;
  employeeName?: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  employeeCode: string;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
  maxHoursPerWeek?: number;
  //siteName: string;
  preferences: EmployeePreferences;
  preferredSites?: number[];
  skillSets?: string[];
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  adress: string;
  zipCode: string;
  city: string;
  country: string
}

export interface EmployeePreferences {
  /** Peut travailler les week-ends */
  canWorkWeekends: boolean;

  /** Peut travailler de nuit */
  canWorkNights: boolean;

  canWorkWeeks: boolean;

  /** Préfère les shifts de jour */
  prefersDay: boolean;

  /** Préfère les shifts de nuit */
  prefersNight: boolean;

  /** Pas de préférence particulière ? */
  noPreference: boolean;

  /* ---- contraintes horaires ---- */
  minHoursPerDay:          number;
  maxHoursPerDay:          number;
  minHoursPerWeek:         number;
  maxHoursPerWeek:         number;

  /** Nombre de jours consécutifs « idéaux » */
  preferredConsecutiveDays: number;

  /** Jours de repos minimaux d’affilée */
  minConsecutiveDaysOff:    number;
}

export interface EmployeeAssignmentDTO {
  id: number;
  siteName: string;
  startTime: string;
  shift: string;
  agentType?: string;
  endTime: string;
  siteId?: number;
  address: string;
  city: string;
  notes?: string;
  zipCode: string;
  country: string;
  absence?: {
    type: string;
  }
  isAbsence?: boolean;
  absenceType?: string;
}

export interface EmployeePlanningDTO {
  employeeId: number;
  scheduleId: number
  employeeName: string;
  calendar: { [key: string]: EmployeeAssignmentDTO[] };
  assignments: EmployeeAssignmentDTO[];
}

export interface EmployeeGridRow {
  id:        number;
  name:      string;
  totalMin:  number;
}

// export interface EmployeePlanning {
//   id: number;
//   fullName: string;
// }

export interface SitePlanningResponse {
  siteId:    number;
  siteName:  string;
  month:     number;
  year:      number;
  calendar:  Record<string, EmployeeShiftDto[]>;
  employees: EmployeePlanningDTO[];              // ← nouveau champ
}

export interface EmployeeShiftDto {
  employeeId:  number;
  employeeName: string | null;
  agentType:   string;
  startTime:   string;
  endTime:     string;
  shiftLabel?: string | null;
}

export interface EmployeeLite {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  agentTypes?: string[];
}



