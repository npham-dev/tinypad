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
  RiImageIcon,
  RiUploadIcon,
  Surface,
  Tabs,
  TabsContent as TabsContentRoot,
  TabsList,
  TabsSeparator,
  TabsTrigger,
  Text,
  View,
  VisuallyHidden,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import {
  type ComponentProps,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLoaderData } from "react-router";
import {
  LabeledInput,
  LabeledMultilineInput,
} from "~/components/labeled-input";
import { MaxLengthText } from "~/components/max-length-text";
import type { loader } from "../../../server/loader.server";
import {
  DEFAULT_PROJECT_BODY,
  DEFAULT_PROJECT_HEADING,
  Preview,
  PreviewSkeleton,
} from "./preview";
import { Tag, TagInput } from "./tag";

// render list of tab triggers from the TABS array, allows you to easily create new tabs
const TABS = ["basics", "tags", "icon", "cover_page"] as const;
type TabValue = (typeof TABS)[number];

const MAX_TAGS = 5;

export function PublishDialog() {
  // handle navigation between panels
  const [tab, setTab] = useState<TabValue>("basics");
  const [completedTabs, setCompletedTabs] = useState<
    Partial<Record<TabValue, boolean>>
  >({});

  // ensure pad data is up to date
  const { pad } = useLoaderData<typeof loader>();
  const [heading, setHeading] = useState(pad.name);
  const [body, setBody] = useState(pad.description);
  useEffect(() => {
    setHeading(pad.name);
    setBody(pad.description);
  }, [pad.name, pad.description]);

  // tags tab
  const [tags, setTags] = useState<string[]>([]);
  const index = TABS.indexOf(tab);

  const completeTab = useCallback(
    (tab?: TabValue) => {
      setCompletedTabs((prevCompletedTabs) => ({
        ...prevCompletedTabs,
        [tab ? tab : TABS[index]]: true,
      }));
    },
    [index],
  );

  return (
    <Dialog
      maxWidth={872}
      onOpenChange={(open) => {
        // reset navigation state
        if (!open) {
          setTab("basics");
          setCompletedTabs({});
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
            <Tabs
              variant="progress"
              value={tab}
              onValueChange={(nextTab) => setTab(nextTab as TabValue)}
              className="h-full flex-1"
            >
              <TabsList>
                {TABS.map((tab, i) => (
                  <Fragment key={tab}>
                    <TabsTrigger value={tab} complete={completedTabs[tab]}>
                      {formatTabTitle(tab)}
                    </TabsTrigger>
                    {i !== TABS.length - 1 ? <TabsSeparator /> : null}
                  </Fragment>
                ))}
              </TabsList>
              <TabsContent value="basics">
                <LabeledInput
                  label="Name"
                  name="heading"
                  maxLength={60}
                  placeholder={DEFAULT_PROJECT_HEADING}
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                />
                <LabeledMultilineInput
                  label="Description"
                  name="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={DEFAULT_PROJECT_BODY}
                  maxLength={600}
                  className="min-h-18 resize-none"
                />
              </TabsContent>
              <TabsContent value="tags">
                <View className="flex-row items-center justify-between">
                  <Text>Tags help others find your work on the web.</Text>
                  <MaxLengthText length={tags.length} maxLength={MAX_TAGS} />
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      name={tag}
                      onClose={() => {
                        setTags((prevTags) =>
                          prevTags.filter((currentTag) => currentTag !== tag),
                        );
                      }}
                    />
                  ))}
                  <TagInput
                    onKeyDown={(e) => {
                      const target = e.target as HTMLInputElement;
                      const fmtTagValue = target.value.trim();
                      if (e.key === "Enter" && !tags.includes(fmtTagValue)) {
                        setTags((prevTags) => [...prevTags, fmtTagValue]);
                        target.value = "";
                      } else if (
                        e.key === "Backspace" &&
                        target.value.length === 0
                      ) {
                        setTags((prevTags) =>
                          prevTags.filter((_, i) => i < prevTags.length - 1),
                        );
                      }
                    }}
                  />
                </View>
              </TabsContent>
              <TabsContent value="icon">
                <Text>Icons make your Tinypad recognizeable from afar.</Text>
                <Button>
                  <RiImageIcon />
                  Upload an icon
                </Button>
              </TabsContent>
              <TabsContent value="cover_page">
                <Text multiline>Cover images are useful for link embeds.</Text>
                <View>
                  <Button>
                    <RiImageIcon />
                    Upload a cover photo
                  </Button>
                </View>
              </TabsContent>
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
                    completeTab();
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
              <Preview name={heading} description={body} />
              <PreviewSkeleton variant="top" />

              {/* <PostSkeleton variant="bottom" />
              <PostPreview
                author={user}
                type={PostType.PROJECT}
                tags={tags}
                thumbnailUrl=""
                heading={heading || DEFAULT_PROJECT_HEADING}
                body={body || DEFAULT_PROJECT_BODY}
              />
              <PostSkeleton variant="top" /> */}
            </View>
          </Surface>
        </View>
      </DialogContent>
    </Dialog>
  );
}

function TabsContent({
  value,
  children,
  ...props
}: Omit<ComponentProps<typeof TabsContentRoot>, "value" | "asChild"> & {
  value: TabValue;
}) {
  return (
    <TabsContentRoot value={value} asChild {...props}>
      <View className="relative h-full flex-1 gap-4">{children}</View>
    </TabsContentRoot>
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
