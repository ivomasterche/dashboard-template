"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IActionResponce, IUserInfo } from "@/types";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useTransition } from "react";
import { PasswordChangeAction } from "@/actions/userActions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/ui/formError";
import { FormSuccess } from "@/components/ui/formSuccess";
import { PasswordChangeSchema } from "@/schemas/PasswordChangeSchema";
import { useSession } from "next-auth/react";

type ProfileFormProps = {
  initialDbUser: IUserInfo;
};

export default function PasswordForm(props: ProfileFormProps) {
  const { initialDbUser } = props;
  const { update, data: session } = useSession();
  const form = useForm({
    resolver: yupResolver(PasswordChangeSchema),
    defaultValues: {
      currentPassword: "********",
      password: "",
      confirmPassword: "",
      isOAuthUser: initialDbUser.isOAuthUser,
      hasPassword: initialDbUser.hasPassword! ? "1" : "0",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [serverFormError, setServerFormError] = useState<string | null>(null);
  const [serverFormSuccess, setServerFormSuccess] = useState<string | null>(
    null
  );
  const [dbUser, setDbUser] = useState<IUserInfo>(initialDbUser);

  /**
   * Handles the form submission
   *    -if the form submission is successful, the form is reset, the session is updated
   *   -if the form submission is unsuccessful, the server form error is set
   * @param values - The form values
   *
   *
   */

  const onSubmit = (values: yup.InferType<typeof PasswordChangeSchema>) => {
    setServerFormError(null);
    setServerFormSuccess(null);
    startTransition(async () => {
      await PasswordChangeAction(values, dbUser.email)
        .then(async (res) => {
          if (!res.success) {
            setServerFormError(res.message!);
          } else {
            await update(); // Update the session
            const user = res.data;
            setDbUser(user);
            setServerFormSuccess("Profile update successful");
            form.reset({
              currentPassword: "********",
              password: "",
              confirmPassword: "",
              isOAuthUser: user.isOAuthUser,
              hasPassword: user.hasPassword ? "1" : "0",
            });
          }
        })
        .catch((error) => {
          setServerFormError("An error occurred. Please try again.");
        });
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {dbUser.hasPassword && (
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="currentPassword">
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="currentPassword"
                      type="password"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.currentPassword?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="hasPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    id="hasPassword"
                    type="hidden"
                    disabled={isPending}
                    value={dbUser.hasPassword ? "1" : "0"}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.hasPassword?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">New Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.password?.message}
                </FormMessage>
              </FormItem>
            )}
          />{" "}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirmPassword">
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.confirmPassword?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          {dbUser.isOAuthUser && (
            <FormField
              control={form.control}
              name="isOAuthUser"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg  border p-3 shadow sm">
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="isOAuthUser">Use OAuth</FormLabel>
                    <FormDescription>
                      {!dbUser.hasPassword ? (
                        <>
                          To be able to remove the OAuth login you should create
                          a password above.
                        </>
                      ) : (
                        <>
                          {" "}
                          If you remove the OAuth connection, the link between
                          your account and the OAuth provider will be deleted.
                          You will still be able to log in with your
                          credentials. If you would like to use OAuth provider
                          again later, just click on the corresponding provider
                          on the login form.
                        </>
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="isOAuthUser"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending || !dbUser.hasPassword}
                    />
                  </FormControl>

                  <FormMessage>
                    {form.formState.errors.isOAuthUser?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          )}
          <FormError message={serverFormError} />
          <FormSuccess message={serverFormSuccess} />
          <Button className="ml-auto">Save Changes</Button>
        </form>
      </Form>
    </>
  );
}
