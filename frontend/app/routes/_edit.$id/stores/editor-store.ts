import type { Editor } from "@tiptap/react";
import { proxy, ref } from "valtio";

export type ValtioRef<T extends object> = ReturnType<typeof ref<T>>;

export enum Status {
  CONNECTED = "connected",
  CONNECTING = "connecting",
  DISCONNECTED = "disconnected",
}

export type EditorStore = {
  editor: ValtioRef<Editor> | null;
  status: Status;
};

export const editorStore = proxy<EditorStore>({
  editor: null,
  status: Status.CONNECTING,
});

// // save editor via context
// // we do want the editor object itself to be tracked, bu
// const EditorContext = createContext<Editor | null>(null);
// export const EditorContextProvider = EditorContext.Provider;
// export const useCurrentEditor = () => {
//   return useContext(EditorContext);
// };
