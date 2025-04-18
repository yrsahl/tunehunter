const capitalizeSecondLetter = (str: string) => {
  if (str.length < 2) return str; // If the string is too short, return it as is
  return str.charAt(0) + str.charAt(1).toUpperCase() + str.slice(2);
};

export const createStoreName = (store: string) => {
  let storeName = store;

  // Remove _ and replace with space
  storeName = storeName.replaceAll("_", " ");

  // Capitalize first letter except for itunes
  if (storeName === "itunes") {
    storeName = capitalizeSecondLetter(storeName);
  } else {
    storeName = storeName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return storeName;
};
