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
let appInstance: any = null;

async function initializeApp() {
  if (!initialized) {
    try {
      const server = await registerRoutes(app);

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        console.error(err);
      });

      // Check if we're in Vercel environment
      const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
      
      if (!isVercel) {
        // Local development with Vite
        await setupVite(app, server);
      } else {
        // Production/Vercel - serve static files
        serveStatic(app);
      }

      initialized = true;
      appInstance = app;
    } catch (error) {
      console.error('App initialization error:', error);
      throw error;
    }
  }
  return appInstance || app;
}

// For Vercel serverless functions
module.exports = async function handler(req: any, res: any) {
  try {
    // Simple initialization for Vercel
    if (process.env.VERCEL) {
      // Just register routes without Vite for Vercel
      const simpleApp = express();
      simpleApp.use(express.json());
      simpleApp.use(express.urlencoded({ extended: false }));
      
      // CORS
      simpleApp.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
        
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }
        next();
      });
      
      // Register API routes only
      await registerRoutes(simpleApp);
      
      return simpleApp(req, res);
    } else {
      // Local development with full setup
      const app = await initializeApp();
      return app(req, res);
    }
  } catch (error) {
    console.error('Vercel handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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
