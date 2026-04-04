/**
 * Limpia códigos ANSI de escape de los logs
 */
export function cleanAnsiCodes(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Regex para remover códigos ANSI - usando escape sequences seguras
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[[0-9;]*[mGKHf]|\x1b\]8;[^;]*;[^\x1b]*\x1b\\/g;
  
  // También remover otros caracteres de control comunes
  // eslint-disable-next-line no-control-regex
  const controlCharsRegex = /[\x00-\x1f\x7f-\x9f]/g;
  
  return text
    .replace(ansiRegex, '') // Remover códigos ANSI
    .replace(controlCharsRegex, '') // Remover caracteres de control
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

/**
 * Procesa logs de npm/WebContainer para mostrar información útil
 */
export function processWebContainerLog(rawLog: string): string {
  const cleaned = cleanAnsiCodes(rawLog);
  
  // Filtrar líneas vacías o solo con espacios
  if (!cleaned || cleaned.length < 2) {
    return '';
  }

  // Detectar tipos de mensajes importantes
  if (cleaned.includes('added') && cleaned.includes('packages')) {
    return `${cleaned}`;
  }
  
  if (cleaned.includes('found 0 vulnerabilities')) {
    return 'Instalación completada sin vulnerabilidades';
  }
  
  if (cleaned.includes('npm WARN')) {
    return `${cleaned.replace('npm WARN', '').trim()}`;
  }
  
  if (cleaned.includes('ERROR') || cleaned.includes('error')) {
    return `${cleaned}`;
  }

  // Para logs de desarrollo del servidor
  if (cleaned.includes('Local:') || cleaned.includes('localhost')) {
    return `${cleaned}`;
  }

  if (cleaned.includes('ready') || cleaned.includes('compiled')) {
    return `${cleaned}`;
  }

  // Filtrar logs muy cortos o sin información útil
  if (cleaned.length < 5) {
    return '';
  }

  return cleaned;
}