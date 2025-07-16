import { StackedAvatars } from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import { useSnapshot } from "valtio";
import { editorStore } from "../../stores/editor-store";

export function Awareness() {
  const snap = useSnapshot(editorStore);

  return (
    <StackedAvatars
      size={tokens.space32}
      users={snap.awareness.map((user) => ({
        username: user.name,
        color: user.color,
      }))}
    />
  );
}
