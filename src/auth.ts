"use server ";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import {
  authorizeUserAction,
  verifyLinkedUserAction,
} from "@/actions/userActions";
import { getUserById } from "./dataAccess/user";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { url } from "inspector";
import { DEFAULT_LOGIN_REDIRECT } from "./routes";

export const { handlers, signIn, signOut, auth } = NextAuth({
  events: {
    async linkAccount({ user }) {
      if (user.email) {
        await verifyLinkedUserAction({ email: user.email }).catch((error) => {
          console.log("Error verifying linked user", error);
        });
      }
    },
  },
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      async authorize(
        credentials: Partial<Record<string, unknown>>,
        request: Request
      ) {
        let user;
        try {
          user = await authorizeUserAction(credentials).then((res) => {
            if (!res.success) {
              return null;
            }
            return res.data;
          });
        } catch (error) {
          console.log("Error authorizing user", error);
          return null;
        }

        return user;
      },
    }),
    ...authConfig.providers,
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      if (!user?.id) {
        return false;
      }
      const existingUser = await getUserById(user?.id);
      if (!existingUser?.verified) {
        return false;
      }
      return true;
    },

    async jwt({ token }) {
      if (token.sub) {
        const user = await getUserById(token.sub);
        if (!user) {
          return null;
        }
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.isOAuthUser = user.isOAuthUser;
      }
      return token;
    },
    async session({ token, session }) {
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.isOAuthUser !== undefined && session.user) {
        session.user.isOAuthUser = token.isOAuthUser;
      }
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email!;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
