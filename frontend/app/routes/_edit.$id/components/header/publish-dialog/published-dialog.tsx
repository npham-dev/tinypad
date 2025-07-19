import mitt from "mitt";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  RiExternalLinkIcon,
} from "natmfat";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { useEmitter } from "~/routes/_edit.$id/hooks/use-emitter";
import type { loader } from "~/routes/_edit.$id/server/loader.server";

export const publishedDialogEmitter = mitt<{
  published: void;
}>();

export function PublishedDialog() {
  const { pad } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(false);

  useEmitter(publishedDialogEmitter, "published", () => {
    setOpen(true);
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="gap-3">
        <DialogTitle>Share your tinypad</DialogTitle>
        <DialogDescription multiline>
          Now that you've published your tinypad, you can share it with anyone
          on the web! Published versions only change when you published again.
        </DialogDescription>

        <Button color="primary" asChild>
          <a
            href={`/view/${pad.publishedSlug}`}
            target="_blank"
            rel="noreferrer"
          >
            Open published tinypad
            <RiExternalLinkIcon />
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
