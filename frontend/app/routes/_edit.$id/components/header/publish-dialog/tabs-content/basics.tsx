import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useSnapshot } from "valtio";
import {
  LabeledInput,
  LabeledMultilineInput,
} from "~/components/labeled-input";
import { useDirty } from "~/routes/_edit.$id/hooks/use-dirty";
import { renamePadSchema } from "~/routes/_edit.$id/server/action-schema";
import { DEFAULT_PROJECT_DESCRIPTION, DEFAULT_PROJECT_NAME } from "../preview";
import { TabsContent, tabsStore, useTabsEmitterSubmit } from "../tabs";

// only for client side validation
// updatePad method only has optional fields to be as reuseable as possible
const schema = renamePadSchema.pick({
  title: true,
  description: true,
});

export function BasicsTabContent() {
  const snap = useSnapshot(tabsStore);
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

  const { dirty, listeners } = useDirty();

  useTabsEmitterSubmit({
    form,
    tab: "basics",
    onSubmit: () =>
      dirty.current
        ? {
            title: snap.name,
            description: snap.description,
          }
        : null,
  });

  return (
    <TabsContent value="basics" asChild>
      <form onSubmit={form.onSubmit} id={form.id}>
        <LabeledInput
          {...listeners}
          label="Name"
          name={fields.title.name}
          errors={fields.title.errors}
          errorId={fields.title.errorId}
          maxLength={256}
          placeholder={DEFAULT_PROJECT_NAME}
          value={snap.name}
          onChange={(e) => {
            tabsStore.name = e.target.value;
            listeners.onChange();
          }}
        />
        <LabeledMultilineInput
          {...listeners}
          label="Description"
          name={fields.description.name}
          errors={fields.description.errors}
          errorId={fields.description.errorId}
          value={snap.description}
          placeholder={DEFAULT_PROJECT_DESCRIPTION}
          maxLength={500}
          className="min-h-18 resize-none"
          onChange={(e) => {
            tabsStore.description = e.target.value;
            listeners.onChange();
          }}
        />
      </form>
    </TabsContent>
  );
}
