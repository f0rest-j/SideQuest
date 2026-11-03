import type { NextConfig } from "next";

/**
 * Static hosting (e.g. GitHub Pages): set STATIC_EXPORT=1 to emit a static
 * site into `out/`, and PAGES_BASE_PATH (e.g. "/SideQuest") when the site is
 * served from a sub-path. Without them, the app builds for `next start`.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH || undefined;

// The app is fully client-side (local storage, no server data), so Cache
// Components / partial prerendering are not used; they are also incompatible
// with static export.
const nextConfig: NextConfig = {
  ...(staticExport && { output: "export", trailingSlash: true }),
  ...(basePath && { basePath }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
