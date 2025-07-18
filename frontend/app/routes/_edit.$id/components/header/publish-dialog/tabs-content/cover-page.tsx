import {
  Button,
  RiDeleteBinIcon,
  RiImageIcon,
  Text,
  View,
  VisuallyHidden,
} from "natmfat";
import { useSnapshot } from "valtio";
import { useFileInput } from "~/routes/_edit.$id/hooks/use-file-input";
import { allowedContentTypes } from "~/routes/api.generateSignedPolicy/action-schema";
import { TabsContent, tabsStore, useTabsEmitterSubmit } from "../tabs";
import { uploadImage } from "../utils";

export function CoverPageTabsContent() {
  const { inputRef, getFile, resetFile } = useFileInput();
  const snap = useSnapshot(tabsStore);

  useTabsEmitterSubmit({
    tab: "cover_page",
    onSubmit: async () => {
      const file = getFile();

      return {
        coverImage:
          snap.coverImage === null
            ? null
            : file
              ? await uploadImage({ file })
              : undefined,
      };
    },
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
        <Button
          variant="outline"
          className="flex-1"
          disabled={!snap.coverImage}
          onClick={() => {
            tabsStore.coverImage = null;
            resetFile();
          }}
        >
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
            const file = getFile();
            if (!file) {
              return;
            }

            if (tabsStore.coverImage) {
              URL.revokeObjectURL(tabsStore.coverImage);
            }
            tabsStore.coverImage = URL.createObjectURL(file);
          }}
        />
      </VisuallyHidden.Root>

      {snap.coverImage ? (
        <img
          src={snap.coverImage}
          className="border-outline-dimmest aspect-video w-full border object-cover"
        />
      ) : null}
    </TabsContent>
  );
}
