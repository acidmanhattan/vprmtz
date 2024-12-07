// server/index.ts
import express2 from "express";

// server/utils/csv.ts
import { parse } from "csv-parse/sync";
import fetch from "node-fetch";
async function fetchMetadata() {
  try {
    const response = await fetch("https://vprmtz.acidmanhattan.xyz/metadata/vprmtz-metadata.csv");
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    const csvData = await response.text();
    console.log("Raw CSV data first few lines:", csvData.split("\n").slice(0, 3));
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ";",
      trim: true,
      quote: '"',
      escape: '"',
      relax_quotes: true,
      from_line: 1
      // Start from first line
    });
    console.log("First record raw:", records[0]);
    console.log("First record mapped:", {
      imageUrl: records[0].image,
      title: records[0].title,
      description: records[0].description
    });
    const sortedRecords = [...records].sort((a, b) => {
      if (!a.image || !b.image) return 0;
      const aMatch = a.image.match(/^(\d+)/);
      const bMatch = b.image.match(/^(\d+)/);
      const aNum = aMatch ? parseInt(aMatch[1]) : 0;
      const bNum = bMatch ? parseInt(bMatch[1]) : 0;
      return aNum - bNum;
    });
    return sortedRecords.map((record, index) => ({
      id: index + 1,
      imageUrl: record.image?.trim(),
      // Changed from Image to image
      title: record.title?.trim(),
      // Changed from Title to title
      description: record.description?.trim(),
      // Changed from Description to description
      metadata: {
        activity: record.Activity?.trim() || "",
        relationship: record.Relationship?.trim() || "",
        artwork: record.Artwork?.trim() || "",
        domain: record.Domain?.trim() || "",
        material: record.Material?.trim() || "",
        metaphor: record.Metaphor?.trim() || "",
        object: record.Object?.trim() || "",
        observe: record.Observe?.trim() || "",
        symbol: record.Symbol?.trim() || ""
      }
    }));
  } catch (error) {
    console.error("Error in fetchMetadata:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "");
    throw error;
  }
}

// server/utils/r2.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  }
});
var BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
async function getSignedImageUrl(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `images/${key}`,
      ResponseCacheControl: "public, max-age=3600",
      ResponseExpires: new Date(Date.now() + 3600 * 1e3)
    });
    const url = await getSignedUrl(r2Client, command, { expiresIn: 7200 });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return `https://vprmtz.acidmanhattan.xyz/images/${key}`;
  }
}

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/nfts", async (req, res) => {
    try {
      const metadata = await fetchMetadata();
      console.log("Metadata sample:", metadata.slice(0, 2));
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const pageItems = metadata.slice(start, end);
      const signedUrlPromises = pageItems.map(async (item) => {
        if (!item.imageUrl) return item;
        try {
          const signedUrl = await getSignedImageUrl(item.imageUrl);
          return {
            ...item,
            imageUrl: signedUrl
          };
        } catch (error) {
          console.error(`Failed to get signed URL for ${item.imageUrl}:`, error);
          return {
            ...item,
            imageUrl: `https://vprmtz.acidmanhattan.xyz/images/${item.imageUrl}`
          };
        }
      });
      const items = await Promise.all(signedUrlPromises);
      const hasMore = end < metadata.length;
      res.json({ items, hasMore });
    } catch (error) {
      console.error("Error in /api/nfts:", error);
      res.status(500).json({
        error: "Failed to fetch NFTs",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import checker from "vite-plugin-checker";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    checker({ typescript: true, overlay: false }),
    runtimeErrorOverlay(),
    themePlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@db": path.resolve(__dirname, "db")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer } from "http";
function log(message) {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [express] ${message}`);
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  registerRoutes(app);
  const server = createServer(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
