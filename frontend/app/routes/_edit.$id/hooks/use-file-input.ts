import { useCallback, useRef } from "react";

export function useFileInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  return {
    inputRef,
    getFile: useCallback(
      (): File | undefined => (inputRef.current?.files || [])[0],
      [inputRef],
    ),
    resetFile: useCallback(() => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }, [inputRef]),
  };
}
