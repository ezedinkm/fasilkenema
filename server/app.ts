import { type Server } from "node:http";

import express, {
  type Express,
  type Request,
  Response,
  NextFunction,
} from "express";
import bcrypt from "bcryptjs";
import { registerRoutes } from "./routes";
import { storage } from "./storage";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function ensureAdminExists() {
  try {
    const existingAdmin = await storage.getAdminByEmail("admin@gmail.com");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("112233", 10);
      await storage.createAdmin({
        email: "admin@gmail.com",
        password: hashedPassword,
        fullName: "Admin User",
      });
      log("Created default admin user (admin@gmail.com)");
    }

    // Also ensure default branding settings exist
    const brandingHeaderText = await storage.getSettingByKey(
      "branding.headerText",
    );
    const isSaintGeorgeBrand = Boolean(
      brandingHeaderText &&
        /saint\s+george/i.test(brandingHeaderText.value),
    );
    if (!brandingHeaderText) {
      await storage.upsertSetting({
        key: "branding.headerText",
        value: "FASIL S.C",
        description: "Header text displayed in navbar",
      });
    } else if (
      brandingHeaderText.value === "MECHAL FC" ||
      isSaintGeorgeBrand
    ) {
      await storage.upsertSetting({
        key: "branding.headerText",
        value: "FASIL S.C",
        description: "Header text displayed in navbar",
      });
    }

    const brandingHeaderSubtext = await storage.getSettingByKey(
      "branding.headerSubtext",
    );
    if (!brandingHeaderSubtext) {
      await storage.upsertSetting({
        key: "branding.headerSubtext",
        value: "sport Club",
        description: "Subtext displayed below header in navbar",
      });
    } else if (
      isSaintGeorgeBrand &&
      brandingHeaderSubtext.value.toLowerCase() === "sport club"
    ) {
      await storage.upsertSetting({
        key: "branding.headerSubtext",
        value: "sport Club",
        description: "Subtext displayed below header in navbar",
      });
    }

    const logoAssetVersion = await storage.getSettingByKey(
      "migration.clubLogoAssetVersion",
    );
    if (!logoAssetVersion) {
      await storage.upsertSetting({
        key: "branding.logo",
        value: "/fasillogo.png",
        description: "Site logo",
      });
      await storage.upsertSetting({
        key: "branding.favicon",
        value: "/fasillogo.png",
        description: "Site favicon",
      });
      await storage.upsertSetting({
        key: "migration.clubLogoAssetVersion",
        value: "1",
        description: "One-time migration for the updated club logo asset",
      });
    }
  } catch (error) {
    log(`Auto-seed error: ${error}`, "seed");
  }
}

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  // Auto-seed admin user and settings on startup
  await ensureAdminExists();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly run the final setup after setting up all the other routes so
  // the catch-all route doesn't interfere with the other routes
  await setup(app, server);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);

  // LISTEN_HOST overrides. Else: NODE_ENV=development → localhost only; unset or other NODE_ENV → 0.0.0.0 (production-style).
  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  const listenHost =
    process.env.LISTEN_HOST?.trim() ||
    (nodeEnv === "development" ? "localhost" : "0.0.0.0");

  server.listen(port, listenHost, () => {
    const urlHost = listenHost === "0.0.0.0" ? "localhost" : listenHost;
    console.log(
      `Server listening on http://${urlHost}:${port}` +
        (listenHost === "0.0.0.0"
          ? " (bound to 0.0.0.0 — use your host/IP or reverse proxy in production)"
          : ""),
    );
  });
}
