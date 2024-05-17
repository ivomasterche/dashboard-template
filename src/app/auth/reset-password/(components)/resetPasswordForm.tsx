"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { ResetPasswordAction } from "@/actions/userActions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { EmailSchema } from "@/schemas/EmailSchema";

export default function ResetPasswordForm() {
  const form = useForm({
    resolver: yupResolver(EmailSchema),
    defaultValues: {
      email: "",
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
   *
   * @param values - The form values
   */
  const onSubmit = (values: yup.InferType<typeof EmailSchema>) => {
    setServerFormError(null);
    setServerFormSuccess(null);
    startTransition(async () => {
      await ResetPasswordAction(values)
        .then((res) => {
          if (!res.success) {
            setServerFormError(res.message!); //receives meaningfull message from action
          } else {
            setServerFormSuccess(
              "Reset successful, please check your email for the link"
            );
          }
        })
        .catch((error) => {
          setServerFormError("Something went wrong. Please try again later"); //mascarades server errors not needed by the visitor
        });
    });
  };

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <h1 className={"text-2xl font-semibold"}>Password reset</h1>
        <p className="text-muted-foreground">Reset your password</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
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
            </div>
            <FormError message={serverFormError} />
            <FormSuccess message={serverFormSuccess} />
            <Button
              size={"lg"}
              className="w-full"
              type="submit"
              disabled={isPending}
            >
              Reset
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
