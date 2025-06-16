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
