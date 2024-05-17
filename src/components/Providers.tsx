"use server";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import type { FC, ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = async ({ children }) => {
  const session = await auth();
  if (session?.user) {
    session.user = {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
      isOAuthUser: session.user.isOAuthUser,
    };
  }
  return (
    <>
      <SessionProvider session={session}>{children}</SessionProvider>
    </>
  );
};

export default Providers;
