import { Editor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Surface, View } from "natmfat";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { omit } from "~/lib/utils";
import { usePadId } from "../../hooks/use-pad-id";
import { useUser } from "../../hooks/use-user";
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

// provider.on("synced", () => {
//   if (currentEditor.isEmpty) {
//     currentEditor.commands.setContent("hi");
//   }
// });

const EditorContext = createContext<{ editor: Editor | null }>({
  editor: null,
});

export const useCurrentEditor = () => {
  const { editor } = useContext(EditorContext);
  return editor;
};

export const EditorProvider = (args: { children: ReactNode }) => {
  const user = useUser();
  const padId = usePadId();
  // const [editor, setEditor] = useState<Editor | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("connecting");

  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);

  const editor = useEditor(
    {
      enableContentCheck: true,
      onContentError: ({ disableCollaboration }) => {
        setStatus("disconnected");
        disableCollaboration();
      },
      onCreate: ({ editor: currentEditor }) => {
        console.log(currentEditor.getText());
      },
      autofocus: true,
      extensions: [
        RichTextLink,
        TextStyleKit,
        StarterKit.configure({
          // https://tiptap.dev/docs/collaboration/getting-started/install
          undoRedo: false,
          link: false,
        }),
        ydoc && Collaboration.configure({ document: ydoc }),
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
    const nextYdoc = new Y.Doc();
    const nextProvider = new WebrtcProvider(padId, nextYdoc, {
      signaling: [
        `${import.meta.env.VITE_SIGNALING_SERVER}?token=${user.token}`,
      ],
    });

    nextProvider.on("status", (e) => {
      setStatus(e.connected ? "connected" : "disconnected");
    });

    setYdoc(nextYdoc);
    setProvider(nextProvider);

    return () => {
      nextProvider.disconnect();
      setProvider(null);

      nextYdoc.destroy();
      setYdoc(null);

      setStatus("disconnected");
    };
  }, [padId, user.token]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <View className="relative h-full flex-1 flex-row gap-2 overflow-hidden px-2">
        <View
          className="rounded-t-default relative h-full w-full flex-1 overflow-y-auto pt-8"
          style={{
            background:
              "color-mix(in srgb, var(--interactive-background) 60%, var(--surface-background))",
          }}
        >
          <Surface
            className="rounded-t-default border-outline-dimmest mx-auto h-fit w-full max-w-3xl flex-1 border-x border-t px-16 pt-16"
            elevated
          >
            {status}
            <EditorContent editor={editor}></EditorContent>
            <View className="h-16"></View>
          </Surface>
        </View>
      </View>
      {args.children}
    </EditorContext.Provider>
  );
};
