import { tryCatch } from "common/lib/try-catch";
import { toast } from "natmfat";
import type z from "zod";
import type { StandardResponse } from "~/lib/response";
import type { updatePadSchema } from "~/routes/api.pad.$id/action-schema";

export async function publishPad() {}

export async function updatePad(args: {
  formData: z.infer<typeof updatePadSchema>;
  padId: string;
}) {
  const responseResult = await tryCatch(
    fetch(`/api/pad/${args.padId}`, {
      method: "POST",
      body: JSON.stringify(args.formData),
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );
  if (responseResult.error !== null || responseResult.data.status !== 200) {
    toast({
      type: "error",
      description: "Failed to update pad",
    });
    return;
  }
}

const toastFailed = () =>
  toast({
    type: "error",
    description: "Failed to upload image",
  });

export async function uploadImage(args: { file: File }) {
  const generateResult = await tryCatch<Response>(
    fetch("/api/generateSignedPolicy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType: args.file.type }),
    }),
  );
  if (generateResult.error !== null || generateResult.data.status !== 200) {
    toastFailed();
    return;
  }

  const jsonResult = await tryCatch<
    StandardResponse<{
      fields: Record<string, unknown>;
      url: string;
      image: string;
    }>
  >(generateResult.data.json());
  if (jsonResult.error !== null) {
    toastFailed();
    return;
  }

  const { data } = jsonResult.data;
  if (!data) {
    toastFailed();
    return;
  }

  const formData = new FormData();
  for (const [fieldName, fieldValue] of Object.entries(data.fields)) {
    formData.append(fieldName, String(fieldValue));
  }
  formData.append("file", args.file);
  const uploadResult = await tryCatch(
    fetch(data.url, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    }),
  );
  if (uploadResult.error !== null) {
    toastFailed();
  }
  return data.image;
}
