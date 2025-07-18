import { tryCatch } from "common/lib/try-catch";
import { v4 as uuidv4 } from "uuid";
import { notFound, standardResponse, StatusCode } from "~/lib/response";
import { logger } from "~/services/logger.server";
import { bucket } from "../../services/storage.server";
import type { Route } from "../api.generateSignedPolicy/+types";
import { schema } from "./action-schema";

const log = logger.child({ module: "api.generate_signed_url" });

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "POST") {
    const responseResult = await tryCatch(request.json());
    if (responseResult.error !== null) {
      return standardResponse({
        message: "Request body contained malformed json",
        status: StatusCode.BAD_REQUEST,
      });
    }

    const parsedResult = await tryCatch(schema.parseAsync(responseResult.data));
    if (parsedResult.error !== null) {
      return standardResponse({
        message: "Request body must adhere to schema",
        status: StatusCode.BAD_REQUEST,
      });
    }

    // https://cloud.google.com/sstorage/docs/xml-api/post-object-forms
    const filename = uuidv4();
    const signedResult = await tryCatch(
      bucket.file(filename).generateSignedPostPolicyV4({
        expires: Date.now() + 10 * 60 * 1000, // expire in 10 minutes
        fields: {
          "content-type": parsedResult.data.contentType,
        },
        conditions: [
          ["content-length-range", 0, 5 * 1024 * 1024], // limit to 5MB
        ],
      }),
    );

    if (signedResult.error !== null) {
      log.error(
        signedResult.error,
        "Failed to create presigned post policy url",
      );
      return standardResponse({
        message: "Failed to create presigned post policy url",
        status: StatusCode.INTERNAL_SERVER_ERROR,
      });
    }

    const policy = signedResult.data[0];
    return standardResponse({
      message: "Created presigned post policy url",
      data: {
        image: `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET_NAME}/${filename}`,
        url: policy.url,
        fields: policy.fields,
      },
    });
  }
  throw notFound();
}
