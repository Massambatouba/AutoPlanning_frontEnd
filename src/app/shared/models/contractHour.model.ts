export interface ContractHourRequirement {
   id: number;
    companyId: number;
    contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
    minimumHoursPerMonth: number;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContractHourRequirementRequest {
contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
minimumHoursPerMonth: number;
description?: string;
}

export interface EmployeeHoursSummary {
employeeId: number;
employeeName: string;
contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
requiredHours: number;
actualHours: number;
missingHours: number;
isCompliant: boolean;
compliancePercentage: number;
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
