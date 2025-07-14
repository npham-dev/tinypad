import { TextStyleKit } from "@tiptap/extension-text-style";
// import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const extensions = [TextStyleKit, StarterKit];

type EditorProps = {
  content: string;
};

export const Editor = ({ content }: EditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
  });

  return <EditorContent editor={editor} className="h-full" />;
};
