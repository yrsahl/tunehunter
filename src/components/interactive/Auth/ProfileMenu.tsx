import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// [SPOTIFY_OAUTH] import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useThemeSettings from "@/hooks/settings/useThemeSettings";
// [SPOTIFY_OAUTH] import useAuthError from "@/hooks/useAuthErrors";
import useProfileFunctions from "@/hooks/useProfileFunctions";
import { growIn } from "@/styles/animations";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import IconButton from "../../IconButton";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ChangeAvatarModal from "../Modals/ChangeAvatarModal";
import ChangeMailModal from "../Modals/ChangeMailModal";
import ChangeNameModal from "../Modals/ChangeNameModal";
import ConfirmationModal from "../Modals/ConfirmationModal";
import AuthCard from "./AuthCard";

const ProfileMenu = () => {
  const [changeMailDialogOpen, setChangeMailDialogOpen] = useState(false);
  const [changeNameDialogOpen, setChangeNameDialogOpen] = useState(false);
  const { handleDeleteAccount, handleSignOut } = useProfileFunctions();
  const { region, changeRegion, createRegionName, setRegionByLocation, sortedRegions } =
    useRegionSettings();
  const {
    particlePreference,
    preferredTheme,
    changeAutoThemePreference,
    changeParticlePreference,
  } = useThemeSettings();
  const autoThemePreference = preferredTheme === "auto" ? "auto" : "manual";
  const { data: userData } = useSession();
  const userId = userData?.user.id ?? "";
  const userName = userData?.user.name;
  const userMail = userData?.user.email;
  const userImg = userData?.user.image;
  const userImgAlt = `Avatar image of ${userName}`;

  // [SPOTIFY_OAUTH] Re-enable when Spotify extended quota is approved
  // const { spotifyUserData } = useSpotifyUserDataContext();
  // const linkError = useAuthError("link");
  // const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
  //   { userId },
  //   { enabled: Boolean(userId), refetchInterval: 30 * 60 * 1000, refetchIntervalInBackground: true, refetchOnWindowFocus: false },
  // );
  // useEffect(() => {
  //   if (linkError) toast.error(linkError, { dismissible: true, duration: Infinity });
  // }, [linkError]);

  if (!userData) {
    return (
      <div className="mt-4 w-fit">
        <IconButton
          onClick={() => {
            void handleSignOut();
          }}
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
            <Avatar className="relative z-10 border border-foreground/20">
              {userImg && <AvatarImage src={userImg} alt={userImgAlt} />}
              {!userImg && <AvatarFallback>{userName?.slice(0, 2)}</AvatarFallback>}
            </Avatar>
          </div>
        </ChangeAvatarModal>
        {userName && (
          <p
            className="cursor-pointer underline-offset-4 hover:underline"
            onClick={() => setChangeNameDialogOpen(true)}
          >
            {userName}
          </p>
        )}
        <ChangeNameModal open={changeNameDialogOpen} setOpen={setChangeNameDialogOpen}>
          <span />
        </ChangeNameModal>
      </div>

      <div className="grid w-full grid-cols-[repeat(5,max-content)] gap-x-4 gap-y-6 sm:gap-x-12">
        {/* Mail */}
        <p className="col-span-2 flex items-center justify-end ">Mail</p>
        <p className="col-span-2 flex items-center overflow-x-clip text-ellipsis font-thin">
          {userMail}
        </p>
        <div className="col-span-1">
          <ChangeMailModal open={changeMailDialogOpen} setOpen={setChangeMailDialogOpen}>
            <div className="flex items-center justify-center">
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
          <Select onValueChange={changeRegion} value={region}>
            <SelectTrigger
              id="region"
              data-testid="region-select"
              className="h-9 max-w-36 justify-start gap-2 text-ellipsis whitespace-nowrap border-none bg-transparent p-0 font-thin text-foreground focus:ring-0 focus:ring-offset-0 md:text-base"
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
              {sortedRegions.priority.map((region) => (
                <SelectItem data-testid={`region-option-${region}`} key={region} value={region}>
                  {createRegionName(region)}
                </SelectItem>
              ))}
              <SelectSeparator className="" />
              {sortedRegions.rest.map((region) => (
                <SelectItem data-testid={`region-option-${region}`} key={region} value={region}>
                  {createRegionName(region)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center">
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

        {/* [SPOTIFY_OAUTH] Spotify connect/disconnect row — re-enable when quota approved
        <p className="col-span-2 flex items-center justify-end">Spotify</p>
        {spotifyAccount?.data && (
          <>
            <a href={`https://open.spotify.com/user/${spotifyAccount.data.providerAccountId}`} target="_blank" className="col-span-2">
              <Button className="flex justify-start gap-2 p-0 font-light uppercase text-success" variant="link" size="sm">
                <span className="max-w-40 overflow-hidden text-ellipsis">{spotifyUserData?.profileData?.display_name}</span>
                <CustomIcon icon="external" />
              </Button>
            </a>
            <ConfirmationModal
              dialogAction={() => { void handleUnlinkSpotify(userId); }}
              dialogText={`Please confirm that you want to unlink your Spotify account ${spotifyUserData?.profileData?.display_name}.`}
              dialogTitle="Unlink Spotify account?"
            >
              <div><IconButton icon="x" variant="ghostPrimary" size="icon" iconSize="20px" /></div>
            </ConfirmationModal>
          </>
        )}
        {!spotifyAccount?.data && (
          <div className="col-span-2">
            <IconButton icon="spotify" variant="outlinePrimary" text="Connect" size="sm" onClick={() => { void handleLinkSpotify(); }} />
          </div>
        )}
        */}

        {/* Theme */}
        <p className="col-span-2 flex items-center justify-end font-normal">Theme</p>
        <div className="col-span-2 flex items-center gap-2">
          <span
            className={`w-10 font-thin transition-opacity md:text-base ${autoThemePreference === "auto" ? "opacity-100" : "opacity-30"}`}
          >
            Auto
          </span>
          /
          <span
            className={`flex-1 font-thin transition-opacity md:text-base ${autoThemePreference === "manual" ? "opacity-100" : "opacity-30"}`}
          >
            Manual
          </span>
        </div>
        <div className="flex h-9 items-center">
          <Switch
            data-testid="theme-toggle"
            id="theme"
            inverted
            checked={autoThemePreference === "manual"}
            onCheckedChange={(checked) => changeAutoThemePreference(checked ? "manual" : "auto")}
          />
        </div>

        {/* Particles */}
        <p className="col-span-2 flex items-center justify-end font-normal">Particles</p>
        <div className="col-span-2 flex items-center gap-2">
          <span
            className={`w-10 font-thin transition-opacity md:text-base ${(particlePreference ?? false) ? "opacity-30" : "opacity-100"}`}
          >
            Off
          </span>
          /
          <span
            className={`flex-1 font-thin transition-opacity md:text-base ${(particlePreference ?? false) ? "opacity-100" : "opacity-30"}`}
          >
            On
          </span>
        </div>
        <div className="flex h-9 items-center">
          <Switch
            data-testid="particles-toggle"
            id="particles"
            inverted
            checked={particlePreference ?? false}
            onCheckedChange={changeParticlePreference}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <IconButton
          data-testid="logout-button"
          onClick={() => {
            void handleSignOut();
          }}
          text="Log out"
          variant="primary"
          size="lg"
          icon="signOut"
        />
        <ConfirmationModal
          dialogAction={() => {
            void handleDeleteAccount(userId);
          }}
          dialogText="This action cannot be undone. This will permanently delete your account and all related data."
          dialogTitle="Are you absolutely sure?"
        >
          <div>
            <IconButton
              text="Delete account"
              variant="link"
              size="sm"
              className="text-destructive/50 hover:text-destructive dark:text-destructive/90 dark:hover:text-destructive"
            />
          </div>
        </ConfirmationModal>
      </div>
    </AuthCard>
  );
};

export default ProfileMenu;
