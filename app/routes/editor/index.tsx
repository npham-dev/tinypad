import {
  Button,
  Interactive,
  RiArticleIcon,
  RiBookletIcon,
  RiLock2FillIcon,
  RiLockIcon,
  RiUserAddIcon,
  Text,
  View,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import type { Route } from "./+types";
import { Clui } from "./components/clui";
import { Editor } from "./components/editor";

export async function loader({ params }: Route.LoaderArgs) {
  return params.id;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <View className="h-screen">
      <View asChild>
        <header className="shrink-0 flex-row items-center justify-between p-2">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-2">
              <RiBookletIcon color={tokens.primaryDefault} />
              <View className="flex-row items-center">
                <Text>tinypad</Text>
                <Text color="dimmest" className="pl-3 pr-1.5">
                  /
                </Text>
                <Interactive variant="noFill">
                  <View className="flex-row items-center gap-1 px-1.5">
                    <Text className="font-medium">hocuspocus</Text>
                    <RiLockIcon size={tokens.space12} />
                  </View>
                </Interactive>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
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

      <View className="h-full flex-1 flex-row gap-2 px-2 pb-2 overflow-hidden">
        <View
          className="rounded-default h-full w-full flex-1 px-4 py-3 overflow-y-auto"
          style={{
            background:
              "color-mix(in srgb, var(--interactive-background) 60%, var(--surface-background))",
          }}
        >
          <Editor />
        </View>
      </View>
    </View>
  );
}
