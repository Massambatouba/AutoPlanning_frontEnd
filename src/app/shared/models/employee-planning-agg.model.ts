import { EmployeeAssignmentDTO } from "./employee.model";

export interface EmployeeMonthlyPlanningDTO {
  employeeId: number;
  year: number;
  month: number;             
  scheduleIds: number[];     
  assignments: {
    id: number;
    siteId: number;
    siteName: string;
    date: string;             
    startTime: string;       
    endTime: string;        
    agentType: string;
    shift?: string;
    notes?: string;
    absence?: boolean;
    absenceType?: string;
  }[];
  // pour accélérer ton affichage en grille
  calendar: Record<string, EmployeeAssignmentDTO[]>; 
  schedules: Array<{
    scheduleId: number;
    siteId: number;
    siteName: string;
  }>;
}

export interface EmployeeMonthlySummary {
  year: number;
  month: number;
  scheduleIds: number[];
  totalAssignments: number;
  totalMinutes: number;
}