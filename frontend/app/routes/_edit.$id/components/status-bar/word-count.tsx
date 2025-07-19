import type { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { editorStore } from "../../stores/editor-store";
import { StatusAction } from "./status";

export function WordCount() {
  const { editor } = useSnapshot(editorStore);
  const [words, setWords] = useState(0);

  useEffect(() => {
    const onUpdate = ({ editor }: { editor: Editor }) => {
      setWords(editor.storage.characterCount.words());
    };
    editor?.on("update", onUpdate);
    return () => {
      editor?.off("update", onUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return <StatusAction>{words} words</StatusAction>;
}
