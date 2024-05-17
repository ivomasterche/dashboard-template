import { auth } from "@/auth";
import { IUserInfo } from "@/types";

export const getCurrentUserFromSession = async () => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userPlainObject: IUserInfo = {
    name: session.user.name!,
    email: session.user.email!,
    image: session.user.image,
    role: session.user.role,
    isOAuthUser: session.user.isOAuthUser,
  };
  return userPlainObject;
};
