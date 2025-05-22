export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  companyId?: number;
  position?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}