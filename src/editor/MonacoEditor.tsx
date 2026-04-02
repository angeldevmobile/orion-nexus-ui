import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

interface MonacoEditorProps {
  filePath: string;
  code: string;
  onChange: (value: string) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  code,
  onChange,
}) => {
  const monacoRef = useRef<typeof Monaco | null>(null);

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

  const handleMount: OnMount = (_editor, monaco) => {
    monacoRef.current = monaco;

    // Disable all TypeScript/JavaScript diagnostics — the virtual FS has no
    // node_modules so every import would show a red underline otherwise.
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    // Enable JSX in TypeScript worker
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
    });
  };

  return (
    <Editor
      height="100%"
      language={detectLanguage(filePath)}
      value={code}
      onChange={(v) => onChange(v || "")}
      theme="vs-dark"
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        renderValidationDecorations: "off",
      }}
    />
  );
};

export default MonacoEditor;
