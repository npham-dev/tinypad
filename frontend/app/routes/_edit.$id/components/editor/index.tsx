import { TextStyleKit } from "@tiptap/extension-text-style";
// import type { Editor } from '@tiptap/react'
// import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef } from "react";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { usePadId } from "../../hooks/use-pad-id";
import { RichTextLink } from "./rich-text-link";

// const provider = new WebrtcProvider("example-document", ydoc, {
//   password: "test",
// });

type EditorProps = {};

export const Editor = ({}: EditorProps) => {
  const ydoc = useRef(new Y.Doc());
  const padId = usePadId();
  const provider = useRef(
    new WebrtcProvider(padId, ydoc.current, {
      signaling: [import.meta.env.VITE_SIGNALING_SERVER!],
    }),
  );

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
      // Collaboration.configure({
      //   document: ydoc,
      // }),
    ],
    content: "",
  });

  return <EditorContent editor={editor} className="h-full" />;
};
