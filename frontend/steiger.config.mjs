// .mjs, not .ts: Node loads steiger.config.ts as CommonJS (package.json has no "type": "module") and fails.
import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // _app and _pages are the FSD app and pages layers, prefixed to avoid clashing with Next.js folders.
    // Other rules recognise them, but typo-in-layer-name in plugin 0.8.2 reports them as typos
    // (fixed upstream, not released yet). Remove this override once a release with the fix is out.
    files: ["./src/_app/**", "./src/_pages/**"],
    rules: {
      "fsd/typo-in-layer-name": "off",
    },
  },
]);
