import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef } from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { stringToColor } from "~/lib/string-to-color";
import { usePadId } from "../../hooks/use-pad-id";
import { useUser } from "../../hooks/use-user";
import { RichTextLink } from "./rich-text-link";

type EditorProps = {};

export const Editor = ({}: EditorProps) => {
  const user = useUser();
  const padId = usePadId();
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () =>
      new WebrtcProvider(padId, ydoc, {
        // is this secure? probably not lmao
        signaling: [
          `${import.meta.env.VITE_SIGNALING_SERVER}?token=${user.token}`,
        ],
        password: "encrypt this I guess",
      }),
    [padId, user.token],
  );

  useEffect(() => {
    const onBeforeUnload = () => {
      provider.destroy();
      ydoc.destroy();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [provider, ydoc]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      RichTextLink,
      TextStyleKit,
      StarterKit.configure({
        // https://tiptap.dev/docs/collaboration/getting-started/install
        undoRedo: false,
        link: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: user.name,
          color: stringToColor(user.name),
        },
      }),
    ],
  });

  // set cursor to idle after a 30s without typing
  const idleTimeout = useRef(0);
  useEffect(() => {
    const startIdleTimeout = () => {
      window.clearTimeout(idleTimeout.current);
      editor?.commands.updateUser({
        ...user,
        idle: false,
      });
      idleTimeout.current = window.setTimeout(() => {
        // https://tiptap.dev/docs/editor/extensions/functionality/collaboration-caret
        editor?.commands.updateUser({
          ...user,
          idle: true,
        });
      }, 30 * 1_000);
    };

    addEventListener("mousemove", startIdleTimeout);
    addEventListener("keydown", startIdleTimeout);

    return () => {
      window.clearTimeout(idleTimeout.current);
      removeEventListener("mousemove", startIdleTimeout);
      removeEventListener("keydown", startIdleTimeout);
    };
  }, []);

  return <EditorContent editor={editor} className="h-full" />;
};
