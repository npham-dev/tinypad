import confetti from "canvas-confetti";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Heading,
  RiArrowLeftIcon,
  RiArrowRightIcon,
  RiArticleIcon,
  RiUploadIcon,
  Surface,
  Tabs,
  TabsList,
  TabsSeparator,
  TabsTrigger,
  Text,
  View,
  VisuallyHidden,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import { Fragment, useCallback, useState } from "react";
import { useSnapshot } from "valtio";
import { usePadId } from "~/routes/_edit.$id/hooks/use-pad-id";
import { editorStore } from "~/routes/_edit.$id/stores/editor-store";
import { Preview, PreviewSkeleton } from "./preview";
import { PublishedDialog, publishedDialogEmitter } from "./published-dialog";
import { SyncTabsStore, TABS, tabsEmitter, type TabValue } from "./tabs";
import { BasicsTabContent } from "./tabs-content/basics";
import { CoverPageTabsContent } from "./tabs-content/cover-page";
import { IconTabsContent } from "./tabs-content/icon";
import { TagsTabContent } from "./tabs-content/tags";
import { publishPad } from "./utils";

export function PublishDialog() {
  // handle navigation between panels
  const [tab, setTab] = useState<TabValue>("basics");

  // tags tab
  const index = TABS.indexOf(tab);
  const padId = usePadId();

  const [open, setOpen] = useState(false);
  const snap = useSnapshot(editorStore);

  const submitTab = useCallback(
    (tab?: TabValue) => {
      tabsEmitter.emit("submit", { tab: tab || TABS[index] });
    },
    [index],
  );

  return (
    <>
      <Dialog
        maxWidth={872}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          // reset navigation state on close
          if (!open) {
            setTab("basics");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <RiArticleIcon />
            Publish
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0">
          <VisuallyHidden.Root>
            <DialogTitle>Publish your Tinypad</DialogTitle>
            <DialogDescription>
              Publish your Tinypad to the world! Publishing creates a read-only
              website for others to view.
            </DialogDescription>
          </VisuallyHidden.Root>

          <View className="flex-row">
            <Surface elevated className="relative w-2/5 gap-2 p-4">
              <Heading size="headerDefault">Publish your Tinypad</Heading>
              <SyncTabsStore />
              <Tabs
                variant="progress"
                value={tab}
                onValueChange={(nextTab) =>
                  setTab((prevTab) => {
                    submitTab(prevTab);
                    return nextTab as TabValue;
                  })
                }
                className="h-full flex-1"
                key={String(open)}
              >
                <TabsList>
                  {TABS.map((tab, i) => (
                    <Fragment key={tab}>
                      <TabsTrigger value={tab}>
                        {formatTabTitle(tab)}
                      </TabsTrigger>
                      {i !== TABS.length - 1 ? <TabsSeparator /> : null}
                    </Fragment>
                  ))}
                </TabsList>
                <BasicsTabContent />
                <TagsTabContent />
                <IconTabsContent />
                <CoverPageTabsContent />
              </Tabs>

              <View className="absolute bottom-0 left-0 w-full flex-row p-4">
                {index > 0 ? (
                  <Button
                    className="self-start"
                    type="button"
                    onClick={() => setTab(TABS[index - 1])}
                  >
                    <RiArrowLeftIcon /> Back
                  </Button>
                ) : null}

                {index < TABS.length - 1 ? (
                  <Button
                    color="primary"
                    className="ml-auto justify-self-end"
                    type="button"
                    onClick={() => {
                      submitTab();
                      setTab(TABS[index + 1]);
                    }}
                  >
                    Next <RiArrowRightIcon />
                  </Button>
                ) : null}

                {index === TABS.length - 1 ? (
                  <Button
                    color="primary"
                    className="border-primary-stronger ml-auto justify-self-end border"
                    style={{
                      boxShadow: `0 0 ${tokens.space16} ${tokens.primaryDimmer}`,
                    }}
                    onClick={() => {
                      submitTab();
                      const content = snap.editor?.getHTML();
                      if (!content) {
                        return;
                      }

                      publishPad({ padId, content });
                      setOpen(false);
                      setTab("basics"); // reset navigation b/c onOpenChange won't trigger w/ manual state change

                      publishedDialogEmitter.emit("published");

                      confetti({
                        angle: 45,
                        spread: 60,
                        particleCount: 100,
                        origin: { x: 0, y: 0.8 },
                      });
                      confetti({
                        angle: 180 - 45,
                        spread: 60,
                        particleCount: 100,
                        origin: { x: 1, y: 0.8 },
                      });
                    }}
                    type="submit"
                  >
                    <RiUploadIcon />
                    Publish your Tinypad
                  </Button>
                ) : null}
              </View>
            </Surface>

            <Surface
              background="root"
              className="w-full flex-1 overflow-hidden p-4"
            >
              <Text color="dimmer">Preview</Text>
              <View className="pointer-events-none select-none gap-6 px-10">
                <PreviewSkeleton variant="bottom" />
                <Preview />
                <PreviewSkeleton variant="top" />
              </View>
            </Surface>
          </View>
        </DialogContent>
      </Dialog>
      <PublishedDialog />
    </>
  );
}

/**
 * Convert a TabValue into a readable string with proper capitalization \
 * Allows us to use a single array as the base for all tabs
 * @param tab TabValue to convert
 * @returns Properly capitalized tab value
 *
 * @example
 * formatTabTitle("cover_page") // => "Cover Page"
 */
function formatTabTitle(tab: TabValue) {
  return tab
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}
