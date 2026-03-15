export const playJingle = async (playMode: "normal" | "reverse") => {
  let filePath;
  if (playMode === "normal") filePath = "/audio/jingle.mp3";
  if (playMode === "reverse") filePath = "/audio/jingle-reverse.mp3";
  const audio = new Audio(filePath);
  try {
    await audio.play();
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      console.info("Audio playback blocked until user interaction.", { playMode });
      return;
    }

    console.error("Failed to play jingle.", error);
  }
};
