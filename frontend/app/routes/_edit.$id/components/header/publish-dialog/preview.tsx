import { Heading, Surface, Text, View } from "natmfat";
import { cn } from "natmfat/lib/cn";

export const DEFAULT_PROJECT_HEADING = "My first website";
export const DEFAULT_PROJECT_BODY = "Say hello to the world!";

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

type PreviewProps = {
  name?: string;
  description?: string;
};

export function Preview(props: PreviewProps) {
  return (
    <Surface className="w-full gap-2 p-3" elevated>
      <View className="flex-row items-center gap-3">
        <img src="/favicon.svg" className="h-8 w-8" />
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
          {props.name || DEFAULT_PROJECT_HEADING}
        </Heading>
        <Text color="dimmer" maxLines={1}>
          {props.description || DEFAULT_PROJECT_BODY}
        </Text>
      </View>
    </Surface>
  );
}
