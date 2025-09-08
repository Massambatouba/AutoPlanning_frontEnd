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

export type weeklyDay =
| 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
| 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type agentKind = 
| 'ADS' | 'SSIAP1' | 'SSIAP2' | 'SSIAP3' 
| 'CHEF_DE_POSTE' | 'CHEF_DE_EQUIPE' | 'RONDE' | 'ASTREINTE' | 'FORMATION';

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
