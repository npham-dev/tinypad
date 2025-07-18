import mitt from "mitt";
import { TabsContent as TabsContentRoot, View } from "natmfat";
import { type ComponentProps } from "react";
import { proxy } from "valtio";

type TabsStore = {
  name: string;
  description: string;
  tags: string[];
};

export const tabsStore = proxy<TabsStore>({
  // needed for the tab preview
  name: "",
  description: "",
  tags: [],
});

export const tabsEmitter = mitt<{
  // triggered for form & when next button pressed
  submit: { tab: TabValue };
  close: void;
}>();

export const TABS = ["basics", "tags", "icon", "cover_page"] as const;
export type TabValue = (typeof TABS)[number];

export function TabsContent({
  value,
  children,
  asChild,
  ...props
}: Omit<ComponentProps<typeof TabsContentRoot>, "value"> & {
  value: TabValue;
}) {
  return (
    <TabsContentRoot value={value} asChild {...props}>
      <View className="relative h-full flex-1 gap-4" asChild={asChild}>
        {children}
      </View>
    </TabsContentRoot>
  );
}
