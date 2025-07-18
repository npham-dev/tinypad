import { Button, RiImageIcon, Text, View } from "natmfat";
import { useEmitter } from "~/routes/_edit.$id/hooks/use-emitter";
import { TabsContent, tabsEmitter } from "../tabs";

export function CoverPageTabsContent() {
  useEmitter(tabsEmitter, "submit", ({ tab }) => {
    if (tab !== "cover_page") {
      return;
    }
  });

  return (
    <TabsContent value="cover_page">
      <Text multiline>Cover images are useful for link embeds.</Text>
      <View>
        <Button>
          <RiImageIcon />
          Upload a cover photo
        </Button>
      </View>
    </TabsContent>
  );
}
