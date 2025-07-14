import { generate } from "random-words";

export const randomName = () => {
  const words = generate({
    exactly: 3,
    minLength: 5,
    wordsPerString: 1,
    formatter: (word) => word.slice(0, 1).toUpperCase().concat(word.slice(1)),
  });
  return Array.isArray(words) ? words.join("") : words;
};
