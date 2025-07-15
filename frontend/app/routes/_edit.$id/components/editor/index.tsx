import { EditorContent, useCurrentEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { useUser } from "../../hooks/use-user";

type EditorProps = {};

export const Editor = ({}: EditorProps) => {
  const user = useUser();
  const { editor } = useCurrentEditor();

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

  return <EditorContent editor={null} className="h-full" />;
};
