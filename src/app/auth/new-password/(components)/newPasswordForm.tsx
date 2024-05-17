"use client";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  Card,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { PropagateLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { newUserPasswordAction } from "@/actions/userActions";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSuccess } from "@/components/ui/formSuccess";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/ui/formError";
import Link from "next/link";
import { NewPasswordSchema } from "@/schemas/NewPasswordSchema";

export default function NewPasswordForm() {
  const urlParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const token = urlParams.get("token");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const form = useForm({
    resolver: yupResolver(NewPasswordSchema),
    defaultValues: {
      token: token ? token : "",
      password: "",
    },
  });

  /**
   *
   * Handles the form submission
   * @param values - The form values
   */
  const onSubmit = (values: yup.InferType<typeof NewPasswordSchema>) => {
    setSubmitError(null);
    startTransition(async () => {
      await newUserPasswordAction(values)
        .then((res) => {
          if (!res.success) {
            setSubmitError(res.message!); //receives meaningfull message from action
          } else {
            setSubmitSuccess(true);
          }
        })
        .catch((error) => {
          setSubmitError("Something went wrong. Please try again later"); //mascarades server errors not needed by the visitor
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <h1 className={"text-2xl font-semibold"}> Reset your password</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    {!token && (
                      <FormLabel htmlFor="token">
                        {" "}
                        Reset password token
                      </FormLabel>
                    )}
                    <FormControl>
                      <Input
                        type={token ? "hidden" : "text"}
                        className="mt-1"
                        id="token"
                        placeholder="Enter token"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.token?.message}
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
                    <Button
                      size={"sm"}
                      variant="link"
                      className="p-0 font-normal"
                      disabled={isPending}
                      asChild
                    >
                      <Link href="/auth/reset-password">Reset password?</Link>
                    </Button>
                  </FormItem>
                )}
              />
            </div>

            <Button className="w-full" disabled={isPending}>
              Submit
            </Button>
            <FormError message={submitError} />
            {submitSuccess && <FormSuccess message="Password updated" />}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          size={"lg"}
          className="w-full p-0"
          variant="outline"
          disabled={isPending}
        >
          <Link href="/auth/login" className="w-full">
            {" "}
            Back to Login{" "}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
