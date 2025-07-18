import {
  Button,
  RiDeleteBinIcon,
  RiImageIcon,
  Text,
  View,
  VisuallyHidden,
} from "natmfat";
import { useCallback, useRef } from "react";
import { useSnapshot } from "valtio";
import { allowedContentTypes } from "~/routes/api.generateSignedPolicy/action-schema";
import { TabsContent, tabsStore, useTabsEmitterSubmit } from "../tabs";
import { uploadImage } from "../utils";

export function IconTabsContent() {
  const inputRef = useRef<HTMLInputElement>(null);
  const snap = useSnapshot(tabsStore);

  const getFile = useCallback(
    () => (inputRef.current?.files || [])[0],
    [inputRef],
  );

  useTabsEmitterSubmit({
    tab: "icon",
    onSubmit: async () => {
      return {
        iconImage:
          snap.iconImage === null
            ? null
            : await uploadImage({ file: getFile() }),
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
            if (inputRef.current) {
              inputRef.current.value = "";
            }
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
            if (tabsStore.iconImage) {
              URL.revokeObjectURL(tabsStore.iconImage);
            }
            tabsStore.iconImage = URL.createObjectURL(getFile());
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
