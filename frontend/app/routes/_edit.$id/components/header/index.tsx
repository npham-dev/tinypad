import { RiBook3Icon, Separator, View } from "natmfat";
import { Clui } from "./clui";
import { RenamePopover } from "./rename-popover";

import { tokens } from "natmfat/lib/tokens";
import { Awareness } from "./awareness";
import { InvitePopover } from "./invite-popover";
import { PublishDialog } from "./publish-dialog";

export function Header() {
  return (
    <View asChild>
      <header className="shrink-0 select-none flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="to-primary-dimmest h-8 w-8 items-center justify-center bg-gradient-to-tr from-transparent">
            <RiBook3Icon color={tokens.white} />
          </View>
          <RenamePopover />
          <Separator
            orientation="vertical"
            className="bg-outline-dimmest h-8"
          />
          <Clui />
        </View>

        <View className="flex-row">
          <Awareness />
          <InvitePopover />
          <PublishDialog />
        </View>
      </header>
    </View>
  );
}
