import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ButtonGroup,
  ButtonGroupItem,
  Interactive,
  MultilineInput,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RiGlobalIcon,
  RiLockIcon,
  Text,
  View,
} from "natmfat";
import { useRef, useState } from "react";
import { Form, useParams } from "react-router";
import { Labeled, LabeledInput } from "~/components/labeled-input";
import { renameSchema } from "../action-schema";

type RenamePopoverProps = {
  name: string;
  password: string | null;
  public: boolean;
};

export function RenamePopover(props: RenamePopoverProps) {
  const params = useParams();

  const formRef = useRef<HTMLFormElement>(null);
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: renameSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          formRef.current?.requestSubmit();
        }
      }}
    >
      <PopoverTrigger>
        <Interactive variant="noFill">
          <View className="flex-row items-center gap-1 px-1.5">
            <Text className="font-medium">{props.name}</Text>
          </View>
        </Interactive>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Form
          ref={formRef}
          method="post"
          id={form.id}
          onSubmit={form.onSubmit}
          className="flex w-80 flex-col gap-3"
        >
          <input type="hidden" name="intent" value="rename" />
          <input type="hidden" name="id" value={params.id} />
          <LabeledInput
            label="Name"
            placeholder="Name your pad"
            name={fields.title.name}
            errors={fields.title.errors}
            errorId={fields.title.errorId}
            autoComplete="off"
            required
            defaultValue={props.name}
          />
          <Labeled
            label="Description"
            name={fields.description.name}
            errors={fields.description.errors}
            errorId={fields.description.errorId}
            asChild
          >
            <MultilineInput
              maxLength={140}
              defaultValue={fields.description.initialValue}
              className="min-h-18 resize-none"
            />
          </Labeled>
          <LabeledInput
            label="Password"
            name={fields.password.name}
            errors={fields.password.errors}
            errorId={fields.password.errorId}
            autoComplete="off"
            type="password"
            defaultValue={props.password || undefined}
          />
          <PrivacySettings defaultValue={props.public} />
        </Form>
      </PopoverContent>
    </Popover>
  );
}

function PrivacySettings(props: { defaultValue: boolean }) {
  const [privacy, setPrivacy] = useState(
    props.defaultValue ? "public" : "private",
  );

  return (
    <View className="gap-2">
      <ButtonGroup value={privacy} onChange={setPrivacy}>
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
