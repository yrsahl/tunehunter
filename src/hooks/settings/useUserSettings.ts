import { api } from "@/lib/api";

const useUserSettings = (userId: string | undefined) => {
  const mutateSettings = api.user.setUserSettings.useMutation();
  const utils = api.useUtils();

  const { data: userSettings } = api.user.getUserSettings.useQuery(
    { userId: userId! },
    { enabled: !!userId },
  );

  const userSettingsUpdaters = {
    updatePreferredTheme: (theme: string) => {
      if (!userId) return { error: "Tried to save theme without user ID" };
      mutateSettings.mutate(
        { id: userId, theme },
        {
          onError: () => {
            return 0;
          },
          onSuccess: () => {
            utils.user.getUserSettings.invalidate({ userId });
            return 1;
          },
        },
      );
    },

    updateParticlePreference: (particlePreference: boolean) => {
      if (!userId) return { error: "Tried to save particle preference without user ID" };
      mutateSettings.mutate(
        { id: userId, themeParticles: particlePreference },
        {
          onError: () => {
            return 0;
          },
          onSuccess: () => {
            utils.user.getUserSettings.invalidate({ userId });
            return 1;
          },
        },
      );
    },

    updatePreferredRegion: (region: string) => {
      if (!userId) return { error: "Tried to save region without userId" };
      mutateSettings.mutate(
        { id: userId, region },
        {
          onError: () => {
            return 0;
          },
          onSuccess: () => {
            utils.user.getUserSettings.invalidate({ userId });
            return 1;
          },
        },
      );
    },

    updatePreferredRole: (role: string) => {
      if (!userId) return { error: "Tried to save role without userId" };
      mutateSettings.mutate(
        { id: userId, role },
        {
          onError: () => {
            return 0;
          },
          onSuccess: () => {
            utils.user.getUserSettings.invalidate({ userId });
            return 1;
          },
        },
      );
    },
  };

  return {
    userSettings,
    userSettingsUpdaters,
  };
};

export default useUserSettings;
