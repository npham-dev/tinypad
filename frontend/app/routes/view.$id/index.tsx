import { Anchor, Text, View } from "natmfat";
import { useLoaderData } from "react-router";
import sanitizeHtml from "sanitize-html";
import type { Route } from "./+types";
import type { loader } from "./server/loader.server";

export { loader } from "./server/loader.server";

// @todo actually use cover image/icon image for favicon
// maybe render title/description as well?

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) {
    return [
      { title: "tinypad" },
      {
        name: "description",
        content: "Yet another smol multiplayer text editor.",
      },
    ];
  }

  return [
    { title: data.name },
    {
      name: "description",
      content: data.description,
    },
    {
      name: "keywords",
      content: data.tags,
    },
  ];
};

export default function Page() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <View className="mx-auto max-w-2xl px-4 pt-20">
      <img
        src={loaderData.iconImage || "/favicon.svg"}
        className="h-18 w-18 aspect-square object-cover"
      />
      <View
        className="tiptap border-none pt-2 outline-none"
        dangerouslySetInnerHTML={{
          __html: loaderData.content
            ? sanitizeHtml(loaderData.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
              })
            : "",
        }}
      ></View>

      <footer className="border-t-outline-dimmest mt-6 flex h-20 items-center border-t">
        <Text color="dimmest">
          Published with{" "}
          <Anchor href="/" external>
            tinypad
          </Anchor>
          .
        </Text>
      </footer>
    </View>
  );
}
