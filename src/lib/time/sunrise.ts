import { UserLocation } from "@/lib";

export const fetchDayTimeStatus = async ({ latitude, longitude }: UserLocation) => {
  const response = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`,
  );
  const data = await response.json();
  const sunrise = new Date(data.results.sunrise);
  const sunset = new Date(data.results.sunset);
  const now = new Date();

  return now >= sunrise && now < sunset;
};
