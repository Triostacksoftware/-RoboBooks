import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Accepts: { files: [{ name: string, data: string /* dataURL or base64 */ }] }
router.post('/', async (req, res) => {
  try {
    const files = req.body?.files;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' });
    }

    const uploadRoot = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
    const quotesDir = path.join(uploadRoot, 'quotes');
    if (!fs.existsSync(quotesDir)) fs.mkdirSync(quotesDir, { recursive: true });

    const saved = files.slice(0, 5).map((f) => {
      const safeName = (f.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
      const ts = Date.now();
      const fileName = `${ts}-${safeName}`;

      const base64 = String(f.data || '');
      const commaIdx = base64.indexOf(',');
      const pure = commaIdx >= 0 ? base64.slice(commaIdx + 1) : base64;
      const buffer = Buffer.from(pure, 'base64');

      // 10MB limit
      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error(`File too large: ${safeName}`);
      }

      fs.writeFileSync(path.join(quotesDir, fileName), buffer);
      return `/uploads/quotes/${fileName}`;
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;


