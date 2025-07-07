import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

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

// Initialize the app
let initialized = false;
async function initializeApp() {
  if (!initialized) {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // In production, just serve static files
    const nodeEnv = process.env.NODE_ENV || "development";
    if (nodeEnv !== "production") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    initialized = true;
  }
  return app;
}

// For Vercel serverless functions
module.exports = async function handler(req: any, res: any) {
  await initializeApp();
  return app(req, res);
}

// Also export as default for ES module compatibility
export default module.exports;

// For local development
if (process.env.NODE_ENV !== "production") {
  (async () => {
    await initializeApp();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    const host = "0.0.0.0";
    
    app.listen(port, host, () => {
      log(`serving on port ${port}`);
    });
  })();
}
