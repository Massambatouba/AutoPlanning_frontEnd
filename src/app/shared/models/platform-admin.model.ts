export interface PlatformStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface CompanyOverview {
  id: number;
  name: string;
  email: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'EXPIRED';
  subscriptionPlan?: 'STARTER' | 'PRO' | 'ENTERPRISE';
  subscriptionPlanId?: number | null;
  subscriptionPlanName: string | null
  monthlyRevenue: number;
  employeesCount: number;
  sitesCount: number;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  maxEmployees: number;
  maxSites: number;
  features: string[];
  isPopular?: boolean;
}

export interface RevenueData {
  month: string;
  revenue: number;
  newCompanies?: number;
  churnedCompanies?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages?: number;
  number?: number;
  size?: number;
}
