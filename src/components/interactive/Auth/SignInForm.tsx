import { Separator } from "@/components/my-ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isCustomIcon } from "@/helpers/custom-icons";
import { signInWithProvider } from "@/helpers/sign-in";
import useAuthError from "@/hooks/useAuthErrors";
import { type Providers } from "@/interfaces/providers";
import { api } from "@/utils/api";
import { getProviders, signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation("");
  const [providers, setProviders] = useState<Providers>();
  const router = useRouter();
  // const userQuery = api.user.getUser.useQuery({ email }, { enabled: true });
  const utils = api.useUtils();
  const loginError = useAuthError("login");

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
  const getSignInWithProviderText = (provider: string) =>
    t("auth.signIn.withProvider", { provider });

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
      loading: t("toast.mail.loading"),
      success: () => {
        setMenuState(MenuState.MagicLinkSent);
        return t("toast.mail.successLogin");
      },
      error: t("toast.mail.error"),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-col gap-4" onSubmit={handleSignInWithEmail}>
        <Input
          type="email"
          placeholder="xyz@gmail.com"
          className="border-bac placeholder:text-foreground/50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <IconButton
          type="submit"
          text={t("auth.signIn.withEmail")}
          disabled={!email}
          icon="mail"
          size="lg"
        />
      </form>
      <Separator borderColor="border-foreground">
        <p className="px-2 text-xs uppercase">{t("general.or")}</p>
      </Separator>
      {OAuthProviders &&
        Object.values(OAuthProviders).map((provider, index) => (
          <div key={provider?.id ?? index}>
            <IconButton
              icon={isCustomIcon(provider.id) ? provider.id : "fallback"}
              text={getSignInWithProviderText(provider.name)}
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
        {t("auth.signIn.registerPrompt")}
      </Button>
    </div>
  );
};

export default SignInForm;
