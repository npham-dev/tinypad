import { RiAddIcon, RiCloseIcon, Text, View } from "natmfat";
import { cn } from "natmfat/lib/cn";
import { mergeRefs } from "natmfat/lib/mergeRefs";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MaxLengthText } from "~/components/max-length-text";
import { TabsContent } from "../tabs";

const MAX_TAGS = 5;

export function TagsTabContent() {
  const [tags, setTags] = useState<string[]>([]);

  return (
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
            } else if (e.key === "Backspace" && target.value.length === 0) {
              setTags((prevTags) =>
                prevTags.filter((_, i) => i < prevTags.length - 1),
              );
            }
          }}
        />
      </View>
    </TabsContent>
  );
}

export function Tag({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <View className="bg-interactive border-interactive h-7 w-fit select-none flex-row items-center gap-0.5 rounded-full border px-2">
      <Text size="small">
        <span className="text-foreground-dimmest">#</span>
        <span className="text-foreground-dimmer">{name}</span>
      </Text>
      <View className="cursor-pointer" onClick={onClose}>
        <RiCloseIcon />
      </View>
    </View>
  );
}

export const TagInput = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input">
>(({ className, style, onChange: onChangeInner, ...props }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const resizeInput = useCallback(() => {
    if (!inputRef.current) {
      return;
    }

    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden"; // Make sure it's not visible
    tempSpan.style.whiteSpace = "pre"; // Preserve spaces and formatting
    tempSpan.style.font = window.getComputedStyle(inputRef.current).font; // Use the same font as the input
    tempSpan.textContent =
      inputRef.current.value || inputRef.current.placeholder; // Use value or placeholder if empty
    document.body.appendChild(tempSpan);

    const newWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    inputRef.current.style.width = `${newWidth}px`;
  }, []);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      resizeInput();
      if (onChangeInner) {
        onChangeInner(e);
      }
    },
    [onChangeInner],
  );

  useEffect(() => {
    resizeInput();
  }, [props.value]);

  return (
    <View className="border-interactive focus-within:shadow-focus duration-snappy h-7 w-fit flex-row items-center gap-1 rounded-full border pl-2 pr-3 transition-shadow">
      <RiAddIcon />
      <input
        className={cn(
          "text-small placeholder:text-foreground-dimmest border-none bg-transparent px-0 outline-none",
          className,
        )}
        maxLength={30}
        onChange={onChange}
        ref={mergeRefs(ref, inputRef)}
        placeholder="Add a tag"
        {...props}
      />
    </View>
  );
});
