import {
  adjectives,
  animals,
  colors,
  names,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const randomPadName = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "",
    style: "capital",
  });

export const randomName = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, names, names],
    separator: "",
    style: "capital",
  });
