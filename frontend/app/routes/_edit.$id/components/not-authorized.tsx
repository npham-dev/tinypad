import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Button, Heading, Text, toast, View } from "natmfat";
import { useEffect } from "react";
import { Form, useActionData } from "react-router";
import { LabeledInput } from "~/components/labeled-input";
import { loginSchema } from "../server/action-schema";
import type { action } from "../server/action.server";

export function NotAuthorized() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (form.errors) {
      toast({
        type: "error",
        description: form.errors[0],
      });
    }
  }, [form.errors]);

  return (
    <View>
      <View className="mx-auto w-full max-w-2xl gap-4 pt-20">
        <View className="gap-0.5">
          <Heading level={1}>You need access</Heading>
          <Text>You're trying to access a password protected pad.</Text>
        </View>
        <View asChild>
          <Form
            className="w-72 max-w-full gap-2"
            id={form.id}
            onSubmit={form.onSubmit}
            method="POST"
            aria-describedby={form.errorId}
          >
            <input type="hidden" name="intent" value="login" />
            <LabeledInput
              type="password"
              label="Password"
              name={fields.password.name}
              errors={fields.password.errors}
              errorId={fields.password.errorId}
              autoComplete="off"
              required
            />
            <Button color="primary" type="submit" className="w-fit">
              Request access
            </Button>
          </Form>
        </View>
      </View>
    </View>
  );
}
