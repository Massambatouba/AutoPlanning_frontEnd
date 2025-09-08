// shared/models/employee-documents.model.ts
export type EmployeeDocumentCategory = 'IDENTITE' | 'DIPLOME';

export type EmployeeDocumentType =
  // Identité
  | 'ID_CARD' | 'PASSPORT' | 'TITRE_SEJOUR'
  // Diplômes / cartes pro
  | 'CQP' | 'SSIAP1' | 'SSIAP2' | 'SSIAP3' | 'SST' | 'CARTE_PRO';

export type EmployeeDocumentStatus = 'VALID' | 'EXPIRED' | 'UNKNOWN';

export interface EmployeeDocument {
  id: number;
  employeeId?: number;
  category: EmployeeDocumentCategory;
  type: EmployeeDocumentType;
  number?: string;
  // Ton backend envoie `expiryDate`. On garde `expiresAt` en option pour l’UI,
  // mais on mappe expiryDate -> expiresAt quand on reçoit la réponse.
  expiresAt?: string;      // "YYYY-MM-DD" (frontend)
  fileUrl?: string;
  status?: EmployeeDocumentStatus;
  required?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeEligibility {
  allowed: boolean;
  identityOk: boolean;
  proOk: boolean;
  problems: string[];
  nextExpiry?: string;
  daysLeft: number;
  missingRequired?: EmployeeDocumentType[];
  expiringWithinDays?: { type: EmployeeDocumentType; days: number }[];
}
