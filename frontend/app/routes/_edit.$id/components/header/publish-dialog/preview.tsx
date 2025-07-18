import { Heading, Surface, Text, View } from "natmfat";
import { cn } from "natmfat/lib/cn";
import { useSnapshot } from "valtio";
import { tabsStore } from "./tabs";

export const DEFAULT_PROJECT_NAME = "My first tinypad";
export const DEFAULT_PROJECT_DESCRIPTION = "Say hello to the world!";

type PreviewSkeletonProps = {
  variant: "top" | "bottom";
};

export function PreviewSkeleton(props: PreviewSkeletonProps) {
  return (
    <Surface
      className={cn(
        "after:from-background-root after:h-10/12 w-full gap-2 p-3 after:absolute after:left-0 after:right-0 after:block after:w-full after:content-['']",
        props.variant === "top"
          ? "after:bottom-0 after:bg-gradient-to-t"
          : "after:top-0 after:bg-gradient-to-b",
      )}
      elevated
    >
      <View className="flex-row items-center gap-3">
        <Surface elevated className="h-8 w-8"></Surface>
        <View className="gap-1">
          <Surface elevated className="h-4 w-14" />
          <Surface elevated className="h-3 w-28" />
        </View>
      </View>
      <View className="gap-1">
        <Surface elevated className="h-4 w-32"></Surface>
        <Surface elevated className="h-4 w-full"></Surface>
      </View>
    </Surface>
  );
}

export function Preview() {
  const snap = useSnapshot(tabsStore);

  return (
    <Surface className="w-full gap-2 p-3" elevated>
      <View className="flex-row items-center gap-3">
        <img
          src={snap.iconImage || "/favicon.svg"}
          className="border-outline-dimmest h-8 w-8 border"
        />
        <View>
          <Text>Tinypad</Text>
          <Text size="small" color="dimmer">
            https://tinypad.com
          </Text>
        </View>
      </View>
      <View className="gap-1">
        <Heading
          size="subheadDefault"
          className="font-regular text-primary-stronger"
        >
          {snap.name || DEFAULT_PROJECT_NAME}
        </Heading>
        <Text color="dimmer" maxLines={1}>
          {snap.description || DEFAULT_PROJECT_DESCRIPTION}
        </Text>
      </View>
    </Surface>
  );
}
