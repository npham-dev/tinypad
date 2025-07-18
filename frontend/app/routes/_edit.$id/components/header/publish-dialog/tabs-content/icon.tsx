import { Button, RiImageIcon, Text } from "natmfat";
import { TabsContent } from "../tabs";

export function IconTabsContent() {
  return (
    <TabsContent value="icon">
      <Text>Icons make your Tinypad recognizeable from afar.</Text>
      <Button>
        <RiImageIcon />
        Upload an icon
      </Button>
    </TabsContent>
  );
}
