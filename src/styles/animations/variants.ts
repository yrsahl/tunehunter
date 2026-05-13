export const fadeIn = (duration = 0.3) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration },
});

export const fadeInAndOut = (duration = 0.3) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration, ease: "easeInOut" as const },
});

export const growIn = (duration = 0.3) => ({
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration },
});

export const slideInFromAbove = (duration = 0.5, distance = 10) => ({
  initial: { opacity: 0, y: -distance },
  animate: { opacity: 1, y: 0 },
  transition: { duration },
});

export const slideInAndOutFromAbove = (duration = 0.5, distance = 10) => ({
  initial: { opacity: 0, y: -distance },
  animate: { opacity: 1, y: 0, transition: { duration } },
  exit: {
    opacity: 0,
    y: -distance,
    transition: { duration: duration / 2 },
  },
});

export const slideInAndOutFromLeft = (duration = 0.5, distance = 10) => ({
  initial: { opacity: 0, x: -distance },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -distance },
  transition: { duration },
});

export const slideInAndOutFromRight = (duration = 0.5) => ({
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration },
});

export const slideInFromBottom = (duration = 0.5, distance = 10) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: distance },
  transition: { duration },
});

export const slideInAndOutFromBottom = (duration = 0.5, distance = 10) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: distance },
  transition: { duration },
});
