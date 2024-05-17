import ProfileForm from "./(components)/profileForm";
import { getCurrentUserFromSession } from "@/lib/currentUser";
import Unauthorized from "@/components/ui/unauthorized";
import { getSelfUserInfoByEmailAction } from "@/actions/userActions";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { IUserInfo } from "@/types";
import PasswordForm from "./(components)/passwordForm";
import ErrorBlock from "@/components/ui/errorBlock";

export default async function ProfilePage() {
  /**
   * Get the current user from the session
   */
  let sessionUser: IUserInfo | null = null;
  try {
    sessionUser = await getCurrentUserFromSession();
    if (!sessionUser) {
      return <Unauthorized />;
    }
  } catch (error: any) {
    return <ErrorBlock error={error.message} text={""} />;
  }

  /**
   * Get the initial user information from the database, to have access to the user's current information, not available in the session
   */
  let initialDbUser: IUserInfo | undefined;
  try {
    initialDbUser = await getSelfUserInfoByEmailAction(sessionUser.email).then(
      (res) => {
        if (!res.success) {
          if (res.unauthorized) {
            return <Unauthorized />;
          }
          return <ErrorBlock error={res.message} />;
        }
        return res.data;
      }
    );
  } catch (error: any) {
    return (
      <ErrorBlock error={"Something went wrong. Please try again later"} />
    );
  }

  return (
    <div className="container mx-auto my-12 px-4 md:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className=" shadow-md">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileForm initialUser={initialDbUser!} />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PasswordForm initialDbUser={initialDbUser!} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
