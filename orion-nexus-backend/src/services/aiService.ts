/**
 * aiService — facade that composes the three sub-services.
 *
 * All existing imports ( `import { aiService } from '../services/aiService'` )
 * continue to work without any changes in controllers or routes.
 *
 * Sub-modules:
 *   uiGenerationService  => generateResponse, streamResponse, generateReactComponent
 *   conversationService  => generateCode, explainCode, optimizeCode, reviewCode,
 *                          generateTests, generateProjectStructure, generateFullProject,
 *                          createProjectFiles
 *   previewService       => generateLovablePreviewHTML (used internally by the above)
 *   promptCache          => in-memory prompt cache (TTL 1 h)
 *   aiQueue              => p-limit concurrency queue
 */

import {
  generateResponse,
  streamResponse,
  generateReactComponent,
} from './uiGenerationService';

import {
  generateCode,
  explainCode,
  optimizeCode,
  reviewCode,
  generateTests,
  generateProjectStructure,
  generateFullProject,
  createProjectFiles,
} from './conversationService';

import { generateLovablePreviewHTML } from './previewService';

import type {
  GenerateResponseOptions,
  GenerateCodeOptions,
  GeneratedComponentResult,
  ProjectStructure,
  FullProjectResult,
} from '../types/ai';

// Re-export types so existing code that imported them from here still works
export type {
  GenerateResponseOptions,
  GenerateCodeOptions,
  GeneratedComponentResult,
  ProjectStructure,
  FullProjectResult,
};

class AIService {
  generateResponse(message: string, options: GenerateResponseOptions = {}) {
    return generateResponse(message, options);
  }

  streamResponse(message: string, options: GenerateResponseOptions, onChunk: (chunk: string) => void) {
    return streamResponse(message, options, onChunk);
  }

  generateReactComponent(prompt: string, context?: import('../types/ai').ChatContext, userId?: string, userPlan: 'free' | 'pro' | 'enterprise' = 'free') {
    return generateReactComponent(prompt, context, userId, userPlan);
  }

  generateCode = generateCode;
  explainCode = explainCode;
  optimizeCode = optimizeCode;
  reviewCode = reviewCode;
  generateTests = generateTests;

  generateProjectStructure = generateProjectStructure;
  generateFullProject = generateFullProject;
  createProjectFiles = createProjectFiles;

  generateLovablePreviewHTML = generateLovablePreviewHTML;
}

export const aiService = new AIService();
