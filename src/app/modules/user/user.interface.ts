import { userRole } from "./user.const";

type TUserRoles =
  | "customer"
  | "vendor"
  | "sr"
  | "seller"
  | "vendor-staff"
  | "admin"
  | "admin-staff"
  | "super-admin";

type TGender = "male" | "female" | "other";

type TUserStatus = "active" | "pending" | "blocked";

export interface IAuthProvider {
  provider: string;
  providerId: string;
}
export type TAddress = {
  type?: "billing" | "shipping";
  title?: string;
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  street?: string;
  union?: string;
  thana?: string;
  district?: string;
};

export type TUser = {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  isEmailVerified?: boolean;
  image?: string;
  role?: TUserRoles;
  gender?: TGender;
  contactNo?: string;
  bio?: string;
  address?: TAddress;
  status?: TUserStatus;
  walletPoint?: number;
  commissionBalance?: number;
  socials?: string[];
  cardInfo?: null;
  auths: IAuthProvider[];
};

export type TUserRole = keyof typeof userRole;
