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

export function IconTabsContent() {
  const { inputRef, getFile, resetFile } = useFileInput();
  const snap = useSnapshot(tabsStore);

  useTabsEmitterSubmit({
    tab: "icon",
    onSubmit: async () => {
      const file = getFile();
      return {
        iconImage:
          tabsStore.iconImage === null
            ? null
            : file
              ? await uploadImage({ file })
              : undefined,
      };
    },
  });

  return (
    <TabsContent value="icon">
      <Text>Icons make your Tinypad recognizeable from afar.</Text>
      <View className="flex-row gap-3">
        <Button
          className="flex-1"
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          <RiImageIcon />
          Upload an icon
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          disabled={!snap.iconImage}
          onClick={() => {
            if (tabsStore.iconImage) {
              URL.revokeObjectURL(tabsStore.iconImage);
            }
            tabsStore.iconImage = null;
            resetFile();
          }}
        >
          <RiDeleteBinIcon />
          Remove icon
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

            if (tabsStore.iconImage) {
              URL.revokeObjectURL(tabsStore.iconImage);
            }
            tabsStore.iconImage = URL.createObjectURL(file);
          }}
        />
      </VisuallyHidden.Root>

      {snap.iconImage ? (
        <img
          src={snap.iconImage}
          className="border-outline-dimmest h-14 w-14 border"
        />
      ) : null}
    </TabsContent>
  );
}
