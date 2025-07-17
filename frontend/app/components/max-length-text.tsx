import { Text } from "natmfat";
import { cn } from "natmfat/lib/cn";

/**
 * Get an appropriate color to tell the user how close they are to the maxLength threshold
 * @param length Current length of the text
 * @param maxLength Threshold for text length
 * @returns A class name that applies a color
 */
function getColor(length: number, maxLength: number) {
  if (length > maxLength) {
    return "text-negative-default";
  } else if (length > maxLength - maxLength / 20) {
    // warn at 20% of maxLength
    return "text-yellow-default";
  }
  return "";
}

type MaxLengthTextProps = {
  length: number;
  maxLength: number;
};

export const MaxLengthText = (props: MaxLengthTextProps) => {
  return (
    <Text
      color="dimmest"
      className={cn(getColor(props.length, props.maxLength))}
    >
      {props.length}/{props.maxLength}
    </Text>
  );
};
