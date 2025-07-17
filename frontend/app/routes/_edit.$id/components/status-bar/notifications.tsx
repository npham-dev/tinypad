import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  RiNotificationIcon,
  Text,
  View,
} from "natmfat";

import { useSnapshot } from "valtio";
import { notificationStore, readAll } from "../../stores/notification-store";
import { StatusIcon } from "./status";

export function Notifications() {
  const snap = useSnapshot(notificationStore);

  return (
    <Popover
      onOpenChange={(open) => {
        // read all notifications when opened
        if (!open) {
          readAll();
        }
      }}
    >
      <PopoverTrigger asChild>
        <StatusIcon alt="Notifications">
          <RiNotificationIcon />
        </StatusIcon>
      </PopoverTrigger>
      <PopoverContent>
        <View className="max-h-32 w-72 overflow-y-scroll">
          {snap.notifications.length > 0 ? (
            snap.notifications.map((notification) => (
              <View key={notification.id}>
                <Text color={notification.read ? "dimmest" : "default"}>
                  {notification.message}
                </Text>
              </View>
            ))
          ) : (
            <View className="text-center">
              <Text color="dimmer">You're all caught up!</Text>
            </View>
          )}
        </View>
      </PopoverContent>
    </Popover>
  );
}
