export const playJingle = async (playMode: "normal" | "reverse") => {
  let filePath;
  if (playMode === "normal") filePath = "/audio/jingle.mp3";
  if (playMode === "reverse") filePath = "/audio/jingle-reverse.mp3";
  const audio = new Audio(filePath);
  audio?.play();
};
