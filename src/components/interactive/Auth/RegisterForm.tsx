import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/schemas";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useEffect, useState, useTransition, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import IconButton from "../../IconButton";
import AuthCard from "./AuthCard";
import { MenuState } from "./AuthMenu";
import FormError from "./FormError";
import FormSuccess from "./FormSuccess";

const RegisterResponseMap = {
  errors: {
    GENERAL_ERROR:
      "Something went wrong on our side and were unable to create an account for you, sorry! Please try again later.",
    INVALID_FIELDS: "Please check your input!",
    ACCOUNT_ALREADY_EXISTS: "An account with this mail already exists!",
    USERNAME_ALREADY_EXISTS: "An account with this username already exists!",
  } as const,
  success: "Account successfully created!",
} as const;
export type RegisterErrorCode = keyof (typeof RegisterResponseMap)["errors"];

interface IProps {
  email: string;
  menuState: MenuState;
  setMenuState: (menuState: MenuState) => void;
}

const RegisterForm: FC<IProps> = ({ email, menuState, setMenuState }) => {
  const [accountCreated, setAccountCreated] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const createAccount = api.user.createAccount.useMutation();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: email,
      name: "",
    },
  });

  useEffect(() => {
    form.setValue("email", email);
    setError("");
    setSuccess("");
    setAccountCreated(false);
  }, [menuState]);

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      createAccount.mutate(
        { ...values },
        {
          onSettled: (data) => {
            if (data?.error) setError(RegisterResponseMap.errors[data.error]);
            if (data?.success) {
              setSuccess(RegisterResponseMap.success);
              setAccountCreated(true);
              signIn("email", { email: values.email, redirect: false });
            }
          },
          onError: (error) => setError(error.message),
        },
      );
    });
  };

  return (
    <AuthCard title="Registration" size="small">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-12">
          <div className="flex flex-col space-y-6">
            {/* TODO: Add avatar */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal">Mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="john.doe@example.com"
                      type="email"
                      className="border-2 border-primary text-base placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal">User name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="TrebleMaker"
                      type="text"
                      disabled={isPending}
                      className="border-2 border-primary text-base placeholder:text-muted-foreground focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
          </div>

          <div className="m-auto w-4/5">
            {!accountCreated && (
              <div className="flex flex-col items-center gap-2">
                <IconButton
                  type="submit"
                  text="Register"
                  disabled={isPending}
                  icon="signUp"
                  size="default"
                  variant="primary"
                />
                <Button variant="link" onClick={() => setMenuState(MenuState.SignIn)}>
                  Return to Sign In page
                </Button>
              </div>
            )}
            {!!accountCreated && (
              <IconButton
                text="Continue"
                onClick={() => setMenuState(MenuState.MagicLinkSent)}
                variant="primary"
              />
            )}
          </div>
        </form>
      </Form>
    </AuthCard>
  );
};

export default RegisterForm;
