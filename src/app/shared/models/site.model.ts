export interface Site {
  id: number;
  companyId: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}