
import { AgentType } from "./agent-type.model";

export interface Employee {
  id: number;
  userId?: number;
  siteId: number;
  companyId?: number;
  firstName: string;
  agentTypes : AgentType[];
  lastName: string;
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
  address: string;
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

export interface AssignmentDTO {
  id: number;
  siteName: string;
  startTime: string;
  shift: string;
  agentType?: string;
  endTime: string;
  siteId?: number;
  address: string;
  city: string;
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
  calendar: { [key: string]: AssignmentDTO[] };
  assignments: AssignmentDTO[];
}

