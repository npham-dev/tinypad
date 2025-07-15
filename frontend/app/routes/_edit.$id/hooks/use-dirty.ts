import { useCallback, useEffect, useRef } from "react";

export function useDirty(args: { resetKey: unknown }) {
  const dirty = useRef(false);

  const handleInput = useCallback(() => {
    dirty.current = true;
  }, []);

  useEffect(() => {
    dirty.current = false;
  }, [args.resetKey]);

  return {
    dirty,
    listeners: {
      onChange: handleInput,
      onInput: handleInput,
      onClick: handleInput,
    },
  };
}
