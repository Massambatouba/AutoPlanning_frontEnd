export interface Schedule {
  id: number;
  companyId: number;
  siteId: number;
  name: string;
  month: number;
  year: number;
  isPublished: boolean;
  startDate: string;
  endDate: string;
  isSent: boolean;
  sentAt?: Date;
  createdBy?: string;
  completionRate: number;
  createdAt: string | Date | undefined;
  updatedAt: Date;
  status: ScheduleStatus;

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
  shift?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
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
