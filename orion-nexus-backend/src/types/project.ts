export interface ProjectFile {
  name: string;
  content: string;
  type: string;
  path: string;
}

export interface ProjectSettings {
  framework: string;
  language: string;
  template: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  settings: ProjectSettings;
  isPublic?: boolean;
  collaborators?: number[]; 
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
  isPublic?: boolean;
  collaborators?: number[]; 
}