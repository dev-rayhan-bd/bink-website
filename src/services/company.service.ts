"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { buildQueryString } from "@/lib/buildQueryString";
import { createMultipartBody } from "@/lib/createMultipartBody";
import { nextServerFetch } from "@/lib/nextServerFetch";
import type { ApiResponse } from "@/lib/types/api.type";
import type {
  CompanyPayload,
  Company,
  CompanyListData,
  PublicCompanyDropdownItem,
  CompanyStatus,
  UpdateCompanyBrandingPayload,
  CompanyAnalytics,
} from "@/lib/types/company.type";
import type { TQuery } from "@/lib/types/global.type";

export const createCompany = async <T = unknown>(payload: CompanyPayload) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    "/company/create-company",
    {
      method: "POST",
      body: payload,
    },
  );
  if (response && response.success) {
    updateTag("companies");
  }
  return response;
};

export const getCompanies = async (params: TQuery = {}) =>
  nextServerFetch<ApiResponse<CompanyListData>>(
    `/company${buildQueryString(params)}`,
    {
      next: { tags: ["companies"] },
    },
  );

export const getCompanyDropdown = async (params: TQuery = {}) =>
  nextServerFetch<ApiResponse<PublicCompanyDropdownItem[]>>(
    `/company/dropdown${buildQueryString(params)}`,
    {
      cache: "no-store",
    },
  );

export const getPublicCompanyDropdown = async () =>
  nextServerFetch<ApiResponse<PublicCompanyDropdownItem[]>>(
    "/company/dropdown",
    {
      auth: "none",
      cache: "no-store",
    },
  );

export const getCompany = async (companyId: string) =>
  nextServerFetch<ApiResponse<Company>>(`/company/${companyId}`, {
    auth: "optional",
    next: { tags: ["companies", `company-${companyId}`] },
  });

export const getCompanyAnalytics = async (companyId: string) =>
  nextServerFetch<ApiResponse<CompanyAnalytics>>(
    `/company/${companyId}/details`,
    {
      next: { tags: ["companies", `company-${companyId}-analytics`] },
    },
  );

export const updateCompany = async <T = unknown>(
  companyId: string,
  payload: Partial<CompanyPayload>,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/company/${companyId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
  if (response && response.success) {
    updateTag("companies");
    updateTag(`company-${companyId}`);
  }
  return response;
};

export const updateCompanyStatus = async <T = unknown>(
  companyId: string,
  status: CompanyStatus,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/company/${companyId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
  if (response && response.success) {
    updateTag("companies");
    updateTag(`company-${companyId}`);
  }
  return response;
};

export const updateCompanyBranding = async <T = unknown>(
  companyId: string,
  { data, logo, video }: UpdateCompanyBrandingPayload,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/company/${companyId}/branding`,
    {
      method: "PATCH",
      body: createMultipartBody(data, { logo, video }),
    },
  );
  if (response && response.success) {
    updateTag("companies");
    updateTag(`company-${companyId}`);
  }
  return response;
};

export const deleteCompany = async <T = unknown>(companyId: string) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/company/${companyId}`,
    {
      method: "DELETE",
    },
  );
  if (response && response.success) {
    updateTag("companies");
    updateTag(`company-${companyId}`);
  }
  return response;
};

export const downloadCompanyReport = async (companyId: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/company/${companyId}/download-report`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download report");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
};
