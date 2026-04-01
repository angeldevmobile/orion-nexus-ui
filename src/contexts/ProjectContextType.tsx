import { createContext } from "react";

export interface ProjectFile {
  name: string;
  type: string;
  size: string;
  content: string;
}

export type ProjectContextType = {
  files: ProjectFile[];
  activeFile: string;
  generatedPreview: string;
  setFiles: (files: ProjectFile[]) => void;
  setActiveFile: (fileName: string) => void;
  setGeneratedPreview: (preview: string) => void;
  updateFileContent: (fileName: string, content: string) => void;
  addFile: (file: ProjectFile) => void;
};

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);