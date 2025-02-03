import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useEffect, useState, type FC } from "react";
import MagicLinkForm from "./MagicLinkForm";
import SignInForm from "./SignInForm";
const RegisterForm = dynamic(() => import("@/components/interactive/Auth/RegisterForm"), {
  ssr: false,
});

export enum MenuState {
  SignIn,
  MagicLinkSent,
  Register,
}

const AuthMenu: FC = ({}) => {
  const [email, setEmail] = useState<string>("");
  const [menuState, setMenuState] = useState<MenuState>(0);
  const router = useRouterWithHelpers();

  // Update URL fragment when menuState changes
  useEffect(() => {
    if (!router.getParams("profile")) return;
    switch (menuState) {
      case MenuState.SignIn:
        router.setParams({ profile: "login" });
        break;
      case MenuState.MagicLinkSent:
        router.setParams({ profile: "magiclinksent" });
        break;
      case MenuState.Register:
        router.setParams({ profile: "register" });
        break;
    }
  }, [menuState]);

  // Restore menuState from URL
  useEffect(() => {
    const profileParams = router.getParams("profile");
    if (!profileParams) return;

    switch (profileParams) {
      case "login":
        setMenuState(MenuState.SignIn);
        break;
      case "magiclinksent":
        setMenuState(MenuState.MagicLinkSent);
        break;
      case "register":
        setMenuState(MenuState.Register);
        break;
    }
  }, [router.isReady]);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "absolute-center auth-menu-transition flex w-full justify-center",
          menuState !== MenuState.SignIn && "!-translate-x-[180%]",
        )}
      >
        <SignInForm email={email} setEmail={setEmail} setMenuState={setMenuState} />
      </div>
      <div
        className={cn(
          "absolute-center auth-menu-transition flex w-full justify-center",
          menuState !== MenuState.MagicLinkSent && "!translate-x-[180%]",
        )}
      >
        <MagicLinkForm email={email} setMenuState={setMenuState} />
      </div>
      <div
        className={cn(
          "absolute-center auth-menu-transition flex w-full justify-center",
          menuState !== MenuState.Register && "!translate-x-[180%]",
        )}
      >
        <RegisterForm email={email} menuState={menuState} setMenuState={setMenuState} />
      </div>
    </div>
  );
};

export default AuthMenu;
