// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.APP_URL,
  prefetch: true,

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],

  adapter: cloudflare({ imageService: "compile" }),
});
