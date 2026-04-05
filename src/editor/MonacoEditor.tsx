import React, { useRef } from "react";
import Editor, { BeforeMount, OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

interface MonacoEditorProps {
  filePath: string;
  code: string;
  onChange: (value: string) => void;
  fontFamily?: string;
  fontSize?: number;
  editorTheme?: string;
  autocomplete?: boolean;
  readOnly?: boolean;
}

const THEME_MAP: Record<string, string> = {
  "VS Code Dark": "vs-dark",
  "Monokai": "orion-monokai",
  "Dracula": "orion-dracula",
};

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  code,
  onChange,
  fontFamily = "Fira Code",
  fontSize = 14,
  editorTheme = "VS Code Dark",
  autocomplete = true,
  readOnly = false,
}) => {
  const detectLanguage = (path: string) => {
    if (path.endsWith(".tsx") || path.endsWith(".jsx")) return "typescript";
    if (path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".js")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".css") || path.endsWith(".scss")) return "css";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".md")) return "markdown";
    if (path.endsWith(".svg")) return "html";
    return "plaintext";
  };

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("orion-monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "75715e", fontStyle: "italic" },
        { token: "keyword", foreground: "f92672" },
        { token: "string", foreground: "e6db74" },
        { token: "number", foreground: "ae81ff" },
        { token: "type", foreground: "66d9ef" },
        { token: "function", foreground: "a6e22e" },
      ],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#f8f8f2",
        "editorLineNumber.foreground": "#75715e",
        "editor.selectionBackground": "#49483e",
        "editor.lineHighlightBackground": "#3e3d32",
      },
    });

    monaco.editor.defineTheme("orion-dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd" },
        { token: "function", foreground: "50fa7b" },
      ],
      colors: {
        "editor.background": "#282a36",
        "editor.foreground": "#f8f8f2",
        "editorLineNumber.foreground": "#6272a4",
        "editor.selectionBackground": "#44475a",
        "editor.lineHighlightBackground": "#44475a",
      },
    });
  };

  const handleMount: OnMount = (_editor, monaco) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
    });
  };

  const resolvedTheme = THEME_MAP[editorTheme] ?? "vs-dark";

  return (
    <Editor
      height="100%"
      language={detectLanguage(filePath)}
      value={code}
      path={filePath}
      onChange={(v) => onChange(v || "")}
      theme={resolvedTheme}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize,
        fontFamily,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        renderValidationDecorations: "off",
        readOnly,
        quickSuggestions: autocomplete && !readOnly,
        suggestOnTriggerCharacters: autocomplete && !readOnly,
        wordBasedSuggestions: autocomplete && !readOnly ? "currentDocument" : "off",
      }}
    />
  );
};

export default MonacoEditor;
