import {
  Button,
  RiArticleIcon,
  RiBookletIcon,
  RiUserAddIcon,
  Text,
  View,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import { ClientOnly } from "remix-utils/client-only";
import type { Route } from "./+types";
import { Clui } from "./components/clui";
import { Editor } from "./components/editor";
import { RenamePopover } from "./components/rename-popover";

import { parseWithZod } from "@conform-to/zod";
import bcrypt from "bcrypt";
import { db } from "database";
import { pads } from "database/schema";
import { eq } from "drizzle-orm";
import { notFound, serverError, standardResponse } from "~/lib/response";
import { tryCatch } from "~/lib/try-catch";
import { renameSchema } from "./action-schema";

export async function loader({ params }: Route.LoaderArgs) {
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
  return {
    ...result.data[0],
    password: !!result.data[0].password,
  };
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
        throw serverError();
      }

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
        throw serverError();
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
    <View className="h-screen">
      <View asChild>
        <header className="shrink-0 flex-row items-center justify-between p-2 select-none">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-2">
              <RiBookletIcon color={tokens.primaryDefault} />
              <View className="flex-row items-center">
                <Text>tinypad</Text>
                <Text color="dimmest" className="pr-1.5 pl-3">
                  /
                </Text>
                <RenamePopover {...loaderData} />
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Clui />
            <Button>
              <RiUserAddIcon />
              Invite
            </Button>
            <Button>
              <RiArticleIcon />
              Publish
            </Button>
          </View>
        </header>
      </View>

      <View className="h-full flex-1 flex-row gap-2 overflow-hidden px-2 pb-2">
        <View
          className="rounded-default h-full w-full flex-1 overflow-y-auto px-4 py-3"
          style={{
            background:
              "color-mix(in srgb, var(--interactive-background) 60%, var(--surface-background))",
          }}
        >
          <ClientOnly>{() => <Editor />}</ClientOnly>
        </View>
      </View>
    </View>
  );
}
