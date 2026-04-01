// Función para crear archivos automáticamente (nuevo código)
export async function createFilesAutomatically(
  files: Array<{ path: string; content: string }>
) {
  try {
    const response = await fetch('http://localhost:3000/api/ai/create-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files })
    });

    if (!response.ok) {
      throw new Error('Failed to create files');
    }

    const result = await response.json();
    
    // Emitir evento para actualizar FileExplorer
    window.dispatchEvent(new CustomEvent('files-created', {
      detail: { files: result.created }
    }));

    return result;
  } catch (error) {
    console.error('Error creating files:', error);
    throw error;
  }
}