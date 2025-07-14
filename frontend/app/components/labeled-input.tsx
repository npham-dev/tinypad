import {
  IconButton,
  Input,
  MultilineInput,
  RiEyeCloseIcon,
  RiEyeIcon,
  Text,
  View,
  VisuallyHidden,
  type InputProps,
} from "natmfat";
import { cn } from "natmfat/lib/cn";
import React, {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimateHeight } from "./animate-height";

export type LabeledProps = {
  /**
   * Input label to appear before the input
   */
  label: string;

  /**
   * Input form name
   */
  name: string;

  /**
   * Error message if form input is invalid
   */
  errors?: string[];

  errorId: string;

  inlineError?: boolean;

  labelAddon?: string;
};

export type LabeledInputProps = InputProps & LabeledProps;

const inputProps = ({
  required,
  errors,
  errorId,
  className,
  ...props
}: LabeledInputProps): InputProps => {
  return {
    ...omit(props, ["inlineError", "label"]),
    className: cn(className, errors && "border-red-default"),
    "aria-required": required,
    required: undefined,
    ...(errors
      ? {
          "aria-invalid": "true",
          "aria-describedby": errorId,
        }
      : {}),
    id: props.name,
  };
};

const getFirstError = (error?: string[]) => (error ? error[0] : undefined);

// @todo combine labeled input should use labeled
export const Labeled = ({
  children,
  inlineError,
  hiddenInputValue,
  hiddenInput = false,
  labelAddon,
  asChild,
  ...props
}: LabeledProps & {
  children?: ReactNode;
  hiddenInputValue?: InputHTMLAttributes<unknown>["value"];
  hiddenInput?: boolean;
  asChild?: boolean;
}) => {
  const error = getFirstError(props.errors);

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text color="dimmer" size="small" asChild>
          <label htmlFor={props.name}>
            {props.label} <span>{labelAddon ? `(${labelAddon})` : null}</span>
          </label>
        </Text>
        <View
          className={cn(
            "duration-snappy ease-snappy opacity-0 transition-opacity",
            error && "opacity-100",
          )}
        >
          {inlineError ? (
            <Text
              className="text-red-default max-w-full shrink"
              id={props.errorId}
            >
              {error}
            </Text>
          ) : null}
        </View>
      </View>

      {asChild ? (
        <View asChild {...inputProps(props)}>
          {children}
        </View>
      ) : (
        children
      )}
      {/* https://conform.guide/integration/ui-libraries */}
      {/* @todo useControl here */}
      {hiddenInput ? (
        <VisuallyHidden.Root>
          <input
            type="hidden"
            hidden
            value={hiddenInputValue}
            {...inputProps(props)}
          />
        </VisuallyHidden.Root>
      ) : null}

      {!inlineError ? (
        <AnimateHeight expand={!!props.errors} childrenHash={error}>
          <Text className="text-red-default" id={props.errorId} multiline>
            {error}
          </Text>
        </AnimateHeight>
      ) : null}
    </View>
  );
};

export const LabeledMultilineInput = (
  props: Omit<LabeledInputProps, "type">,
) => {
  return (
    <Labeled {...props} asChild>
      <MultilineInput />
    </Labeled>
  );
};

export const LabeledInput = (props: LabeledInputProps) => {
  return (
    <Labeled {...props}>
      {props.type === "password" ? (
        <PasswordInput {...props} />
      ) : (
        <TextInput {...props} />
      )}
    </Labeled>
  );
};

const TextInput: React.FC<LabeledInputProps> = (props) => {
  return <Input {...inputProps(props)} />;
};

const PasswordInput: React.FC<LabeledInputProps> = ({
  className,
  ...props
}) => {
  const [show, setShow] = useState(false);

  return (
    <View className="relative">
      <Input
        {...inputProps({ ...props, className: cn(className, "pr-8") })}
        type={show ? "text" : "password"}
        placeholder="••••••••"
      />
      <IconButton
        alt="Show Password"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        onClick={() => setShow((prevShow) => !prevShow)}
        type="button"
      >
        {show ? <RiEyeIcon /> : <RiEyeCloseIcon />}
      </IconButton>
    </View>
  );
};

function omit<T, K extends keyof T>(record: T, keys: K[]): Omit<T, K> {
  const shallow: T = { ...record };
  for (const key of keys) {
    delete shallow[key];
  }
  return shallow as Omit<T, K>;
}

/**
 * Get the default length from the provided value or defaultValue so it can be displayed to the user
 * Apparently value doesn't have to be a string?
 * @param args
 * @returns
 */
function getLength({
  value,
  defaultValue,
}: Pick<LabeledInputProps, "defaultValue" | "value">) {
  if (typeof value === "string") {
    return value.length;
  } else if (typeof defaultValue === "string") {
    return defaultValue.length;
  }
  return 0;
}
