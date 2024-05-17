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
import { useCallback, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { verifyUserAction } from "@/actions/userActions";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { VerificationTokenSchema } from "@/schemas/VerificationTokenSchema";
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

export default function NewVerificationForm() {
  const urlParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const token = urlParams.get("token");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [verificationSuccess, setVerificationSuccess] =
    useState<boolean>(false);

  const form = useForm({
    resolver: yupResolver(VerificationTokenSchema),
    defaultValues: {
      token: "",
    },
  });

  /**
   * Handles the form auto submission, does not create a new function on each render
   * Shows corresponding messages on success or error
   * @param values - The form values
   *
   */
  const autoSubmit = useCallback(async () => {
    if (token) {
      await verifyUserAction({ token: token })
        .then(() => {
          setVerificationSuccess(true);
        })
        .catch((error) => {
          setVerificationError(error.message);
        });
    }
  }, [token]);
  /**
   * if token is present in the params, auto submit the form and verify the user
   */

  useEffect(() => {
    if (token) {
      autoSubmit();
    }
  }, [token, autoSubmit]);

  /**
   * Handles the form submission
   * Shows corresponding messages on success or error
   * @param values - The form values
   */
  const onSubmit = (values: yup.InferType<typeof VerificationTokenSchema>) => {
    setVerificationError(null);
    startTransition(async () => {
      await verifyUserAction(values)
        .then((res) => {
          if (!res.success) {
            setVerificationError(res.message!); //receives meaningfull message from action
          } else {
            setVerificationSuccess(true);
          }
        })
        .catch((error) => {
          setVerificationError("Something went wrong. Please try again later"); //mascarades server errors not needed by the visitor
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <h1 className={"text-2xl font-semibold"}> Verify your account</h1>
        <p className="text-muted-foreground">
          {token
            ? "We are verifying your account. Please wait."
            : " Enter the verification code sent to your email."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationSuccess ? (
          <FormSuccess message="User verified" />
        ) : token || isPending ? (
          <>
            {verificationError ? (
              <FormError message={verificationError} />
            ) : (
              <div className="flex justify-center py-7">
                <PropagateLoader />
              </div>
            )}
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="token"> Verification token</FormLabel>
                      <FormControl>
                        <Input
                          className="mt-1"
                          id="token"
                          placeholder="Enter token"
                          type="text"
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
              </div>

              <Button className="w-full" disabled={isPending}>
                Verify
              </Button>
              <FormError message={verificationError} />
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size={"lg"}
          className="w-full p-0"
          variant="link"
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
