import fs from "fs";
import path from "path";
import multer from "multer";

const root = process.cwd();

/** General uploads (e.g. membership photos). */
export const uploadsDir = path.join(root, "uploads");

/** Team roster images: served as `/uploads/team-players/<filename>`. */
export const teamPlayersUploadsDir = path.join(uploadsDir, "team-players");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(uploadsDir);
ensureDir(teamPlayersUploadsDir);

const generalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const teamPlayerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(teamPlayersUploadsDir);
    cb(null, teamPlayersUploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

/** Default upload used by `/api/upload` and legacy flows. */
export const upload = multer({
  storage: generalStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

/** Multipart image upload for admin team players (optional; JSON + base64 also supported). */
export const teamPlayerImageUpload = multer({
  storage: teamPlayerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});
