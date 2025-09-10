import { playJingle } from "@/lib/browser";
import { signInWithProvider } from "@/lib/auth";
import { ErrorFormat } from "@/lib/constants/trpc-errors";
import { wait } from "@/lib/async";
import { api } from "@/lib/api";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import useRouterWithHelpers from "./useRouterWithHelpers";

const handleServerError = (
  opts: { message: string },
  failedActionDescription: string,
  loadingToast: string | number,
) => {
  let errorMessage = "";
  try {
    const errors = JSON.parse(opts.message);
    if (Array.isArray(errors)) {
      errorMessage = (errors[0] as ErrorFormat).message;
    }
  } catch {
    errorMessage = opts.message;
  }
  toast.error(
    `Something went wrong ${errorMessage && `(Server response: '${errorMessage}')`} and we could not ${failedActionDescription}, sorry! Please try again later.`,
    {
      id: loadingToast,
      dismissible: true,
      duration: Infinity,
    },
  );
};

const useProfileFunctions = () => {
  const router = useRouterWithHelpers();
  const { data: userData, update } = useSession();
  const utils = api.useUtils();

  const deleteAccount = api.user.deleteUserAndAccountsByUserId.useMutation();
  const unlinkSpotifyAccount = api.user.unlinkSpotifyAccount.useMutation();
  const editUserMail = api.user.editUserMail.useMutation();

  const handleChangeMail = async (newEmail: string) => {
    if (!userData) {
      throw new Error("User must be logged in to request mail change.");
    }
    if (!newEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Display error text, change colors for input
    const loadingToast = toast.loading("Changing mail...");
    editUserMail.mutate(
      { id: userData.user.id, email: newEmail },
      {
        onSuccess: () => {
          update();
          toast.dismiss();
          toast.success("Mail successfully updated.");
        },
        onError: (opts) => handleServerError(opts, "update your mail", loadingToast),
      },
    );
  };

  const handleChangeAvatar = async () => {
    throw new Error("Not implemented yet");
  };

  const handleSignOut = async () => {
    router.push("/");
    router.setParams({ search: "" });
    playJingle("reverse");

    toast.promise(
      wait(500).then(() => signOut({ redirect: false })),
      {
        loading: "Logging you out...",
        success: () => {
          return "Successfully logged out.";
        },
        error: "Something went wrong and we could not log you out.)",
      },
    );
    toast.dismiss();
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!userData) {
      throw new Error("User must be logged in to request account deletion.");
    }

    const loadingToast = toast.loading("Deleting account...");
    deleteAccount.mutate(
      { userId },
      {
        onSuccess: () => {
          signOut({ redirect: false });
          router.push("/");
          playJingle("reverse");
          toast.success("Account successfully deleted! Goodbye 👋", { id: loadingToast });
        },
        onError: (opts) => handleServerError(opts, "delete your account", loadingToast),
      },
    );
  };

  const handleUnlinkSpotify = async (userId: string) => {
    const loadingToast = toast.loading("Removing Spotify account link...");
    unlinkSpotifyAccount.mutate(
      { userId },
      {
        onSuccess: () => {
          utils.account.getSpotifyAccountById
            .invalidate()
            .then(() => {
              if (router.getParams("search") == "spotify") router.setParams({ search: "" });
            })
            .then(() =>
              toast.success("Spotify account successfully unlinked.", { id: loadingToast }),
            );
        },
        onError: (opts) => handleServerError(opts, "unlink your Spotify account", loadingToast),
      },
    );
  };

  const handleLinkSpotify = async () => {
    await signInWithProvider("spotify", router.locale ?? "", "link");
  };

  return {
    handleChangeAvatar,
    handleChangeMail,
    handleDeleteAccount,
    handleLinkSpotify,
    handleSignOut,
    handleUnlinkSpotify,
  };
};

export default useProfileFunctions;
