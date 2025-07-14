import { TextStyleKit } from "@tiptap/extension-text-style";
// import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { RichTextLink } from "./rich-text-link";

const extensions = [RichTextLink, TextStyleKit, StarterKit];

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
