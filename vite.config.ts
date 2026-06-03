// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Split heavy vendors into separate, long-term cacheable chunks so the
          // browser downloads them in parallel and reuses them across deploys.
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("react-dom") || id.includes("/scheduler/")) return "react-dom";
            if (id.includes("@tanstack")) return "tanstack";
            if (
              id.includes("@radix-ui") ||
              id.includes("@floating-ui") ||
              id.includes("react-remove-scroll") ||
              id.includes("aria-hidden")
            )
              return "radix";
          },
        },
      },
    },
  },
});
