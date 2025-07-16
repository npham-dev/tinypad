import {
  RiCloudIcon,
  RiCloudOffIcon,
  RiNotificationIcon,
  Text,
  View,
} from "natmfat";

import { useSnapshot } from "valtio";
import { useUser } from "../../hooks/use-user";
import { editorStore, Status } from "../../stores/editor-store";
import { StatusAction, StatusIcon } from "./status";

export const StatusBar = () => {
  const snap = useSnapshot(editorStore);
  const user = useUser();

  return (
    <View className="text-foreground-dimmest shrink-0 flex-row items-center justify-between select-none">
      <View className="flex-row">
        <StatusAction>
          <View
            className="h-1.5 w-1.5"
            style={{ backgroundColor: user.color }}
          ></View>
          <Text>{user.name}</Text>
        </StatusAction>
      </View>
      <View className="flex-row">
        <StatusAction>
          {snap.status === Status.CONNECTED ? (
            <>
              <RiCloudIcon />
              <Text>Connected</Text>
            </>
          ) : (
            <>
              <RiCloudOffIcon />
              <Text>Disconnected</Text>
            </>
          )}
        </StatusAction>
        <StatusIcon alt="Notifications">
          <RiNotificationIcon />
        </StatusIcon>
      </View>
    </View>
  );
};
