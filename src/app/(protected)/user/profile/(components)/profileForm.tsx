"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IUserInfo } from "@/types";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ProfileUpdateSchema } from "@/schemas/ProfileUpdateSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { use, useEffect, useState, useTransition } from "react";
import { SelfProfileUpdateAction } from "@/actions/userActions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/ui/formError";
import { FormSuccess } from "@/components/ui/formSuccess";
import { useSession } from "next-auth/react";

type ProfileFormProps = {
  initialUser: IUserInfo;
};

export default function ProfileForm(props: ProfileFormProps) {
  const { initialUser } = props;
  const { update, data: session } = useSession();
  const [isOAuthUser, setIsOAuthUser] = useState(initialUser.isOAuthUser);
  const [user, setUser] = useState<IUserInfo>(initialUser);

  const form = useForm({
    resolver: yupResolver(ProfileUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      isOAuthUser: user.isOAuthUser ? "1" : "0",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [serverFormError, setServerFormError] = useState<string | null>(null);
  const [serverFormSuccess, setServerFormSuccess] = useState<string | null>(
    null
  );

  /**
   * Update the isOAuthUser state when the session is updated
   */
  useEffect(() => {
    if (session?.user) {
      setIsOAuthUser(session?.user?.isOAuthUser ? true : false);
    }
  }, [session]);

  /**
   * Handles the form submission
   *    -if the form submission is successful, the user and the session are updated, and the server form success is set
   *   -if the form submission is unsuccessful, the server form error is set
   * @param values - The form values
   *
   *
   */
  const onSubmit = (values: yup.InferType<typeof ProfileUpdateSchema>) => {
    setServerFormError(null);
    setServerFormSuccess(null);

    startTransition(async () => {
      await SelfProfileUpdateAction(values, user.email, user.isOAuthUser)
        .then((res) => {
          if (!res.success) {
            setServerFormError(res.message!); //receives meaningfull message from action
          } else {
            update(); // Update the session
            setUser({
              name: values.name,
              email: values.email ? values.email : user.email,
              isOAuthUser: values.isOAuthUser === "1" ? true : false,
              role: user.role,
            });
            if (initialUser.email !== values.email) {
              setServerFormSuccess(
                "Profile update successful. Youshould verify your new email before next login"
              );
            } else {
              setServerFormSuccess("Profile update successful");
            }
          }
        })
        .catch((error) => {
          setServerFormError("Something went wrong. Please try again later"); //mascarades server errors not needed by the visitor
        });
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter your name"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isPending || isOAuthUser}
                  />
                </FormControl>
                {isOAuthUser && (
                  <FormDescription>
                    This email is used for OAuth. If you would like to change
                    it, disable OAuth first.
                  </FormDescription>
                )}
                <FormMessage>
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isOAuthUser"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    id="isOAuthUserHidden"
                    type="hidden"
                    value={user.isOAuthUser ? 1 : 0}
                    disabled={isPending || user.isOAuthUser}
                  />
                </FormControl>

                <FormMessage>
                  {form.formState.errors.isOAuthUser?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormError message={serverFormError} />
          <FormSuccess message={serverFormSuccess} />
          <Button className="ml-auto">Save Changes</Button>
        </form>
      </Form>
    </>
  );
}
