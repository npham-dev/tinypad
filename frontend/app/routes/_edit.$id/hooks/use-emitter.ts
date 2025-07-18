import type { Emitter, EventType } from "mitt";
import { useEffect } from "react";

export function useEmitter<
  T extends Record<EventType, unknown>,
  K extends keyof T,
>(emitter: Emitter<T>, key: K, callback: (event: T[K]) => void) {
  useEffect(() => {
    emitter.on(key, callback);
    return () => {
      emitter.off(key, callback);
    };
  }, [callback]);
}
