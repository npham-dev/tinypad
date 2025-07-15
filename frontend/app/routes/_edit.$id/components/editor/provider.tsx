import { Editor } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TextStyleKit } from "@tiptap/extension-text-style";
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
import { stringToColor } from "~/lib/string-to-color";
import { usePadId } from "../../hooks/use-pad-id";
import { useUser } from "../../hooks/use-user";
import { RichTextLink } from "./rich-text-link";

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
  const [editor, setEditor] = useState<Editor | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(padId, ydoc, {
      signaling: [
        `${import.meta.env.VITE_SIGNALING_SERVER}?token=${user.token}`,
      ],
    });

    // provider.on("synced", (isSynced) => {
    //   console.log("Synced with peers:", isSynced);
    // });
    // provider.awareness.on("update", () => {
    //   console.log(
    //     "Awareness changed:",
    //     Array.from(provider.awareness.getStates()),
    //   );
    // });

    const nextEditor = new Editor({
      enableContentCheck: true,
      onContentError: ({ disableCollaboration }) => {
        setStatus("disconnected");
        disableCollaboration();
      },
      onCreate: ({ editor: currentEditor }) => {
        provider.on("synced", () => {
          console.log(currentEditor.getText());
          if (currentEditor.isEmpty) {
            currentEditor.commands.setContent("hi");
          }
        });
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
        Collaboration.extend().configure({
          document: ydoc,
        }),
        CollaborationCaret.extend().configure({
          provider,
          user: {
            name: user.name,
            color: stringToColor(user.name),
          },
        }),
      ],
    });

    nextEditor.mount(editorRef.current);

    provider.on("status", (e) => {
      setStatus(e.connected ? "connected" : "disconnected");
    });

    setEditor(nextEditor);

    return () => {
      if (nextEditor) {
        nextEditor.unmount();
        nextEditor.destroy();
        setEditor(null);
      }
      provider.destroy();
      ydoc.destroy();
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
            <View ref={editorRef}></View>
            <View className="h-16"></View>
          </Surface>
        </View>
      </View>
      {args.children}
    </EditorContext.Provider>
  );
};
