import { api } from "@/lib/api";
import { wait } from "@/lib/async";
// [SPOTIFY_OAUTH] import { signInWithProvider } from "@/lib/auth";
import { playJingle } from "@/lib/browser";
import { ErrorFormat } from "@/lib/constants/trpc-errors";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import useRouterWithHelpers from "./useRouterWithHelpers";


const useProfileFunctions = () => {
  const router = useRouterWithHelpers();
  const { data: userData, update } = useSession();
  // [SPOTIFY_OAUTH] const utils = api.useUtils();

  const deleteAccount = api.user.deleteUserAndAccountsByUserId.useMutation();
  const editUserMail = api.user.editUserMail.useMutation();
  const editUserName = api.user.editUserName.useMutation();
  const editUserImage = api.user.editUserImage.useMutation();
  // [SPOTIFY_OAUTH] const unlinkSpotifyAccount = api.user.unlinkSpotifyAccount.useMutation();

  const handleChangeMail = async (newEmail: string) => {
    if (!userData) {
      throw new Error("User must be logged in to request mail change.");
    }
    if (!newEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const mutationPromise = new Promise<void>((resolve, reject) => {
      editUserMail.mutate(
        { id: userData.user.id, email: newEmail },
        { onSuccess: () => { update(); resolve(); }, onError: reject },
      );
    });

    toast.promise(mutationPromise, {
      loading: "Changing mail...",
      success: "Mail successfully updated.",
      error: (opts: { message: string }) => {
        try {
          const errors = JSON.parse(opts.message) as ErrorFormat[];
          if (Array.isArray(errors)) return errors[0]?.message ?? opts.message;
        } catch {}
        return opts.message;
      },
    });
  };

  const handleChangeName = async (newName: string): Promise<{ error?: string }> => {
    if (!userData) throw new Error("User must be logged in to request name change.");

    const mutationPromise = new Promise<void>((resolve, reject) => {
      editUserName.mutate(
        { id: userData.user.id, name: newName },
        { onSuccess: () => { void update(); resolve(); }, onError: reject },
      );
    });

    toast.promise(mutationPromise, {
      loading: "Updating username...",
      success: "Username successfully updated.",
      error: (opts: { message: string }) => {
        try {
          const errors = JSON.parse(opts.message) as ErrorFormat[];
          if (Array.isArray(errors)) return errors[0]?.message ?? opts.message;
        } catch {}
        return opts.message;
      },
    });

    try {
      await mutationPromise;
      return {};
    } catch (opts) {
      const err = opts as { message: string };
      try {
        const errors = JSON.parse(err.message) as ErrorFormat[];
        if (Array.isArray(errors)) return { error: errors[0]?.message ?? err.message };
      } catch {}
      return { error: err.message };
    }
  };

  const handleChangeAvatar = async (imageUrl: string | null): Promise<{ error?: string }> => {
    if (!userData) throw new Error("User must be logged in to change avatar.");

    const mutationPromise = new Promise<void>((resolve, reject) => {
      editUserImage.mutate(
        { id: userData.user.id, image: imageUrl },
        { onSuccess: () => { void update(); resolve(); }, onError: reject },
      );
    });

    toast.promise(mutationPromise, {
      loading: "Updating profile picture...",
      success: "Profile picture successfully updated.",
      error: "Something went wrong. Could not update your profile picture.",
    });

    try { await mutationPromise; } catch { /* toast handles it */ }
    return {};
  };

  const handleSignOut = async () => {
    router.push("/");
    router.setParams({ search: "" });
    playJingle("reverse");

    toast.promise(
      wait(500).then(() => signOut({ redirect: false })),
      {
        loading: "Logging you out...",
        success: "Successfully logged out.",
        error: "Something went wrong and we could not log you out.",
      },
    );
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!userData) {
      throw new Error("User must be logged in to request account deletion.");
    }

    const mutationPromise = new Promise<void>((resolve, reject) => {
      deleteAccount.mutate(
        { userId },
        {
          onSuccess: () => {
            void signOut({ redirect: false });
            router.push("/");
            playJingle("reverse");
            resolve();
          },
          onError: reject,
        },
      );
    });

    toast.promise(mutationPromise, {
      loading: "Deleting account...",
      success: "Account successfully deleted! Goodbye 👋",
      error: (opts: { message: string }) => {
        try {
          const errors = JSON.parse(opts.message) as ErrorFormat[];
          if (Array.isArray(errors)) return errors[0]?.message ?? opts.message;
        } catch {}
        return opts.message;
      },
    });
  };

  // [SPOTIFY_OAUTH] Re-enable when Spotify extended quota is approved
  // const handleUnlinkSpotify = async (userId: string) => {
  //   const loadingToast = toast.loading("Removing Spotify account link...");
  //   unlinkSpotifyAccount.mutate({ userId }, {
  //     onSuccess: () => {
  //       utils.account.getSpotifyAccountById.invalidate()
  //         .then(() => { if (router.getParams("search") === "spotify") router.setParams({ search: "" }); })
  //         .then(() => toast.success("Spotify account successfully unlinked.", { id: loadingToast }));
  //     },
  //     onError: (opts) => handleServerError(opts, "unlink your Spotify account", loadingToast),
  //   });
  // };
  // const handleLinkSpotify = async () => {
  //   await signInWithProvider("spotify", router.locale ?? "", "link");
  // };

  return {
    handleChangeAvatar,
    handleChangeMail,
    handleChangeName,
    handleDeleteAccount,
    handleSignOut,
  };
};

export default useProfileFunctions;
