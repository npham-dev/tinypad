import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DialogDescription,
  DialogTitle,
  Interactive,
  RiCommandIcon,
  RiGithubIcon,
  RiTwitterXIcon,
  Surface,
  Text,
  View,
  VisuallyHidden,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const commands: Record<
  string,
  {
    icon: React.ReactNode;
    name: string;
    href: string;
  }[]
> = {
  Editor: [],
  Socials: [
    {
      icon: <RiGithubIcon />,
      name: "GitHub",
      href: "https://github.com/npham-dev/tinypad",
    },
    {
      icon: <RiTwitterXIcon />,
      name: "X (Twitter)",
      href: "https://twitter.com/npham_dev",
    },
  ],
};

const isExternal = (href: string) => href.startsWith("https");

export function Clui() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      // clicked outside of modal
      if (
        !(
          ref.current &&
          e.target &&
          ref.current.contains(e.target as HTMLElement)
        )
      ) {
        setOpen(false);
      }
    });
  }, []);

  useHotkeys(
    "meta+k",
    (e) => {
      e.preventDefault();
      setOpen(true);
    },
    [],
  );

  return (
    <>
      <Interactive variant="fill">
        <View
          className="text-foreground-dimmest hover:text-foreground-dimmer h-8 w-72 max-w-full shrink-1 flex-row items-center justify-between gap-2 px-1 select-none"
          onClick={() => setOpen(true)}
        >
          <Text className="pl-2">Search & run commands</Text>
          <Surface
            elevated
            className="text-small border-outline-dimmest flex-row items-center gap-1 rounded-md border px-0.5"
          >
            <RiCommandIcon size={tokens.space12} />K
          </Surface>
        </View>
      </Interactive>

      <CommandDialog open={open} onOpenChange={setOpen} maxWidth="400px">
        <VisuallyHidden.Root>
          <DialogTitle>Search and run commands.</DialogTitle>
          <DialogDescription>
            The command menu allows you to access common tools and navigate
            around the editor.
          </DialogDescription>
        </VisuallyHidden.Root>
        <Command ref={ref}>
          <CommandInput autoFocus placeholder="Search & run commands" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(commands).map(([heading, items]) => (
              <CommandGroup heading={heading} key={heading}>
                {items.map(({ icon, name, href }) => (
                  <CommandItem
                    key={name}
                    onSelect={() => {
                      if (isExternal(href)) {
                        openNewTab(href);
                      } else {
                        // router.push(href);
                      }
                      setOpen(false);
                    }}
                  >
                    {icon} {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

function openNewTab(href: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.setAttribute("target", "_blank");
  anchor.setAttribute("rel", "noreferrer");
  anchor.click();
}
