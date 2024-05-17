"use server";
import { getCurrentUserFromSession } from "@/lib/currentUser";
import { UserRole } from "@/types";
import type { FC, ReactNode } from "react";
import Unauthorized from "./ui/unauthorized";
import ErrorBlock from "./ui/errorBlock";

interface RoleCheckerProps {
  children: ReactNode;
  requiredRole: UserRole;
}

/**
 * Prevents users from accessing a page if they do not have the required role
 */
const RoleChecker = async ({ children, requiredRole }: RoleCheckerProps) => {
  try {
    const user = await getCurrentUserFromSession();
    if (!user || user.role !== requiredRole) {
      return <Unauthorized />;
    }
  } catch (error: any) {
    return <ErrorBlock error={error.message} text={""} />;
  }
  return <>{children}</>;
};

export default RoleChecker;
