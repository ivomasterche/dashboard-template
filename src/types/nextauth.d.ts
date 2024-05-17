import { UserRole } from "@/types";
import NextAuth, { DefaultSession } from "next-auth";
import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session {
    user: {
      role: UserRole;
      isOAuthUser: boolean;
    } & DefaultSession["user"];
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    role?: UserRole;
    isOAuthUser?: boolean;
  }
}
