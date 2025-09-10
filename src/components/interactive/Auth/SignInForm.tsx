import { isCustomIcon } from "@/components/icons";
import { Separator } from "@/components/my-ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthError from "@/hooks/useAuthErrors";
import { type Providers } from "@/interfaces/providers";
import { api } from "@/lib/api";
import { signInWithProvider } from "@/lib/auth";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, type FC, type FormEvent } from "react";
import { toast } from "sonner";
import IconButton from "../../IconButton";
import { MenuState } from "./AuthMenu";

interface IProps {
  email: string;
  setEmail: (email: string) => void;
  setMenuState: (menuState: MenuState) => void;
}

const SignInForm: FC<IProps> = ({ email, setEmail, setMenuState }) => {
  const [providers, setProviders] = useState<Providers>();
  const router = useRouter();
  // const userQuery = api.user.getUser.useQuery({ email }, { enabled: true });
  const utils = api.useUtils();
  const loginError = useAuthError("login");

  const isValidEmail = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  // Get OAuth providers
  useEffect(() => {
    const fetchProviders = async () => {
      const resProviders = await getProviders();
      if (!resProviders) return;
      setProviders(resProviders);
    };

    fetchProviders();
  }, []);

  // Display login error to user
  useEffect(() => {
    if (loginError) toast.error(loginError, { dismissible: true, duration: Infinity });
  }, [loginError]);

  if (!providers) {
    return <></>;
  }

  const OAuthProviders = [providers.spotify];

  const handleSignInWithEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = await utils.user.getUserByEmail.fetch({ email });

    // New user -> Register
    if (!user) {
      setMenuState(MenuState.Register);
      return;
    }

    // Existing user -> Magic Link
    const signInPromise = signIn("email", { email, redirect: false });
    const mailSentPromise = new Promise((resolve, reject) => {
      signInPromise
        .then((response) => {
          if (response?.error) {
            reject(response);
          } else {
            resolve(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
    toast.promise(mailSentPromise, {
      loading: "Trying to send you an e-mail...",
      success: () => {
        setMenuState(MenuState.MagicLinkSent);
        return "An e-mail with a login link has been sent.";
      },
      error: "Failed to send the email. Check the email address or try again later.",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-4" onSubmit={handleSignInWithEmail}>
        <Input
          data-testid="auth-email-input"
          type="email"
          placeholder="xyz@gmail.com"
          className="border-2 border-background placeholder:text-foreground/50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <IconButton
          data-testid="signin-email-button"
          type="submit"
          text="Sign In with E-Mail"
          disabled={!isValidEmail}
          icon="mail"
          size="lg"
        />
      </form>
      <Separator className="border-foreground">
        <p className="px-2 text-xs uppercase">or</p>
      </Separator>
      {OAuthProviders &&
        Object.values(OAuthProviders).map((provider, index) => (
          <div key={provider?.id ?? index}>
            <IconButton
              data-testid={`signin-${provider.id}-button`}
              icon={isCustomIcon(provider.id) ? provider.id : "fallback"}
              text={`Sign In with ${provider.name}`}
              size="lg"
              onClick={() => provider?.id && signInWithProvider(provider.id, router.locale ?? "")}
            />
          </div>
        ))}
      <Button
        variant="link"
        className="-mt-1 border-0 font-thin uppercase text-foreground"
        onClick={() => setMenuState(MenuState.Register)}
      >
        Don't have an account?
      </Button>
    </div>
  );
};

export default SignInForm;
