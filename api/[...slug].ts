import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let server: any;
const initServer = async () => {
  if (!server) {
    server = await registerRoutes(app);
  }
  return server;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initServer();
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Use express app to handle the request
  app(req as any, res as any);
}
