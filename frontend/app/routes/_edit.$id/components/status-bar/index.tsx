import { IconButton, RiNotificationIcon, Text, View } from "natmfat";

import { tokens } from "natmfat/lib/tokens";
import { useUser } from "../../hooks/use-user";

export const StatusBar = () => {
  const user = useUser();

  return (
    <View className="shrink-0 flex-row items-center justify-between px-2 select-none">
      <View className="flex-row">
        <IconButton alt="Notifications" className="rounded-none">
          <RiNotificationIcon size={tokens.space12} />
        </IconButton>
      </View>
      {/* @todo change username */}
      <View className="flex-row items-center gap-1.5">
        <div
          className="h-1 w-1 rounded-full outline outline-white"
          style={{ background: user.color }}
        ></div>
        <Text size="small" color="dimmer">
          {user.name}
        </Text>
      </View>
    </View>
  );
};
