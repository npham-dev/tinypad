import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { useSnapshot } from "valtio";
import {
  LabeledInput,
  LabeledMultilineInput,
} from "~/components/labeled-input";
import type { loader } from "~/routes/_edit.$id";
import { useEmitter } from "~/routes/_edit.$id/hooks/use-emitter";
import { usePadId } from "~/routes/_edit.$id/hooks/use-pad-id";
import { renamePadSchema } from "~/routes/_edit.$id/server/action-schema";
import { DEFAULT_PROJECT_DESCRIPTION, DEFAULT_PROJECT_NAME } from "../preview";
import { TabsContent, tabsEmitter, tabsStore } from "../tabs";
import { updatePad } from "../utils";

const schema = renamePadSchema.pick({
  title: true,
  description: true,
});

export function BasicsTabContent() {
  const snap = useSnapshot(tabsStore);

  // ensure tabs store is synced w/ loader data
  const { pad } = useLoaderData<typeof loader>();
  useEffect(() => {
    tabsStore.name = pad.name;
    tabsStore.description = pad.description;
  }, [pad.name, pad.description]);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onSubmit(e) {
      e.preventDefault();
    },
  });

  const revalidator = useRevalidator();
  const action = `/${usePadId()}`;

  useEmitter(tabsEmitter, "submit", async ({ tab }) => {
    if (tab !== "basics" || Object.keys(form.allErrors).length > 0) {
      return;
    }

    await updatePad({
      formData: {
        title: snap.name,
        description: snap.description,
      },
      action,
    });
    revalidator.revalidate();
  });

  return (
    <TabsContent value="basics" asChild>
      <form onSubmit={form.onSubmit} id={form.id}>
        <LabeledInput
          label="Name"
          name={fields.title.name}
          errors={fields.title.errors}
          errorId={fields.title.errorId}
          maxLength={256}
          placeholder={DEFAULT_PROJECT_NAME}
          value={snap.name}
          onChange={(e) => (tabsStore.name = e.target.value)}
        />
        <LabeledMultilineInput
          label="Description"
          name={fields.description.name}
          errors={fields.description.errors}
          errorId={fields.description.errorId}
          value={snap.description}
          onChange={(e) => (tabsStore.description = e.target.value)}
          placeholder={DEFAULT_PROJECT_DESCRIPTION}
          maxLength={500}
          className="min-h-18 resize-none"
        />
      </form>
    </TabsContent>
  );
}
