import { useRef } from "react";
import { randomName } from "~/lib/random-name";

export const useRandomName = () => {
  const name = useRef(getName());
  return name;
};

function getName(): string {
  let name = localStorage.getItem("tinypad.name");
  if (!name) {
    name = randomName();
    localStorage.setItem("tinypad.name", name);
  }
  return name;
}
