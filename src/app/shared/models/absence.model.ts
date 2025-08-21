export enum AbsenceType {
  CONGE_PAYE = 'CONGE_PAYE',
  CONGE_SANS_SOLDE = 'CONGE_SANS_SOLDE',
  MALADIE = 'MALADIE',
  ABSENCE_NON_JUSTIFIEE = 'ABSENCE_NON_JUSTIFIEE',
  CONGE_PARENTAL = 'CONGE_PARENTAL',
  AUTRE = 'AUTRE'
}

export interface Absence {
  id: number;
  employeeId: number;
  date: Date;
  type: AbsenceType;
  startDate: Date;
  endDate: Date;
  reason: string;
  comment?: string;
}

export interface SendResult {
  employeeId: number;
  success: boolean;
  error?: string;
}

export interface SendReport {
  results: SendResult[];
  successCount: number;
  failureCount: number;
}
