import { AgentType } from "./agent-type.model";
import { DayOfWeek } from "./day-of-week.model";




export interface WeeklyScheduleRule {
  forEach(arg0: (rule: { dayOfWeek: DayOfWeek; minEmployees: any; maxEmployees: any; minExperienceLevel: any; requiresNightShift: any; requiresWeekendCoverage: any; requiredSkills: any; agents: { agentType: any; startTime: any; endTime: any; requiredCount: any; notes: any; }[]; }) => void): unknown;
  id: number;
  siteId: number;
  dayOfWeek: DayOfWeek;
  minEmployees: number;
  maxEmployees: number;
  minExperienceLevel: number;
  requiresNightShift: boolean;
  requiresWeekendCoverage: boolean;
  requiredSkills: string[];
  agents: AgentSchedule[];
  name?: string;
  active: boolean;
  description?: string;
}

// weekly-schedule-rule-request.model.ts
export interface WeeklyScheduleRuleRequest {
  name: string;
  dayOfWeek: string; 
  description?: string;
  agents: {
    agentType: string;     
    startTime: string;        
    endTime: string;          
    requiredCount: number;
    notes?: string;
  }[];
}


export interface AgentSchedule {
  agentType: AgentType;
  startTime: string;
  endTime: string;
  requiredCount: number;
  notes?: string;
}
