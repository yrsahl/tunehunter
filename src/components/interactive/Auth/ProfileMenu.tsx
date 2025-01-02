import CustomIcon from "@/components/CustomIcon";
import { Separator } from "@/components/my-ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { growIn } from "@/helpers/animations";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useThemeSettings, { AutoThemePreferences } from "@/hooks/settings/useThemeSettings";
import useAuthError from "@/hooks/useAuthErrors";
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import IconButton from "../../IconButton";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ChangeAvatarModal from "../Modals/ChangeAvatarModal";
import ChangeMailModal from "../Modals/ChangeMailModal";
import ConfirmationModal from "../Modals/ConfirmationModal";
import AuthCard from "./AuthCard";

const ProfileMenu = () => {
  const { t } = useTranslation("");
  const [changeMailDialogOpen, setChangeMailDialogOpen] = useState(false);
  const { handleDeleteAccount, handleLinkSpotify, handleSignOut, handleUnlinkSpotify } =
    useProfileFunctions();
  const { region, changeRegion, createRegionName, setRegionByLocation, sortedRegions } =
    useRegionSettings();
  const { preferredTheme, changeAutoThemePreference } = useThemeSettings();
  const autoThemePreference = preferredTheme === "auto" ? "auto" : "manual";
  const { spotifyUserData } = useSpotifyUserDataContext();
  const linkError = useAuthError("link");

  const { data: userData } = useSession();
  const userName = userData?.user.name;
  const userMail = userData?.user.email;
  const userImg = userData?.user.image;
  const userImgAlt = `Avatar image of ${userName}`;

  const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: !!userData,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );
  // Check for errors from linking spotify
  useEffect(() => {
    if (linkError) toast.error(linkError, { dismissible: true, duration: Infinity });
  }, [linkError]);

  if (!userData) {
    return (
      <div className="mt-4 w-fit">
        <IconButton
          onClick={handleSignOut}
          text={t("profile.logout")}
          variant="primary"
          size="lg"
          icon="signOut"
        />
      </div>
    );
  }

  return (
    <AuthCard size="default">
      {/* Picture & name */}
      <div className="relative flex flex-row items-center gap-4 pb-2 pt-2">
        <ChangeAvatarModal>
          <div className="relative">
            <motion.div
              className="absolute inset-0 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-foreground bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <IconButton icon="upload" className="h-full w-full" size="icon" iconSize="20px" />
            </motion.div>
            <Avatar className="relative z-10 border border-foreground">
              {userImg && <AvatarImage src={userImg} alt={userImgAlt} />}
              {!userImg && <AvatarFallback>{userName?.slice(0, 2)}</AvatarFallback>}
            </Avatar>
          </div>
        </ChangeAvatarModal>
        {userName && <p>{userName}</p>}
      </div>

      <div className="grid w-full grid-cols-[repeat(5,max-content)] gap-x-12 gap-y-6">
        {/* Mail */}
        <p className="col-span-2 flex items-center justify-end font-thin">{t("general.mail")}</p>
        <p className="col-span-2 flex items-center overflow-x-clip text-ellipsis font-thin">
          {userMail}
        </p>
        <div className="col-span-1">
          <ChangeMailModal open={changeMailDialogOpen} setOpen={setChangeMailDialogOpen}>
            <div>
              <IconButton
                icon="edit"
                variant="ghostPrimary"
                size="icon"
                iconSize="20px"
                onClick={() => setChangeMailDialogOpen(true)}
              />
            </div>
          </ChangeMailModal>
        </div>

        {/* Spotify */}
        <p className="col-span-2 flex items-center justify-end font-thin">
          {t("settings.profile.spotify.account")}
        </p>
        {spotifyAccount?.data && (
          <>
            <a
              href={`https://open.spotify.com/user/${spotifyAccount.data.providerAccountId}`}
              target="_blank"
              className="col-span-2"
            >
              <IconButton
                className="flex justify-start p-0 text-success"
                icon="external"
                iconPosition="right"
                variant="link"
                text={spotifyUserData?.profileData?.display_name}
                size="sm"
              />
            </a>
            <ConfirmationModal
              dialogAction={() => handleUnlinkSpotify(userData.user.id)}
              dialogText={t("settings.profile.spotify.unlink.text", {
                accountName: spotifyUserData?.profileData?.display_name,
              })}
              dialogTitle={t("settings.profile.spotify.unlink.title")}
            >
              <div>
                <IconButton icon="x" variant="ghostPrimary" size="icon" iconSize="20px" />
              </div>
            </ConfirmationModal>
          </>
        )}
        {!spotifyAccount?.data && (
          <div className="col-span-3">
            <IconButton
              icon={"spotify"}
              variant="outlinePrimary"
              text={t("settings.profile.spotify.connect")}
              size="sm"
              onClick={handleLinkSpotify}
            />
          </div>
        )}

        <div className="col-span-5">
          <Separator />
        </div>

        {/* Region */}
        <Label htmlFor="region" className="col-span-2 flex items-center justify-end font-thin">
          {t("settings.region.title")}
        </Label>
        <div className="col-span-2">
          <Select onValueChange={changeRegion} value={region}>
            <SelectTrigger
              id="region"
              className="h-9 max-w-44 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-base font-thin text-foreground focus:ring-0 focus:ring-offset-0"
            >
              <motion.div
                key={region}
                {...growIn()}
                className="inline-block max-w-36 overflow-hidden text-ellipsis"
              >
                <SelectValue />
              </motion.div>
            </SelectTrigger>
            <SelectContent>
              {sortedRegions.map((region) => (
                <SelectItem key={region} value={region.toLowerCase()}>
                  {createRegionName(region)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 flex h-9 items-center justify-center">
          <IconButton
            variant="ghostPrimary"
            size="icon"
            icon="mapPin"
            iconSize="24px"
            bordered="default"
            onClick={setRegionByLocation}
          />
        </div>

        {/* Theme */}
        <p className="col-span-2 flex items-center justify-end gap-1 font-thin">
          <span>{t("settings.theme.switch")}</span>
        </p>
        <div className="col-span-2">
          <Select value={autoThemePreference} onValueChange={changeAutoThemePreference}>
            <SelectTrigger
              id="region"
              className="h-9 max-w-44 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-base font-thin text-foreground focus:ring-0 focus:ring-offset-0"
            >
              <motion.div
                {...growIn()}
                className="inline-block max-w-36 overflow-hidden text-ellipsis"
              >
                <SelectValue />
              </motion.div>
            </SelectTrigger>
            <SelectContent>
              {AutoThemePreferences.map((autoThemePreference) => (
                <SelectItem key={autoThemePreference} value={autoThemePreference} className="py-2">
                  {t(`settings.theme.${autoThemePreference}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <CustomIcon icon="info" variant="ghost-foreground" width="18px" height="18px" />
            </TooltipTrigger>
            <TooltipContent className="border border-foreground/30 bg-background px-4 py-2 text-center text-foreground"></TooltipContent>
          </Tooltip>
        </div>

        <div className="col-span-5">
          <Separator />
        </div>

        {/* Feedback */}
        <p className="col-span-2 flex items-center justify-end font-thin">
          {t("profile.haveFeedback")}
        </p>
        <a href="mailto:hello@tunehunter.app?subject=Feedback" className="col-span-3">
          <IconButton text={t("profile.writeUs")} variant="outlinePrimary" size="sm" icon="mail" />
        </a>

        {/* Delete account */}
        <p className="col-span-2 flex items-center justify-end font-thin">
          {t("profile.wantToGo")}
        </p>
        <div className="col-span-3">
          <ConfirmationModal
            dialogAction={() => handleDeleteAccount(userData.user.id)}
            dialogText={t("profile.deleteAccount.promptText")}
            dialogTitle={t("profile.deleteAccount.promptTitle")}
          >
            <div>
              <IconButton
                text={t("profile.deleteAccount.button")}
                variant="outlineDestructive"
                size="sm"
                icon="x"
              />
            </div>
          </ConfirmationModal>
        </div>
      </div>

      {/* Log out */}
      <div className="mb-2 mt-6 w-fit">
        <IconButton
          onClick={handleSignOut}
          text={t("profile.logout")}
          variant="primary"
          size="lg"
          icon="signOut"
        />
      </div>
    </AuthCard>
  );
};

export default ProfileMenu;
