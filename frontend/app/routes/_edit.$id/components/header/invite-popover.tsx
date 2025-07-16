import {
  Button,
  Heading,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RiLinkIcon,
  RiUserAddIcon,
  Surface,
  Text,
  toast,
  View,
} from "natmfat";
import { copyToClipboard } from "natmfat/lib/copyToClipboard";
import { ClientOnly } from "remix-utils/client-only";

export function InvitePopover() {
  return (
    <Popover>
      <PopoverContent align="end" className="w-80 gap-2">
        <View>
          <Heading level={1} size="subheadDefault">
            Private join link
          </Heading>
          <Text multiline color="dimmer" size="small">
            Anyone with this link can edit this pad
          </Text>
        </View>
        <View className="flex-row">
          <Surface elevated className="relative flex-1 overflow-hidden pr-2">
            <View className="relative h-8 flex-row items-center overflow-y-scroll pl-2">
              <ClientOnly>
                {() => (
                  <span className="whitespace-nowrap">
                    {window.location.href}
                  </span>
                )}
              </ClientOnly>
            </View>
          </Surface>
          <Button
            color="primary"
            onClick={() => {
              copyToClipboard(window.location.href);
              toast({
                type: "success",
                description: "Copied link to clipboard.",
              });
            }}
          >
            <RiLinkIcon /> Copy link
          </Button>
        </View>
      </PopoverContent>
      <PopoverTrigger asChild>
        <Button>
          <RiUserAddIcon />
          Invite
        </Button>
      </PopoverTrigger>
    </Popover>
  );
}
