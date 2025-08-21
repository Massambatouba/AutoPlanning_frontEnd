export interface AdminCmd {
  firstName: string;
  lastName:  string;
  email:     string;
  tempPassword: string;

  companyId: number;

  allSites: boolean;
  siteIds: number[];
}
