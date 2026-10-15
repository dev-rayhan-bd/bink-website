import type { ProfilePayload } from "./api.type";
import type { CompanyBranding } from "./company.type";
import type { TMeta } from "./global.type";

export type BaseUser = {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyId: string;
  teamId: string;
  authType: string;
  branding: CompanyBranding;
  email?: string;
  phone?: string;
  image?: string;
};

export type EmployeeProfile = BaseUser & {
  role: "user";
  email: string;
  phone?: string;
  image: string;
  employeeId: string;
  status: string;
  address?: string;
  isOtpVerified: boolean;
  isDeleted: boolean;
  fcmToken?: string | null;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type GuestProfile = BaseUser & {
  role: "guest";
};

export type AdminProfile = BaseUser & {
  role: "superAdmin" | "admin" | "company";
  email: string;
  phone?: string;
  image?: string;
};

export type CurrentUser = EmployeeProfile | GuestProfile | AdminProfile;

export type UpdateUserProfilePayload = {
  data: ProfilePayload;
  image?: Blob;
};

export type UserAccount = {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  image: string;
  email: string;
  authType: string;
  role: string;
  companyId: string;
  status: string;
  isOtpVerified: boolean;
  isDeleted: boolean;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserListData = {
  meta: TMeta;
  result: UserAccount[];
};

export type CompanyUser = {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  image: string;
  email: string;
  authType: string;
  role: string;
  companyId: string;
  teamId: string;
  employeeId?: string;
  guestId?: string;
  status: string;
  address: string;
  isOtpVerified: boolean;
  isDeleted: boolean;
  fcmToken: string | null;
  branding: CompanyBranding;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
};

export type CompanyUserListData = {
  meta: TMeta;
  result: CompanyUser[];
};
