import React, { useState } from 'react';
import { runProject } from '../editor/runProject';

export const QuickRunButton: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setLogs([]);
    setServerUrl(null);

    const onLog = (message: string) => {
      setLogs(prev => [...prev, message]);
    };

    try {
      const url = await runProject(onLog);
      setServerUrl(url);
    } catch (error) {
      onLog(`❌ Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors font-semibold"
      >
        {isRunning ? "⏳ Ejecutando..." : "🚀 Ejecutar Proyecto"}
      </button>

      {logs.length > 0 && (
        <div className="mt-4 bg-black rounded p-3 max-h-40 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-green-400 font-mono text-xs">
              {log}
            </div>
          ))}
        </div>
      )}

      {serverUrl && (
        <div className="mt-3 p-3 bg-green-900 rounded">
          <p className="text-green-400 text-sm mb-1">✅ Servidor activo:</p>
          <a
            href={serverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
          >
            {serverUrl}
          </a>
        </div>
      )}
    </div>
  );
};