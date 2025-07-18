import {
  Button,
  RiDeleteBinIcon,
  RiImageIcon,
  Text,
  View,
  VisuallyHidden,
} from "natmfat";
import { useRef } from "react";
import { useEmitter } from "~/routes/_edit.$id/hooks/use-emitter";
import { allowedContentTypes } from "~/routes/api.generateSignedPolicy/action-schema";
import { TabsContent, tabsEmitter } from "../tabs";

export function CoverPageTabsContent() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEmitter(tabsEmitter, "submit", ({ tab }) => {
    if (tab !== "cover_page") {
      return;
    }
  });

  return (
    <TabsContent value="cover_page">
      <Text multiline>Cover images are useful for link embeds.</Text>
      <View className="flex-row gap-3">
        <Button
          className="flex-1"
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          <RiImageIcon />
          Upload an image
        </Button>
        <Button variant="outline" className="flex-1" disabled>
          <RiDeleteBinIcon />
          Remove image
        </Button>
      </View>

      <VisuallyHidden.Root>
        <input
          type="file"
          accept={allowedContentTypes.join(",")}
          ref={inputRef}
          onChange={() => {
            console.log("hey hye");
          }}
        />
      </VisuallyHidden.Root>

      <img
        src="/favicon.svg"
        className="border-outline-dimmest aspect-video w-full border object-cover"
      />
    </TabsContent>
  );
}
