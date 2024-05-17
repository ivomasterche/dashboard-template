"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterSchema } from "@/schemas/RegisterSchema";
import { Input } from "@/components/ui/input";
import { registerAction } from "@/actions/userActions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as yup from "yup";
import { FormError } from "@/components/ui/formError";
import { FormSuccess } from "@/components/ui/formSuccess";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export default function RegisterForm() {
  const form = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [serverFormError, setServerFormError] = useState<string | null>(null);
  const [serverFormSuccess, setServerFormSuccess] = useState<string | null>(
    null
  );

  /**
   * Handles the form submission
   * Shows corresponding messages on success or error

   * @param values - The form values
   */
  const onSubmit = (values: yup.InferType<typeof RegisterSchema>) => {
    setServerFormError(null);
    setServerFormSuccess(null);
    startTransition(async () => {
      await registerAction(values)
        .then((res) => {
          if (!res.success) {
            setServerFormError(res.message!); //receives meaningfull message from action
          } else {
            setServerFormSuccess(
              "User created. Check your email for verification link."
            );
          }
        })
        .catch((err) => {
          setServerFormError("Something went wrong. Please try again later"); //mascarades server errors not needed by the visitor
        });
    });
  };

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <h1 className={"text-2xl font-semibold"}>Register</h1>
        <p className="text-muted-foreground">Create a new account</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        placeholder="Name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.name?.message}
                    </FormMessage>
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
                        placeholder="Email@domain.com"
                        type="email"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.email?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="password"
                        placeholder="********"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.password?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormError message={serverFormError} />
            <FormSuccess message={serverFormSuccess} />
            <Button
              size={"lg"}
              className="w-full"
              type="submit"
              disabled={isPending}
            >
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          size={"lg"}
          className="w-full"
          disabled={isPending}
          variant="outline"
          onClick={() => {
            signIn("google", { callbackUrl: DEFAULT_LOGIN_REDIRECT });
          }}
        >
          <FcGoogle className="me-3 h-5 w-5" /> Sign in with Google
        </Button>
      </CardFooter>
      <CardFooter>
        <Button
          size={"lg"}
          className="w-full"
          variant="link"
          disabled={isPending}
        >
          <Link href="/auth/login"> Log in </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
