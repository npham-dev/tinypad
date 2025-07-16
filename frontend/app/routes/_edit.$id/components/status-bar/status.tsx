import {
  IconButton,
  IconSizeProvider,
  Interactive,
  View,
  type IconButtonProps,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import type React from "react";
import type { ComponentPropsWithRef } from "react";

export function StatusAction({
  children,
  skip,
  ...props
}: {
  children: React.ReactNode;
  skip?: boolean;
} & ComponentPropsWithRef<"button">) {
  return (
    <Interactive variant="fill" skip={skip}>
      <View
        className="h-8 min-w-8 flex-row items-center justify-center gap-2 px-2"
        asChild
      >
        <button {...props}>
          <IconSizeProvider value={tokens.space16}>{children}</IconSizeProvider>
        </button>
      </View>
    </Interactive>
  );
}

export function StatusIcon({ alt, children, ...props }: IconButtonProps) {
  return (
    <IconButton
      alt={alt}
      className="h-8 w-8 rounded-none"
      variant="fill"
      {...props}
    >
      <IconSizeProvider value={tokens.space16}>{children}</IconSizeProvider>
    </IconButton>
  );
}
