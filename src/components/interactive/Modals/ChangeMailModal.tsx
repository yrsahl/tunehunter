import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import useVerificationToken from "@/lib/generators/verification-token";
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { ConfirmMailSchema, VerificationCodeSchema } from "@/server/api/schemas/account-schemas";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormError from "../Auth/FormError";

interface ChangeMailDialogProps {
  children: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ChangeMailModal = ({ children, open, setOpen }: ChangeMailDialogProps) => {
  const [formStatus, setFormStatus] = useState<"confirmMail" | "verifyCode">("confirmMail");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const { handleChangeMail } = useProfileFunctions();
  const [userMail, setUserMail] = useState("");
  const { createAndSendVerificationToken, verifyVerificationToken } = useVerificationToken();
  const utils = api.useUtils();
  const confirmMailForm = useForm<z.infer<typeof ConfirmMailSchema>>({
    resolver: zodResolver(ConfirmMailSchema),
  });
  const verificationCodeForm = useForm<z.infer<typeof VerificationCodeSchema>>({
    resolver: zodResolver(VerificationCodeSchema),
  });

  // Watch form values for custom rules
  const email = confirmMailForm.watch("email", "");
  const confirmEmail = confirmMailForm.watch("confirmEmail", "");
  const confirmationCode = verificationCodeForm.watch("verificationCode", "");

  const handleDialogCancel = () => {
    setFormStatus("confirmMail");
    setOpen(false);
    setError("");
  };

  const handleDialogBack = () => {
    setFormStatus("confirmMail");
    setError("");
  };

  const onConfirmMailFormSubmit = async (values: z.infer<typeof ConfirmMailSchema>) => {
    setError("");

    const { confirmEmail, email } = values;

    // Check for email values matching
    if (confirmEmail !== email) {
      setError("Emails do not match");
      return;
    }

    // Check if account exists already
    const account = await utils.user.getUserByEmail.fetch({ email });
    if (account) {
      setError("An account with this mail already exists!");
      return;
    }

    // Create and send token
    startTransition(() => {
      createAndSendVerificationToken(email).then((data) => {
        setError(data.error);
        if (!!data.success) {
          setUserMail(email);
          setFormStatus("verifyCode");
        }
      });
    });
  };

  const onVerificationCodeFormSubmit = (values: z.infer<typeof VerificationCodeSchema>) => {
    setError("");
    startTransition(() => {
      verifyVerificationToken({ email: userMail, confirmEmail: userMail }, values).then((data) => {
        setError(data.error);
        if (!!data.success) handleChangeMail(userMail);
      });
    });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger className="w-full" asChild>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent>
        {formStatus === "confirmMail" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Change your Mail - Step 1 of 2</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter your new mail address and confirm it. We will then send you a
                verification code.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Form {...confirmMailForm}>
              <form
                onSubmit={confirmMailForm.handleSubmit(onConfirmMailFormSubmit)}
                className="m-auto flex w-[90%] flex-col space-y-6"
              >
                <div className="flex flex-col space-y-6">
                  <FormField
                    control={confirmMailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">New mail:</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            className="col-span-2 border-foreground"
                            onKeyDown={(key) => {
                              setError("");
                              if (key.key === "Enter") {
                                confirmMailForm.handleSubmit(onConfirmMailFormSubmit)();
                              }
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={confirmMailForm.control}
                    name="confirmEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-normal">Confirm mail:</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="confirmEmail"
                            type="email"
                            className="col-span-2 border-foreground"
                            onKeyDown={(key) => {
                              setError("");
                              if (key.key === "Enter") {
                                confirmMailForm.handleSubmit(onConfirmMailFormSubmit)();
                              }
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormError message={error} />
              </form>
            </Form>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDialogCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                onClick={confirmMailForm.handleSubmit(onConfirmMailFormSubmit)}
                disabled={!email || !confirmEmail || email !== confirmEmail}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
        {formStatus === "verifyCode" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Change your Mail - Step 2 of 2</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the verification code we sent you.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...verificationCodeForm}>
              <form
                onSubmit={verificationCodeForm.handleSubmit(onVerificationCodeFormSubmit)}
                className="m-auto flex w-[90%] flex-col space-y-6"
              >
                <FormField
                  control={verificationCodeForm.control}
                  name="verificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputOTP {...field} maxLength={6}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="border-foreground" />
                            <InputOTPSlot index={1} className="border-foreground" />
                            <InputOTPSlot index={2} className="border-foreground" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} className="border-foreground" />
                            <InputOTPSlot index={4} className="border-foreground" />
                            <InputOTPSlot index={5} className="border-foreground" />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormError message={error} />
              </form>
            </Form>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDialogBack}>Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={verificationCodeForm.handleSubmit(onVerificationCodeFormSubmit)}
                disabled={confirmationCode.length !== 6}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeMailModal;
