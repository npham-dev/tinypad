import { Surface, View } from "natmfat";
import { ClientOnly } from "remix-utils/client-only";
import type { Route } from "./+types";

import { parseWithZod } from "@conform-to/zod";
import bcrypt from "bcrypt";
import { db } from "database";
import { pads } from "database/schema";
import { eq } from "drizzle-orm";
import {
  internalServerError,
  notAuthorized,
  notFound,
  standardResponse,
} from "~/lib/response";
import { tryCatch } from "~/lib/try-catch";
import { createAccessControl } from "~/services/access-control.server";
import { renameSchema } from "./action-schema";
import { Editor } from "./components/editor";
import { Header } from "./components/header";
import { StatusBar } from "./components/status-bar";
import { UserContextProvider } from "./hooks/use-user";

export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await tryCatch(
    db
      .select({
        name: pads.name,
        description: pads.description,
        password: pads.password,
        public: pads.public,
      })
      .from(pads)
      .where(eq(pads.id, params.id)),
  );
  if (result.error !== null || result.data.length === 0) {
    throw notFound();
  }

  const pad = result.data[0];
  const ac = await createAccessControl(request);
  if (await ac.canManagePad(params.id, pad.public)) {
    // @todo if pad is public, add jwt for it
    // this IS necessary because a user changing a pad to private will kick everyone else
    // unless they have a jwt (unless we should allow that??)

    return {
      name: ac.getName(),
      token: ac.getToken(),
      pad: {
        ...pad,
        password: !!pad.password,
      },
    };
  }

  // @todo redirect to different page requesting password
  throw notAuthorized();
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "rename": {
      const submission = parseWithZod(formData, { schema: renameSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }

      const passwordResult = await tryCatch(
        submission.value.password
          ? bcrypt.hash(submission.value.password, 10)
          : Promise.resolve(undefined),
      );
      if (passwordResult.error !== null) {
        // @todo more descriptive errors than just 500 (use standard response + enums)
        throw internalServerError();
      }

      // @todo check auth
      const updateResult = await tryCatch(
        db
          .update(pads)
          .set({
            name: submission.value.title,
            description: submission.value.description || "",
            password: passwordResult.data,
            public: submission.value.privacy === "public",
          })
          .where(eq(pads.id, submission.value.id)),
      );
      if (updateResult.error !== null) {
        throw internalServerError();
      }

      return standardResponse({
        success: true,
        message: "Updated pad",
      });
    }
  }

  throw notFound();
}

// @todo password stuff

export default function Page({ loaderData }: Route.ComponentProps) {
  return (
    <UserContextProvider name={loaderData.name} token={loaderData.token}>
      <View className="h-screen">
        <Header />
        <View className="relative h-full flex-1 flex-row gap-2 overflow-hidden">
          <View
            className="border-outline-dimmest relative h-full w-full flex-1 overflow-y-auto border-y md:pt-16"
            style={{
              background:
                "color-mix(in srgb, var(--interactive-background) 60%, var(--surface-background))",
            }}
          >
            <Surface
              className="mx-auto h-fit w-full max-w-4xl flex-1 px-16 pt-16"
              elevated
            >
              <ClientOnly>{() => <Editor />}</ClientOnly>
              <View className="h-16"></View>
            </Surface>
          </View>
        </View>

        <StatusBar />
      </View>
    </UserContextProvider>
  );
}
