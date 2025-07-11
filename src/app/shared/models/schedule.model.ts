export interface Schedule {
  id: number;
  companyId: number;
  siteId: number;
  siteName: string;
  name: string;
  month: number;
  year: number;
  site?: { id: number; name: string };
  isPublished: boolean;
  startDate: string;
  endDate: string;
  isSent: boolean;
  sentAt?: Date;
  createdBy?: string;
  completionRate: number;
  totalEmployees?: number;
  totalAssignments?: number;
  totalHours?: number;
  createdAt: string | Date | undefined;
  updatedAt: Date;
  status: ScheduleStatus;

}
export interface AgentTypeConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

export type ScheduleStatus =
  | 'DRAFT'
  | 'SENT_TO_EMPLOYEE'
  | 'APPROVED'
  | 'COMPLETED';


export interface ScheduleAssignment {
  id: number;
  scheduleId: number;
  siteName?: string;
  employeeId: number;
  siteId: number;
  shift?: string;
  date: Date;
  employeeName: string;
  startTime: string;
  endTime: string;
  agentType: string;
  duration: number;
  notes?: string;
  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
  absence?: boolean;
  absenceType?: string;
}

export interface ScheduleAssignmentRequest {
  /** Date au format ISO "YYYY-MM-DD" */
  date: string;
  /** Nom du site */
  siteName: string;
  /** Libellé du shift (ex. "MATIN", "NUIT") */
  shift: string;
  /** Heure de début au format "HH:mm" */
  startTime: string;
  /** Heure de fin au format "HH:mm" */
  endTime: string;
}

export interface ContractHourRequirement {
  id: number;
  companyId: number;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
  minimumHoursPerMonth: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractHourRequirementRequest {
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
  minimumHoursPerMonth: number;
  description?: string;
}

export interface ScheduleComplianceResponse {
  scheduleId: number;
  scheduleName: string;
  month: number;
  year: number;
  totalEmployees: number;
  compliantEmployees: number;
  nonCompliantEmployees: number;
  overallComplianceRate: number;
  employeeSummaries: EmployeeHoursSummary[];
}


export interface EmployeeHoursSummary {
  employeeId: number;
  employeeName: string;
  contractType: string;
  requiredHours: number;
  actualHours: number;
  missingHours: number;
  isCompliant: boolean;
  compliancePercentage: number;
}

export interface CalendarDay {
name: string;
date: Date;
}

export interface AgentSchedule {         
  agentType: string;                    
  startTime: string;                    
  endTime:   string;                    
  requiredCount: number;                 
  notes?: string;
}

export interface WeeklyScheduleRule {     
  id: number;
  dayOfWeek:
      'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
      | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';                    
  maxEmployees: number;
  agents: AgentSchedule[];              
}
