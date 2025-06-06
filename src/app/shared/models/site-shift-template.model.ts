import { AgentType } from "./agent-type.model";
import { DayOfWeek } from "./day-of-week.model";

export interface SiteShiftTemplate {
  id: number;
  siteId: number;
  name: string;
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  agents: SiteShiftTemplateAgent[];
}

export interface SiteShiftTemplateAgent {
  agentType: AgentType;
  startTime: string;
  endTime: string;
  requiredCount: number;
  notes?: string;
}
