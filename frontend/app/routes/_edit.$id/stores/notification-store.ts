import { v4 as uuidv4 } from "uuid";
import { proxy } from "valtio";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

type NotificationStore = {
  joinHistory: Set<string>;
  notifications: Notification[];
};

export const notificationStore = proxy<NotificationStore>({
  joinHistory: new Set(),
  notifications: [],
});

export const notify = (message: string) => {
  notificationStore.notifications.push({
    id: uuidv4(),
    message,
    read: false,
    createdAt: new Date(Date.now()),
  });
};

export const readAll = () => {
  for (const notification of notificationStore.notifications) {
    notification.read = true;
  }
};
