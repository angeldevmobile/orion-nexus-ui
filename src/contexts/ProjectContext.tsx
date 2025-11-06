import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ProjectFile {
  name: string;
  type: string;
  size: string;
  content: string;
}

interface ProjectContextType {
  files: ProjectFile[];
  activeFile: string;
  generatedPreview: string;
  setFiles: (files: ProjectFile[]) => void;
  setActiveFile: (fileName: string) => void;
  setGeneratedPreview: (preview: string) => void;
  updateFileContent: (fileName: string, content: string) => void;
  addFile: (file: ProjectFile) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<ProjectFile[]>([
    { 
      name: "App.tsx", 
      type: "react", 
      size: "2.4 KB",
      content: `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">
          Bienvenido a Orion Builder
        </h1>
        <p className="text-muted-foreground mb-6">
          Crea aplicaciones modernas con IA
        </p>
        <Button className="bg-primary">
          Comenzar
        </Button>
      </Card>
    </div>
  );
}`
    },
    { 
      name: "index.tsx", 
      type: "react", 
      size: "1.2 KB",
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
    },
    { 
      name: "styles.css", 
      type: "css", 
      size: "3.8 KB",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: 199 89% 48%;
  --background: 222 47% 11%;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
    },
  ]);
  
  const [activeFile, setActiveFile] = useState("App.tsx");
  const [generatedPreview, setGeneratedPreview] = useState("");

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
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
