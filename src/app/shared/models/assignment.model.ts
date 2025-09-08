export interface AssignmentDTO {
  id: number;
  scheduleId: number;

  // toujours présent dans ton DTO Java
  date: string;                 // "YYYY-MM-DD"
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
  duration: number;             // minutes

  agentType: string;
  shift?: string;
  notes?: string;

  status: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'PENDING';

  // références (pas d'objet imbriqué "employee")
  employeeId: number;
  employeeName: string;

  siteId: number;
  siteName?: string;

  // absences (si le back les mappe dans le DTO)
  absence?: boolean;
  absenceType?: string;
}