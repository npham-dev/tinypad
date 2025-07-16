import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { Surface, View } from "natmfat";
import { useEffect, useState, type ReactNode } from "react";
import { ref } from "valtio";
import * as Y from "yjs";
import { omit } from "~/lib/utils";
import { usePadId } from "../../hooks/use-pad-id";
import { useUser } from "../../hooks/use-user";
import { editorStore, Status } from "../../stores/editor-store";
import { RichTextLink } from "./rich-text-link";

// provider.on("synced", (isSynced) => {
//   console.log("Synced with peers:", isSynced);
// });
// provider.awareness.on("update", () => {
//   console.log(
//     "Awareness changed:",
//     Array.from(provider.awareness.getStates()),
//   );
// });

export const EditorProvider = (args: { children: ReactNode }) => {
  const user = useUser();
  const padId = usePadId();
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const editor = useEditor(
    {
      enableContentCheck: true,
      onContentError: ({ disableCollaboration }) => {
        editorStore.status = Status.DISCONNECTED;
        disableCollaboration();
      },
      onCreate: ({ editor: currentEditor }) => {
        if (provider) {
          provider.on("synced", () => {
            if (currentEditor.isEmpty) {
              currentEditor.commands.setContent(
                "<h1>Welcome to tinypad!</h1><p>tinypad is a smol multiplayer text editor with Markdown support.</p>",
              );
            }
          });
        }
      },
      autofocus: true,
      // @ts-ignore fix later, ts doesn't like dynamic extensions like we're doing here
      extensions: [
        RichTextLink,
        TextStyleKit,
        StarterKit.configure({
          // https://tiptap.dev/docs/collaboration/getting-started/install
          undoRedo: false,
          link: false,
        }),
        ydoc && Collaboration.configure({ document: ydoc }),
        ydoc &&
          provider &&
          CollaborationCaret.configure({
            provider,
            user: omit(user, ["token"]),
          }),
      ].filter((ext) => !!ext),
    },
    [ydoc, provider],
  );

  useEffect(() => {
    editorStore.editor = ref(editor);
  }, [editor]);

  useEffect(() => {
    const nextYdoc = new Y.Doc({ guid: padId });
    const nextProvider = new HocuspocusProvider({
      url: import.meta.env.VITE_HOCUSPOCUS_PROVIDER!,
      name: padId,
      document: nextYdoc,
      token: user.token,
      onConnect() {
        editorStore.status = Status.CONNECTED;
      },
      onDisconnect() {
        editorStore.status = Status.DISCONNECTED;
      },
      async onAwarenessChange(data) {
        console.log(data);
      },
    });

    setYdoc(nextYdoc);
    setProvider(nextProvider);

    return () => {
      nextProvider.disconnect();
      setProvider(null);

      nextYdoc.destroy();
      setYdoc(null);

      editorStore.status = Status.CONNECTING;
    };
  }, [padId, user.token]);

  return (
    <>
      <View className="relative h-full flex-1 flex-row gap-2 overflow-hidden">
        <View
          className="border-outline-dimmest relative h-full w-full flex-1 overflow-y-auto border-y md:pt-16"
          style={{
            background:
              "color-mix(in srgb, var(--interactive-background) 60%, var(--surface-background))",
          }}
        >
          <Surface
            className="mx-auto h-fit w-full max-w-4xl flex-1 px-16 pt-16"
            elevated
          >
            <EditorContent editor={editor}></EditorContent>
            <View className="h-16"></View>
          </Surface>
        </View>
      </View>

      {/* <ReconnectDialog open={status === Status.DISCONNECTED} /> */}

      {args.children}
    </>
  );
};
