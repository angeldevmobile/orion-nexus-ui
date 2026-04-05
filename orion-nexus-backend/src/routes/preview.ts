import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const router = Router();

export const PREVIEWS_DIR = path.join(process.cwd(), 'previews');

// Ensure previews directory exists at startup
fs.mkdir(PREVIEWS_DIR, { recursive: true }).catch(() => {});

/**
 * POST /api/preview/upload
 * Body: { files: { "index.html": "...", "assets/index.js": "..." } }
 * Returns: { url: "https://backend.onrender.com/preview/abc123/" }
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { files } = req.body as { files: Record<string, string> };

    if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
      res.status(400).json({ error: 'files object is required' });
      return;
    }

    const id = crypto.randomBytes(8).toString('hex');
    const previewDir = path.join(PREVIEWS_DIR, id);
    await fs.mkdir(previewDir, { recursive: true });

    for (const [filePath, content] of Object.entries(files)) {
      // Sanitize path — prevent directory traversal
      const safe = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.join(previewDir, safe);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
    }

    const backendUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
    res.json({ url: `${backendUrl}/preview/${id}/` });
  } catch (err) {
    console.error('[preview] upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
