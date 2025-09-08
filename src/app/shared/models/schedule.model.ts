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
  isSent: boolean;
  sentAt?: Date;
  createdBy?: string;
  completionRate: number;
  totalEmployees?: number;
  totalAssignments?: number;
  periodType?: 'MONTH' | 'RANGE';
  startDate?: string;
  endDate?: string;
  totalHours?: number;
  createdAt: string | Date | undefined;
  updatedAt: Date;
  status: ScheduleStatus;
  canEdit?: boolean;
    permissions?: {
    edit: boolean;
    generate: boolean;
    publish: boolean;
    send: boolean;
  }
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
  date: string | Date;
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
  siteId: number;
  employeeId: number;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  shift?: string;
  agentType?: string;
  notes?: string;
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

export interface DashboardStats {
  schedulesCount: number;
  employeesCount: number;
  sitesCount: number;
  completionRate: number;
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

export interface ScheduleResponse {
  id: number;
  name: string;
  month: number;
  year: number;
  published: boolean;
  validated: boolean;
  sent: boolean;
  sentAt?: string | null;
  completionRate: number;
  createdAt: string;
  updatedAt: string;

  site: {
    id: number;
    name: string;
    city?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  company: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
  };

  // Clé pour l’UX : permet d'activer/désactiver les actions
  canEdit: boolean;

  // Optionnel selon endpoint (liste: souvent absent)
  assignments?: any[];
}

export interface AssignmentDTO {
  id: number;
  scheduleId: number;

  date: string;                 // "YYYY-MM-DD"
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
  duration: number;             // minutes

  agentType: string;
  shift?: string;
  notes?: string;

  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'PENDING';

  employeeId: number;
  employeeName: string;

  siteId: number;
  siteName?: string;

  absence?: boolean;
  absenceType?: string;
}
export interface ScheduleException {
  id: number;
  type: 'ADD' | 'CLOSE';           
  startDate: string;              
  endDate: string;              
  daysOfWeek?: string[];           
  agentType?: string;
  startTime?: string;              
  endTime?: string;                
  requiredCount?: number;
}




