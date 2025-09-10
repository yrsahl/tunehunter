// Helper function to generate random letters
export const generateRandomLetters = (length: number) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

// Helper function to generate random numbers
export const generateRandomNumbers = (length: number) => {
  const numbers = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return result;
};
