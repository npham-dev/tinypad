import { Surface, View } from "natmfat";
import { ClientOnly } from "remix-utils/client-only";
import type { Route } from "./+types";

import { Editor } from "./components/editor";
import { Header } from "./components/header";
import { StatusBar } from "./components/status-bar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tinypad" },
    {
      name: "description",
      content: "Yet another smol multiplayer text editor.",
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon-96x96.png",
    sizes: "96x96",
  },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg",
  },
  {
    rel: "shortcut icon",
    href: "/favicon.ico",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
  },
];

export { action } from "./server/action.server";
export { loader } from "./server/loader.server";

// @todo password stuff

export default function Page() {
  return (
    <View className="h-screen">
      <Header />
      <View className="relative h-full flex-1 flex-row gap-2 overflow-hidden">
        <View
          className="border-outline-dimmest relative h-full w-full flex-1 overflow-y-auto border-y md:pt-16"
          style={{
            background:
              "color-mix(in srgb, var(--interactive-background) 60%, var(--surface-background))",
          }}
        >
          <Surface
            className="mx-auto h-fit w-full max-w-4xl flex-1 px-16 pt-16"
            elevated
          >
            <ClientOnly>{() => <Editor />}</ClientOnly>
            <View className="h-16"></View>
          </Surface>
        </View>
      </View>

      <StatusBar />
    </View>
  );
}
