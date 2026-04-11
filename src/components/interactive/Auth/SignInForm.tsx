import IconButton from "@/components/IconButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthError from "@/hooks/useAuthErrors";
import { api } from "@/lib/api";
import { buildRedirectPath } from "@/lib/auth";
import { signIn } from "next-auth/react";
import { trackEvent } from "@/lib/plausible";
import { useEffect, useTransition, type FC, type FormEvent } from "react";
import { toast } from "sonner";
import AuthCard from "./AuthCard";
import { MenuState } from "./AuthMenu";

interface IProps {
  email: string;
  setEmail: (email: string) => void;
  setMenuState: (menuState: MenuState) => void;
}

const SignInForm: FC<IProps> = ({ email, setEmail, setMenuState }) => {
  const utils = api.useUtils();
  const loginError = useAuthError("login");
  const [isPending, startTransition] = useTransition();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (loginError) toast.error(loginError, { dismissible: true, duration: Infinity });
  }, [loginError]);

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const user = await utils.user.getUserByEmail.fetch({ email });

      if (!user) {
        setMenuState(MenuState.Register);
        return;
      }

      const redirectPath = buildRedirectPath();
      const callbackUrl = `/auth_callback/?redirectPath=${encodeURIComponent(redirectPath)}&action=login`;
      const signInPromise = signIn("email", { email, redirect: false, callbackUrl });

      const mailSentPromise = new Promise((resolve, reject) => {
        signInPromise
          .then((response) => (response?.error ? reject(response) : resolve(response)))
          .catch(reject);
      });

      toast.promise(mailSentPromise, {
        loading: "Sending you an e-mail...",
        success: () => {
          trackEvent("Login");
          setMenuState(MenuState.MagicLinkSent);
          return "E-mail with login link has been sent.";
        },
        error: "Failed to send the email. Check the address or try again later.",
      });
    });
  };

  return (
    <AuthCard title="Sign in" size="default">
      <div className=" flex flex-col gap-2">
        <form className="flex w-full flex-col gap-4" onSubmit={handleContinue}>
          <Input
            data-testid="auth-email-input"
            type="email"
            placeholder="you@example.com"
            className="border-[1px] border-foreground placeholder:text-muted-foreground focus-visible:ring-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
          <IconButton
            data-testid="signin-email-button"
            text="Continue"
            icon="arrowRight"
            disabled={!isValidEmail || isPending}
            size="lg"
            variant="primary"
          />
        </form>
        <Button
          variant="link"
          className="-mt-1 border-0 text-xs font-thin uppercase text-foreground"
          onClick={() => setMenuState(MenuState.Register)}
        >
          Create account
        </Button>
      </div>
    </AuthCard>
  );
};

export default SignInForm;
