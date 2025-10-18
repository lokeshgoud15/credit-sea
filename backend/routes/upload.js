import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { parseAndSaveReport } from "../controllers/reportcontroller.js";
import logger from "../logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ext === ".xml" ||
      file.mimetype === "application/xml" ||
      file.mimetype === "text/xml"
    )
      cb(null, true);
    else cb(new Error("Only XML files are allowed"));
  },
});

const router = Router();

// POST /api/upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const id = await parseAndSaveReport(req.file.buffer);
    res.status(201).json({ id });
  } catch (err) {
    logger.error("Upload failed", { message: err.message });
    res.status(500).json({ error: err.message });
  }
});

export default router;
