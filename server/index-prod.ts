import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";

import "dotenv/config";
import express, { type Express, type Request } from "express";

import runApp from "./app";
import { injectBlogShareMetadata } from "./blogShareMetadata";

export async function serveStatic(app: Express, server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { index: false }));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res, next) => {
    try {
      const html = await fs.promises.readFile(
        path.resolve(distPath, "index.html"),
        "utf-8",
      );
      const page = await injectBlogShareMetadata(html, req);
      res.status(200).type("html").send(page);
    } catch (error) {
      next(error);
    }
  });
}

(async () => {
  await runApp(serveStatic);
})();
