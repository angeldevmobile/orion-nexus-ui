import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface FileExplorerProps {
  tree: FileNode[];
  onOpenFile: (path: string) => void;
  onCreateFile?: (path: string) => void;
  onCreateFolder?: (path: string) => void;
  activeFile?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  tree,
  onOpenFile,
  onCreateFile,
  onCreateFolder,
  activeFile,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "/src": true, // Expandir /src por defecto
  });

  const toggle = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Ordenar: carpetas primero, luego archivos alfabéticamente
  const sortNodes = (nodes: FileNode[]): FileNode[] => {
    return [...nodes].sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const renderNode = (node: FileNode, level = 0) => {
    const isExpanded = expanded[node.path];
    const isActive = activeFile === node.path;

    if (node.type === "folder") {
      const sortedChildren = node.children ? sortNodes(node.children) : [];

      return (
        <div key={node.path}>
          <div
            onClick={() => toggle(node.path)}
            className={`
              flex items-center gap-1.5 px-2 py-1 cursor-pointer 
              hover:bg-gray-700/50 rounded transition-colors
              ${isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-300"}
            `}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {/* Icono de expansión */}
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            )}

            {/* Icono de carpeta */}
            <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />

            {/* Nombre */}
            <span className="text-sm truncate">{node.name}</span>
          </div>

          {/* Hijos (si está expandido) */}
          {isExpanded && sortedChildren.length > 0 && (
            <div>
              {sortedChildren.map((child) => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Renderizar archivo
    return (
      <div
        key={node.path}
        onClick={() => onOpenFile(node.path)}
        className={`
          flex items-center gap-1.5 px-2 py-1 cursor-pointer 
          hover:bg-gray-700/50 rounded transition-colors
          ${isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-300"}
        `}
        style={{ paddingLeft: `${level * 12 + 24}px` }}
      >
        <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm truncate">{node.name}</span>
      </div>
    );
  };

  const sortedTree = sortNodes(tree);

  useEffect(() => {
    function handleFilesCreated(event: CustomEvent) {
      const newFiles: string[] = event.detail.files;

      // Auto-expandir carpetas de los nuevos archivos
      newFiles.forEach(filePath => {
        const parts = filePath.split('/').filter(Boolean);
        let currentPath = '';
        
        parts.slice(0, -1).forEach(part => {
          currentPath += (currentPath ? '/' : '') + part;
          setExpanded(prev => ({ ...prev, [currentPath]: true }));
        });
      });

      console.log('Archivos creados:', newFiles);
    }

    window.addEventListener('files-created', handleFilesCreated as EventListener);

    return () => {
      window.removeEventListener('files-created', handleFilesCreated as EventListener);
    };
  }, []);

  return (
    <div className="h-full bg-[#1e1e1e] text-gray-200 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#1e1e1e] border-b border-gray-700 px-3 py-2 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Files
        </span>
        <div className="flex gap-1">
          {onCreateFile && (
            <button
              onClick={() => onCreateFile("newfile.tsx")}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Nuevo archivo"
            >
              <span className="text-xs">📄+</span>
            </button>
          )}
          {onCreateFolder && (
            <button
              onClick={() => onCreateFolder("newfolder")}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Nueva carpeta"
            >
              <span className="text-xs">📁+</span>
            </button>
          )}
        </div>
      </div>

      {/* Árbol de archivos */}
      <div className="py-2">{sortedTree.map((node) => renderNode(node))}</div>
    </div>
  );
};

export default FileExplorer;
