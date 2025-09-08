import { DayOfWeek } from './day-of-week.model';
import { AgentType } from './agent-type.model';

export type WeeklyExceptionType = 'CLOSE_DAY' | 'ADD_SHIFT' | 'MASK_SHIFT' | 'REPLACE_DAY';

export interface SiteWeeklyException {
  id: number;
  siteId: number;
  type: WeeklyExceptionType;

  startDate: string; // 'YYYY-MM-DD'
  endDate:   string; // 'YYYY-MM-DD'
  daysOfWeek?: DayOfWeek[];

  // Spécifique shift (ADD/MASK/REPLACE)
  agentType?: AgentType;
  startTime?: string; // 'HH:mm'
  endTime?:   string; // 'HH:mm'
  requiredCount?: number;
  minExperience?: number;
  requiredSkills?: string[]; // stockées CSV dans le form

  createdAt?: string;
  updatedAt?: string;
}

export type SiteWeeklyExceptionRequest =
  Omit<SiteWeeklyException,'id'|'siteId'|'createdAt'|'updatedAt'>;
