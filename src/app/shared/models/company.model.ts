import { Site } from "./site.model";

export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  subscriptionExpiresAt?: Date;
  maxEmployees: number;
  maxSites: number;
  createdAt: Date;
  sites?: Site[];
  updatedAt: Date;
}

export interface Notification {
  id: number;             
  message: string;
  icon: string;              
  createdAt: string;             
}

export interface CreateCompanyPayload {
  companyName: string;
  address?: string;
  phone?: string;
  email: string;
  website?: string;
  subscriptionPlanId: number;
  adminFirstName: string;
  adminLastName: string;
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
}

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  maxEmployees: number;
  maxSites: number;
}
