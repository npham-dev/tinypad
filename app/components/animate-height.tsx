import { tokens } from "natmfat/lib/tokens";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

type AnimateHeightProps = {
  expand?: boolean;
  children?: ReactNode;

  /** Recalculate height whenever this changes (prevents unnecessary re-renders) */
  childrenHash?: string;
};

export const AnimateHeight = ({
  expand,
  children,
  childrenHash,
}: AnimateHeightProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // calculate height of children
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const clonedRef = ref.current.cloneNode(true) as HTMLElement;
    clonedRef.removeAttribute("style");
    Object.assign(clonedRef.style, {
      height: "fit-content",
      position: "fixed",
      width: `${ref.current.offsetWidth}px`,
      top: "0",
      left: "0",
      pointerEvents: "none",
      userSelect: "none",
      visibility: "hidden",
      opacity: "0",
      zIndex: "-1",
    });
    document.body.appendChild(clonedRef);
    setContentHeight(clonedRef.offsetHeight);
    clonedRef.remove();
  }, [childrenHash]);

  return (
    <div
      ref={ref}
      aria-hidden={!expand}
      style={{
        ...(expand
          ? { height: `${contentHeight}px`, opacity: 1 }
          : { height: "0px", opacity: 0 }),
        transitionDuration: tokens.transitionDurationChill,
        transitionTimingFunction: tokens.transitionTimingFunctionChill,
        transitionProperty: "height, opacity",
        overflowY: "hidden",
      }}
    >
      {children}
    </div>
  );
};
