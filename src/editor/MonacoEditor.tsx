import React from "react";
import Editor from "@monaco-editor/react";

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
  const detectLanguage = (path: string) => {
    if (path.endsWith(".tsx")) return "typescript";
    if (path.endsWith(".ts")) return "typescript";
    if (path.endsWith(".js")) return "javascript";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".md")) return "markdown";
    return "plaintext";
  };

  return (
    <Editor
      height="100%"
      language={detectLanguage(filePath)}
      value={code}
      onChange={(v) => onChange(v || "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
      }}
    />
  );
};

export default MonacoEditor;
