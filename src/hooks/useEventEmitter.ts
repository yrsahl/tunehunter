import globalEventEmitter from "@/hooks/shared";
import { useCallback, useEffect, useRef, useState } from "react";

export const useEventEmitter = <T>(eventName: string) => {
  const [eventData, setEventData] = useState<T>();
  const skipRerender = useRef(false);

  // Subscribe to given event with eventName
  useEffect(() => {
    const listener = (event: Event) => {
      if (skipRerender.current) {
        skipRerender.current = false;
        return;
      }
      setEventData((event as CustomEvent).detail);
    };

    globalEventEmitter.addEventListener(eventName, listener);

    // Cleanup on unmount
    return () => {
      globalEventEmitter.removeEventListener(eventName, listener);
    };
  }, [eventName, skipRerender]);

  // Publish event with given eventName
  const publishEvent = useCallback(
    (eventData: T, skipRender = true) => {
      skipRerender.current = skipRender;
      const event = new CustomEvent(eventName, { detail: eventData });
      globalEventEmitter.dispatchEvent(event);
    },
    [eventName],
  );

  return { eventData, publishEvent };
};
