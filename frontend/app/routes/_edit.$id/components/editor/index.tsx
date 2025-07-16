import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useState } from "react";
import { ref } from "valtio";
import * as Y from "yjs";
import { omit } from "~/lib/utils";
import { usePadId } from "../../hooks/use-pad-id";
import { publicUser, useUser, type PublicUser } from "../../hooks/use-user";
import { editorStore, Status } from "../../stores/editor-store";
import { notificationStore, notify } from "../../stores/notification-store";
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

export const Editor = () => {
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
        const frequency: Record<string, number> = {};
        const awareness: PublicUser[] = [];
        for (const state of data.states) {
          const publicUser = state.user as PublicUser;
          // don't allow duplicate names or ourself
          frequency[publicUser.name] = (frequency[publicUser.name] || 0) + 1;
          if (
            frequency[publicUser.name] === 1 &&
            publicUser.name !== user.name
          ) {
            // new user, notify!
            if (!notificationStore.joinHistory.has(publicUser.name)) {
              notify(`${publicUser.name} joined`);
            }

            awareness.push(publicUser);
            notificationStore.joinHistory.add(publicUser.name);
          }
        }

        // only if we have multiple tabs open do we add ourself back in
        if (frequency[user.name] > 1) {
          awareness.push(publicUser(user));
        }

        // @todo if not self, add notification
        editorStore.awareness = awareness;
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

  return <EditorContent editor={editor}></EditorContent>;
};
