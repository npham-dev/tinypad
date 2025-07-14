import { standardResponse } from "~/lib/response";

export function loader() {
  return standardResponse({
    message: "ok",
    success: true,
    data: "hrmm",
  });
}
