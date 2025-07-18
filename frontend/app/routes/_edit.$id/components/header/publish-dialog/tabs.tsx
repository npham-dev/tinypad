import type { FormMetadata } from "@conform-to/react";
import { tryCatch } from "common/lib/try-catch";
import mitt from "mitt";
import { TabsContent as TabsContentRoot, toast, View } from "natmfat";
import { useEffect, useRef, type ComponentProps } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { proxy } from "valtio";
import type z from "zod";
import { useEmitter } from "~/routes/_edit.$id/hooks/use-emitter";
import { usePadId } from "~/routes/_edit.$id/hooks/use-pad-id";
import type { loader } from "~/routes/_edit.$id/server/loader.server";
import type { updatePadSchema } from "~/routes/api.pad.$id/action-schema";
import { updatePad } from "./utils";

// @todo this feels like a load of junk
// reorganize and fix this mess later

type TabsStore = {
  name: string;
  description: string;
  iconImage: string | null;
  coverImage: string | null;
  // we don't have tags  in here bc we don't need it
  // preview doesn't use it
};

export const tabsStore = proxy<TabsStore>({
  // needed for the tab preview
  name: "",
  description: "",
  iconImage: null,
  coverImage: null,
});

export const tabsEmitter = mitt<{
  // triggered for form & when next button pressed
  submit: { tab: TabValue };
  close: void;
}>();

type MaybePromise<T> = T | Promise<T>;

export const useTabsEmitterSubmit = (args: {
  form?: FormMetadata<any>;
  tab: TabValue;
  onSubmit: () => MaybePromise<
    z.infer<typeof updatePadSchema> | void | undefined | null
  >;
  onSubmitAfter?: () => MaybePromise<void | undefined | null>;
}) => {
  const pending = useRef(false);
  const revalidator = useRevalidator();
  const padId = usePadId();

  useEmitter(tabsEmitter, "submit", async ({ tab }) => {
    if (
      tab !== args.tab ||
      (args.form && Object.keys(args.form.allErrors).length > 0) ||
      pending.current
    ) {
      return;
    }

    pending.current = true;

    const formDataResult = await tryCatch(args.onSubmit());
    if (formDataResult.error !== null) {
      toast({
        type: "error",
        description: "Failed to update pad",
      });
    } else if (formDataResult.data) {
      await tryCatch(updatePad({ formData: formDataResult.data, padId }));
    }

    if (args.onSubmitAfter) {
      await tryCatch(args.onSubmitAfter());
    }

    pending.current = false;
    revalidator.revalidate();
  });
};

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
      <View className="relative h-full flex-1 gap-3" asChild={asChild}>
        {children}
      </View>
    </TabsContentRoot>
  );
}

export function SyncTabsStore(props: { children?: React.ReactNode }) {
  // ensure tabs store is synced w/ loader data
  // yes the store is necessary for live preview changes
  // without it, we'd only see changes on save & revalidate
  const { pad } = useLoaderData<typeof loader>();
  useEffect(() => {
    tabsStore.name = pad.name;
    tabsStore.description = pad.description;
    tabsStore.iconImage = pad.iconImage;
    tabsStore.coverImage = pad.coverImage;
  }, [pad.name, pad.description, pad.iconImage, pad.coverImage]);
  return <>{props.children}</>;
}
