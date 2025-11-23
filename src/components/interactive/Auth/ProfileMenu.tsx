import CustomIcon from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useThemeSettings, { AutoThemePreferences } from "@/hooks/settings/useThemeSettings";
import useAuthError from "@/hooks/useAuthErrors";
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { api } from "@/lib/api";
import { growIn } from "@/styles/animations";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import IconButton from "../../IconButton";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ChangeAvatarModal from "../Modals/ChangeAvatarModal";
import ChangeMailModal from "../Modals/ChangeMailModal";
import ConfirmationModal from "../Modals/ConfirmationModal";
import AuthCard from "./AuthCard";

const ProfileMenu = () => {
  const [changeMailDialogOpen, setChangeMailDialogOpen] = useState(false);
  const { handleDeleteAccount, handleLinkSpotify, handleSignOut, handleUnlinkSpotify } =
    useProfileFunctions();
  const { region, changeRegion, createRegionName, setRegionByLocation, sortedRegions } =
    useRegionSettings();
  const {
    particlePreference,
    preferredTheme,
    changeAutoThemePreference,
    changeParticlePreference,
  } = useThemeSettings();
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
          text="Log out"
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
          <div data-testid="change-avatar-button" className="relative">
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

      <div className="grid w-full grid-cols-[repeat(5,max-content)] gap-x-4 gap-y-6 sm:gap-x-12">
        {/* Mail */}
        <p className="col-span-2 flex items-center justify-end ">Mail</p>
        <p className="col-span-2 flex items-center overflow-x-clip text-ellipsis font-thin">
          {userMail}
        </p>
        <div className="col-span-1">
          <ChangeMailModal open={changeMailDialogOpen} setOpen={setChangeMailDialogOpen}>
            <div>
              <IconButton
                data-testid="change-email-button"
                icon="edit"
                variant="ghostPrimary"
                size="icon"
                iconSize="20px"
                onClick={() => setChangeMailDialogOpen(true)}
              />
            </div>
          </ChangeMailModal>
        </div>

        {/* Region */}
        <Label
          htmlFor="region"
          className="col-span-2 flex items-center justify-end text-sm font-normal md:text-base"
        >
          Region
        </Label>
        <div className="col-span-2">
          <Select data-testid="region-select" onValueChange={changeRegion} value={region}>
            <SelectTrigger
              id="region"
              className="h-9 max-w-36 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 font-thin text-foreground focus:ring-0 focus:ring-offset-0 md:max-w-44 md:text-base"
            >
              <motion.div
                key={region}
                {...growIn()}
                className="inline-block w-32 overflow-hidden text-ellipsis text-start"
              >
                <SelectValue />
              </motion.div>
            </SelectTrigger>
            <SelectContent>
              {sortedRegions.map((region) => (
                <SelectItem
                  data-testid={`region-option-${region.toLowerCase()}`}
                  key={region}
                  value={region.toLowerCase()}
                >
                  {createRegionName(region)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 flex h-9 items-center justify-center">
          <IconButton
            data-testid="auto-detect-region-button"
            variant="ghostPrimary"
            size="icon"
            icon="mapPin"
            iconSize="20px"
            bordered="default"
            onClick={setRegionByLocation}
          />
        </div>

        {/* Spotify */}
        <p className="col-span-2 flex items-center justify-end">Spotify</p>
        {spotifyAccount?.data && (
          <>
            <a
              href={`https://open.spotify.com/user/${spotifyAccount.data.providerAccountId}`}
              target="_blank"
              className="col-span-2"
            >
              <Button
                className="flex justify-start gap-2 p-0 font-light uppercase text-success"
                variant="link"
                size="sm"
              >
                <span className="max-w-40 overflow-hidden text-ellipsis">
                  {spotifyUserData?.profileData?.display_name}
                </span>
                <CustomIcon icon="external" />
              </Button>
            </a>
            <ConfirmationModal
              dialogAction={() => handleUnlinkSpotify(userData.user.id)}
              dialogText={`Please confirm that you want to unlink your Spotify account ${spotifyUserData?.profileData?.display_name}.`}
              dialogTitle="Unlink Spotify account?"
            >
              <div>
                <IconButton icon="x" variant="ghostPrimary" size="icon" iconSize="20px" />
              </div>
            </ConfirmationModal>
          </>
        )}
        {!spotifyAccount?.data && (
          <div className="col-span-2">
            <IconButton
              icon={"spotify"}
              variant="outlinePrimary"
              text="Connect"
              size="sm"
              onClick={handleLinkSpotify}
            />
          </div>
        )}

        {/* Theme */}
        <p className="gap-1font-normal col-span-2 flex items-center justify-end font-normal">
          <span>Theme</span>
        </p>
        <div className="col-span-2">
          <Select
            data-testid="theme-select"
            value={autoThemePreference}
            onValueChange={changeAutoThemePreference}
          >
            <SelectTrigger
              id="region"
              className="h-9 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 font-thin text-foreground focus:ring-0 focus:ring-offset-0 md:text-base"
            >
              <motion.div {...growIn()} className="inline-block overflow-hidden text-ellipsis">
                <SelectValue />
              </motion.div>
            </SelectTrigger>
            <SelectContent>
              {AutoThemePreferences.map((autoThemePreference) => (
                <SelectItem
                  data-testid={`theme-option-${autoThemePreference}`}
                  key={autoThemePreference}
                  value={autoThemePreference}
                  className="py-2"
                >
                  {autoThemePreference === "auto" ? "Determine by sunset" : "Choose manually"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Disable particles */}
        <p className="col-span-2 flex items-center justify-end gap-1 ">
          <span>Particles</span>
        </p>
        <div className="col-span-3 flex items-center gap-4 font-thin">
          <span
            className={clsx(
              "transition-colors",
              particlePreference ? "text-foreground/20" : "text-foreground",
            )}
          >
            Off
          </span>
          <Switch
            data-testid="particles-toggle"
            id="minimumlength"
            checked={particlePreference || false}
            onCheckedChange={changeParticlePreference}
          />
          <span
            className={clsx(
              "transition-colors",
              particlePreference ? "text-foreground" : "text-foreground/20",
            )}
          >
            On
          </span>
        </div>
        {/* <div className="col-span-3">
          <Select value={autoThemePreference} onValueChange={changeAutoThemePreference}>
            <SelectTrigger
              id="region"
              className="h-9 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-base font-thin text-foreground focus:ring-0 focus:ring-offset-0"
            >
              <motion.div {...growIn()} className="inline-block overflow-hidden text-ellipsis">
                <SelectValue />
              </motion.div>
            </SelectTrigger>
            <SelectContent>
              {["enable", "disable"].map((autoThemePreference) => (
                <SelectItem key={autoThemePreference} value={autoThemePreference} className="py-2">
                  {autoThemePreference === "auto" ? "Determine by sunset" : "Choose manually"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        {/* Delete account */}
        <p className="col-span-2 flex items-center justify-end font-normal">Account</p>
        <div className="col-span-3">
          <ConfirmationModal
            dialogAction={() => handleDeleteAccount(userData.user.id)}
            dialogText="This action cannot be undone. This will permanently delete your account and all related data."
            dialogTitle="Are you absolutely sure?"
          >
            <div>
              <IconButton
                text="Delete Account"
                variant="ghostDestructive"
                size="sm"
                icon="x"
                className="flex justify-start"
              />
            </div>
          </ConfirmationModal>
        </div>
      </div>

      {/* Log out */}
      <div className="mb-2 mt-6 w-fit">
        <IconButton
          data-testid="logout-button"
          onClick={handleSignOut}
          text="Log out"
          variant="primary"
          size="lg"
          icon="signOut"
        />
      </div>
    </AuthCard>
  );
};

export default ProfileMenu;
