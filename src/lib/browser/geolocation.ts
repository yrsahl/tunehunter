export type UserLocation = {
  latitude: number;
  longitude: number;
};

export const getUserLocation = (): Promise<UserLocation | { error: string }> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
      },
      () => {
        reject({ error: "Could not retrieve location" });
      },
    );
  });
};
