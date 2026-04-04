import React, { useState, ReactNode, useEffect } from 'react';
import { ProjectContext, ProjectFile } from './ProjectContextType';
import { fileManager } from '@/editor/FileManager';

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  
  const [activeFile, setActiveFile] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState("");
  const [hasActiveProject, setHasActiveProject] = useState(false);

  const updateFileContent = (fileName: string, content: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.name === fileName ? { ...file, content } : file
      )
    );
  };

  const addFile = (file: ProjectFile) => {
    setFiles(prevFiles => [...prevFiles, file]);
  };

  // ✅ Escucha el código generado desde ChatProvider
  useEffect(() => {
    const handleCodeUpdate = (e: CustomEvent) => {
      const newCode = e.detail as string;
      if (!newCode) return;

      // Si el archivo activo existe, lo actualiza
      setFiles(prev =>
        prev.map(f =>
          f.name === activeFile ? { ...f, content: newCode } : f
        )
      );

      // Guarda una vista previa del código renderizado
      setGeneratedPreview(newCode);
    };

    window.addEventListener("updateCodePanel", handleCodeUpdate as EventListener);
    return () => window.removeEventListener("updateCodePanel", handleCodeUpdate as EventListener);
  }, [activeFile]);

  useEffect(() => {
    fileManager.listDir("/").then(entries => {
      setHasActiveProject(entries.length > 0);
    }).catch(() => setHasActiveProject(false));
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        files,
        activeFile,
        generatedPreview,
        setFiles,
        setActiveFile,
        setGeneratedPreview,
        updateFileContent,
        addFile,
        hasActiveProject,
        setHasActiveProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
