import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { type FC } from "react";
import AuthMenu from "../interactive/Auth/AuthMenu";
import ProfileMenu from "../interactive/Auth/ProfileMenu";

interface IProps {
  open: boolean;
  enableAnimation?: boolean;
}

const ProfileModal: FC<IProps> = ({ open, enableAnimation }) => {
  const { status, data } = useSession();
  const isLoggedIn = status === "authenticated" || (status === "loading" && !!data);

  return (
    <div
      className={cn(
        "page-container absolute left-1/2 top-1/2 z-50 flex max-h-[70vh] -translate-x-1/2 -translate-y-1/2 transform cursor-default justify-center",
        enableAnimation && "menu-transition",
        open ? "opacity-100 delay-100" : "pointer-events-none opacity-0 delay-0",
      )}
    >
      {isLoggedIn ? <ProfileMenu /> : <AuthMenu />}
    </div>
  );
};
export default ProfileModal;
