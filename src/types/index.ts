export enum UserRole {
  USER = "User",
  ADMIN = "Admin",
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  verified?: Date | null;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  image?: string | null;
  isOAuthUser: boolean;
  hasPassword?: boolean;
}

export interface IUserInfo {
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  isOAuthUser: boolean;
  hasPassword?: boolean;
}

export interface INewUser {
  email: string;
  name: string;
  password?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}

export interface IActionResponce {
  success: boolean;
  message?: string;
  data?: any;
  unauthorized?: boolean;
}
