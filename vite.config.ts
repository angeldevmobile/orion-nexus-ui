import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import * as monacoEditorPluginModule from "vite-plugin-monaco-editor";

type MonacoPluginFunction = (options: unknown) => Plugin;

function isFunction(value: unknown): value is MonacoPluginFunction {
  return typeof value === "function";
}

const importedModule: unknown = monacoEditorPluginModule;
const maybeDefault: unknown =
  (importedModule as { default?: unknown }).default ?? undefined;

let resolvedMonacoPlugin: MonacoPluginFunction | undefined;

if (isFunction(maybeDefault)) {
  resolvedMonacoPlugin = maybeDefault;
} else if (isFunction(importedModule)) {
  resolvedMonacoPlugin = importedModule as MonacoPluginFunction;
} else if (
  typeof maybeDefault === "object" &&
  maybeDefault !== null &&
  isFunction((maybeDefault as { default?: unknown }).default)
) {
  resolvedMonacoPlugin = (maybeDefault as { default: unknown }).default as MonacoPluginFunction;
} else {
  resolvedMonacoPlugin = undefined;
}

if (!resolvedMonacoPlugin) {
  throw new Error(
    "vite-plugin-monaco-editor: no se encontró una función exportada. Revisa la instalación/versión del paquete."
  );
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // unsafe-none allows third-party iframes like Stripe to load without CORP conflicts.
      // same-origin-allow-popups keeps tab isolation but allows Stripe 3D Secure popups.
      // Note: SharedArrayBuffer is unavailable without require-corp/credentialless + same-origin.
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    fs: {
      allow: ['..']
    }
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),

    resolvedMonacoPlugin({
      languageWorkers: ["css", "html", "json", "typescript"],
    }),
  ].filter(Boolean) as Plugin[],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ OPTIMIZACIONES PARA WEBCONTAINER
  optimizeDeps: {
    exclude: ['@webcontainer/api']
  },

  // ✅ DEFINIR GLOBAL PARA COMPATIBILIDAD
  define: {
    global: 'globalThis',
  }
}));