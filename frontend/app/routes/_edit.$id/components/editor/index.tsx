import { TextStyleKit } from "@tiptap/extension-text-style";
// import type { Editor } from '@tiptap/react'
// import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import { WebrtcProvider } from "y-webrtc";
// import * as Y from "yjs";
import { RichTextLink } from "./rich-text-link";

// const ydoc = new Y.Doc();
// const provider = new WebrtcProvider("example-document", ydoc, {
//   password: "test",
// });

type EditorProps = {};

export const Editor = ({}: EditorProps) => {
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
