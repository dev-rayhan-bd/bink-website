import type { TMeta } from "./global.type";

export type CompanyPayload = {
  name: string;
  email: string;
  address: string;
};

export type CompanyBranding = {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  videoTitle: string;
  videoDescription: string;
  presenterName: string;
  presenterDesignation: string;
  videoUrl: string;
};

export type CompanyUserSummary = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: "company" | "user" | string;
  employeeId?: string;
  companyId: string;
  status: string;
};

export type Company = {
  _id: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  image?: string;
  logo?: string;
  email: string;
  authType?: string;
  role?: string;
  status: CompanyStatus;
  slug?: string;
  address?: string;
  isOtpVerified?: boolean;
  isDeleted?: boolean;
  fcmToken?: string | null;
  branding: CompanyBranding;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastActiveAt?: string;
  users?: CompanyUserSummary[];
  companyId?: string;
};

export type CompanyApiItem = Company;

export type CompanyApiListData = {
  meta: TMeta;
  result: Company[];
};

export type CompanyListData = CompanyApiListData;

export type CompanyDropdownItem = {
  _id: string;
  firstName: string;
};

export type PublicCompanyDropdownItem = CompanyDropdownItem;

export type CompanyStatus = "active" | "inactive" | "suspended";

export type CompanyBrandingData = {
  primaryColor?: string;
  secondaryColor?: string;
  videoTitle?: string;
  videoDescription?: string;
  presenterName?: string;
  presenterDesignation?: string;
};

export type UpdateCompanyBrandingPayload = {
  data: CompanyBrandingData;
  logo?: Blob;
  video?: Blob;
};

export type CompanyAnalytics = {
  company: {
    name: string;
    industry: string;
    employeeCount: number;
    memberSince: string;
  };
  stats: {
    activeParticipants: number;
    completionRate: number;
    averageScore?: number;
    organizationGrade: number;
  };
  barChart: {
    averageIncreasePercentage: number;
    assessmentCount: number;
    chartData: Array<{
      name: string;
      baseline: number;
      followUp: number;
      score: number;
    }>;
  };
  teamPerformance: Array<{
    teamId: string;
    teamName: string;
    activeCount: number;
    progressPercentage: number;
    averageScore: number;
  }>;
  moduleCompliance: Array<{
    moduleId: string;
    moduleName: string;
    teamId: string;
    teamName: string;
    completionPercentage: number;
    completedCount: number;
    totalAssigned: number;
  }>;
};


