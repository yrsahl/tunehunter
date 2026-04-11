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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import { api } from "@/lib/api";
import { RegisterSchema } from "@/server/api/schemas/account-schemas";
import { growIn } from "@/styles/animations";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/plausible";
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
  setEmail: (email: string) => void;
  menuState: MenuState;
  setMenuState: (menuState: MenuState) => void;
}

const RegisterForm: FC<IProps> = ({ email, setEmail, menuState, setMenuState }) => {
  const { region, createRegionName, sortedRegions } = useRegionSettings();
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
      region: region,
    },
  });

  useEffect(() => {
    form.reset({ email, name: "", region });
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
              trackEvent("Sign Up");
              setSuccess(RegisterResponseMap.success);
              setAccountCreated(true);
              setEmail(values.email);
              signIn("email", { email: values.email, redirect: false });
              setTimeout(() => setMenuState(MenuState.MagicLinkSent), 3000);
            }
          },
          onError: (error) => setError(error.message),
        },
      );
    });
  };

  return (
    <AuthCard title="Create account" size="default">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-8">
          <div className="flex flex-col space-y-4">
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
                      className="border-2 border-primary text-sm placeholder:text-muted-foreground focus-visible:ring-primary md:text-base"
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
                      className="border-2 border-primary text-sm placeholder:text-muted-foreground focus-visible:ring-primary md:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal">Region</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="region" className="h-10 border-2 border-primary">
                        <motion.div
                          key={field.value}
                          {...growIn()}
                          className="inline-block overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base"
                        >
                          <SelectValue />
                        </motion.div>
                      </SelectTrigger>
                      <SelectContent className="border-foreground/30">
                        {sortedRegions.priority.map((region) => (
                          <SelectItem key={region} value={region}>
                            {createRegionName(region)}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                        {sortedRegions.rest.map((region) => (
                          <SelectItem key={region} value={region}>
                            {createRegionName(region)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
          </div>

          <div className="flex w-full flex-col items-center gap-1">
            <IconButton
              type="submit"
              text={accountCreated ? "Sending link..." : "Create account"}
              disabled={isPending || accountCreated}
              icon="signUp"
              size="lg"
              variant="primary"
            />
            <Button
              variant="link"
              onClick={() => setMenuState(MenuState.SignIn)}
              className="border-0 font-thin uppercase text-foreground"
            >
              Back
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
};

export default RegisterForm;
