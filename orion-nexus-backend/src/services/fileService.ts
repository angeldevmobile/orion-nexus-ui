import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from '../types/api';

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/json',
      'text/javascript',
      'text/css',
      'text/html'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Define interface for project files
interface ProjectFile {
  name: string;
  path: string;
  content: string | Buffer;
  type: 'file' | 'directory';
}

class FileService {
  private uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(file: FileUpload, subDir?: string): Promise<string> {
    try {
      const fileId = uuidv4();
      const extension = path.extname(file.originalname);
      const filename = `${fileId}${extension}`;
      
      const targetDir = subDir 
        ? path.join(this.uploadsDir, subDir)
        : this.uploadsDir;

      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });

      const filePath = path.join(targetDir, filename);
      await fs.writeFile(filePath, file.buffer);

      // Return relative path
      return subDir ? `${subDir}/${filename}` : filename;
    } catch (error) {
      console.error('File save error:', error);
      throw new Error('Failed to save file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('File delete error:', error);
      // Don't throw error if file doesn't exist
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.uploadsDir, filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error('File read error:', error);
      throw new Error('File not found');
    }
  }

  getFileUrl(filePath: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${filePath}`;
  }

  validateImageFile(file: FileUpload): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
  }

  validateCodeFile(file: FileUpload): boolean {
    const allowedTypes = [
      'text/plain',
      'application/json',
      'text/javascript',
      'text/css',
      'text/html'
    ];
    const maxSize = 1 * 1024 * 1024; // 1MB

    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
  }

  async createProjectZip(projectFiles: ProjectFile[]): Promise<Buffer> {
    // This would require a zip library like 'archiver'
    // For now, return a simple implementation
    throw new Error('ZIP creation not implemented yet');
  }
}

export const fileService = new FileService();