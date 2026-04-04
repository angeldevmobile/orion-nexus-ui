import React, { useState } from 'react';
import { ProjectManager } from './ProjectManager';

export const ProjectTemplateSelector: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const templates = ProjectManager.getAvailableTemplates();

  const handleCreateProject = async (templateId: string) => {
    setIsLoading(true);
    setLogs([]);
    setServerUrl(null);

    const onLog = (message: string) => {
      setLogs(prev => [...prev, message]);
    };

    try {
      const url = await ProjectManager.createAndRunProject(templateId, onLog);
      setServerUrl(url);
    } catch (error) {
      onLog(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">
        Crear Nuevo Proyecto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="text-3xl mb-2">{template.icon}</div>
            <h3 className="text-white font-semibold mb-2">{template.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{template.description}</p>
            
            <button
              onClick={() => handleCreateProject(template.id)}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              {isLoading ? "⏳ Creando..." : "🚀 Crear & Ejecutar"}
            </button>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="bg-black rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-green-400 font-semibold mb-2">📝 Logs:</h3>
          {logs.map((log, index) => (
            <div key={index} className="text-green-400 font-mono text-sm">
              {log}
            </div>
          ))}
        </div>
      )}

      {serverUrl && (
        <div className="mt-4 p-4 bg-green-900 rounded-lg">
          <h3 className="text-green-400 font-semibold mb-2">🌍 Servidor:</h3>
          <a
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {serverUrl}
          </a>
        </div>
      )}
    </div>
  );
};