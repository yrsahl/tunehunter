const capitalizeSecondLetter = (str: string) => {
  if (str.length < 2) return str; // If the string is too short, return it as is
  return str.charAt(0) + str.charAt(1).toUpperCase() + str.slice(2);
};

export const createStoreName = (store: string) => {
  let storeName = store;

  // Remove everything after _
  const underscoreIndex = storeName.indexOf("_");
  if (underscoreIndex !== -1) {
    storeName = storeName.substring(0, underscoreIndex);
  }

  // Capitalize first letter except for itunes
  if (storeName === "itunes") {
    storeName = capitalizeSecondLetter(storeName);
  } else {
    storeName = storeName.charAt(0).toUpperCase() + storeName.slice(1);
  }

  return storeName;
};
