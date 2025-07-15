import invariant from "invariant";
import { useParams } from "react-router";

export function usePadId() {
  const params = useParams();
  invariant(params.id, "expected pad id");
  return params.id;
}
