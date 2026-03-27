import { useLocalStorage } from "@uidotdev/usehooks";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import useUserSettings from "./useUserSettings";

export const userRoles = ["music_lover", "dj", "audiophile"] as const;
export type UserRole = (typeof userRoles)[number];

export const userRoleLabels: Record<UserRole, string> = {
  music_lover: "Music Lover",
  dj: "DJ",
  audiophile: "Audiophile",
};

export const isUserRole = (value: string): value is UserRole =>
  userRoles.includes(value as UserRole);

const useRoleSettings = () => {
  const [role, setRole] = useLocalStorage<UserRole>("role", "music_lover");
  const { status, data: userData } = useSession();
  const loggedIn = status === "authenticated";
  const {
    userSettings,
    userSettingsUpdaters: { updatePreferredRole },
  } = useUserSettings(userData?.user.id);

  // Set role from DB on load
  useEffect(() => {
    const preferredRole = userSettings?.role;
    if (preferredRole && isUserRole(preferredRole) && preferredRole !== role) {
      setRole(preferredRole);
    }
  }, [userSettings]);

  const changeRole = (newRole: UserRole) => {
    if (loggedIn) {
      updatePreferredRole?.(newRole);
    }
    setRole(newRole);
  };

  return { role, changeRole };
};

export default useRoleSettings;
