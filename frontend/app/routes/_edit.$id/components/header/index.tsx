import {
  Button,
  RiArticleIcon,
  RiBookIcon,
  RiUserAddIcon,
  View,
} from "natmfat";
import { Clui } from "./clui";
import { RenamePopover } from "./rename-popover";

import { tokens } from "natmfat/lib/tokens";

export function Header() {
  return (
    <View asChild>
      <header className="shrink-0 flex-row items-center justify-between select-none">
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center">
            <View className="to-primary-dimmest h-8 w-8 items-center justify-center bg-gradient-to-tr from-transparent">
              <RiBookIcon color={tokens.white} />
            </View>
            <RenamePopover />
          </View>
        </View>

        <View className="flex-row">
          <Clui />
          <Button>
            <RiUserAddIcon />
            Invite
          </Button>
          <Button>
            <RiArticleIcon />
            Publish
          </Button>
        </View>
      </header>
    </View>
  );
}
