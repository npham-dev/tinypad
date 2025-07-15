import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useMemo } from "react";
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

  const ydoc = useMemo(() => new Y.Doc(), [padId]);
  const provider = useMemo(
    () =>
      new WebrtcProvider(padId, ydoc, {
        // is this secure? probably not lmao
        signaling: [
          `${import.meta.env.VITE_SIGNALING_SERVER}?token=${user.token}`,
        ],
        password: "encrypt this I guess",
      }),
    [padId, user.token, ydoc],
  );

  const dispose = useCallback(() => {
    console.log("destroyed");
    provider.destroy();
    ydoc.destroy();
  }, [provider, ydoc]);

  useEffect(() => {
    return () => dispose();
  }, [provider, ydoc]);

  useEffect(() => {
    window.addEventListener("beforeunload", dispose);
    return () => {
      window.removeEventListener("beforeunload", dispose);
    };
  }, []);

  return (
    <EditorProvider
      extensions={[
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
      ]}
      immediatelyRender={false}
    ></EditorProvider>
  );
};
