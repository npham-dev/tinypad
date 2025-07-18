import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ButtonGroup,
  ButtonGroupItem,
  Interactive,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RiGlobalIcon,
  RiLockIcon,
  Text,
  View,
  type ButtonGroupProps,
} from "natmfat";
import { tokens } from "natmfat/lib/tokens";
import { useEffect, useRef, useState } from "react";
import { Form, useLoaderData } from "react-router";
import {
  LabeledInput,
  LabeledMultilineInput,
} from "~/components/labeled-input";
import { useDirty } from "../../hooks/use-dirty";
import { renamePadSchema } from "../../server/action-schema";
import type { loader } from "../../server/loader.server";

export function RenamePopover() {
  const { pad } = useLoaderData<typeof loader>();

  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const { dirty, listeners } = useDirty({ resetKey: open });
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: renamePadSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // required for some weird ass bug?
  // not sure if this is radix ui's fault but
  // 1. auto focusing on the input
  // 2. clicking outside to close the popover
  // triggers a form submit, regardless of the js on that form (like e.preventDefault())
  useEffect(() => {
    formRef.current?.focus();
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open && dirty.current) {
          formRef.current?.requestSubmit();
        }
      }}
    >
      <PopoverTrigger type="button">
        <Interactive variant="fill">
          <View className="h-8 flex-row items-center gap-1 px-2">
            <Text>{pad.name}</Text>
            {pad.public ? null : <RiLockIcon size={tokens.space12} />}
          </View>
        </Interactive>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Form
          tabIndex={0}
          ref={formRef}
          method="post"
          id={form.id}
          onSubmit={form.onSubmit}
          className="flex w-80 flex-col gap-3"
        >
          <input type="hidden" name="intent" value="rename_popover" />
          <LabeledInput
            label="Name"
            placeholder="Name your pad"
            name={fields.title.name}
            errors={fields.title.errors}
            errorId={fields.title.errorId}
            autoComplete="off"
            required
            defaultValue={pad.name}
            {...listeners}
          />
          <LabeledMultilineInput
            label="Description"
            name={fields.description.name}
            errors={fields.description.errors}
            errorId={fields.description.errorId}
            maxLength={140}
            defaultValue={pad.description}
            className="min-h-18 resize-none"
            {...listeners}
          />
          <View className="gap-1">
            <LabeledInput
              label="Password"
              name={fields.password.name}
              errors={fields.password.errors}
              errorId={fields.password.errorId}
              autoComplete="off"
              type="password"
              {...listeners}
            />
            {pad.password ? (
              <Text color="dimmer" size="small" multiline>
                You have a password set, but it cannot be displayed again for
                security reasons.
              </Text>
            ) : null}
          </View>
          <PrivacySettings defaultValue={pad.public} {...listeners} />
        </Form>
      </PopoverContent>
    </Popover>
  );
}

function PrivacySettings({
  defaultValue,
  ...props
}: { defaultValue: boolean } & Omit<ButtonGroupProps, "defaultValue">) {
  const [privacy, setPrivacy] = useState(defaultValue ? "public" : "private");
  return (
    <View className="gap-1">
      <ButtonGroup
        value={privacy}
        {...props}
        onChange={(value) => {
          props.onChange?.(value);
          setPrivacy(value);
        }}
      >
        <ButtonGroupItem value="public">
          <RiGlobalIcon />
          Public
        </ButtonGroupItem>
        <ButtonGroupItem value="private">
          <RiLockIcon />
          Private
        </ButtonGroupItem>
      </ButtonGroup>
      {privacy === "public" ? (
        <Text color="dimmer" size="small">
          Anyone can view and edit this pad.
        </Text>
      ) : (
        <Text color="dimmer" size="small">
          Only you can view and edit this pad with a password.
        </Text>
      )}
      <input type="hidden" value={privacy} name="privacy" />
    </View>
  );
}
