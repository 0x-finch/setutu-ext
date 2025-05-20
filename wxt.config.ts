import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  outDir: "dist",
  webExt: {
    chromiumProfile:
      "/Users/yumin/Library/Application Support/Google/Chrome/Profile 1",
  },
});
