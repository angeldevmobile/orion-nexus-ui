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
      // credentialless keeps crossOriginIsolated=true (SharedArrayBuffer/Monaco works)
      // but allows CDN scripts in iframes without requiring CORP headers from each CDN.
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
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