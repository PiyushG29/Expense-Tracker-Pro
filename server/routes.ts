import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

const authMiddleware = async (req: any, res: any, next: any) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = await storage.getUser(parseInt(userId));
  if (!user) {
    return res.status(401).json({ message: "Invalid user" });
  }
  
  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ message: "Email and name are required" });
      }

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email, name });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user", authMiddleware, async (req: any, res) => {
    res.json({ user: req.user });
  });

  // Expense routes
  app.get("/api/expenses", authMiddleware, async (req: any, res) => {
    try {
      const { year, month } = req.query;
      
      let expenses;
      if (year && month) {
        expenses = await storage.getExpensesByUserAndMonth(
          req.user.id, 
          parseInt(year), 
          parseInt(month)
        );
      } else {
        expenses = await storage.getExpensesByUser(req.user.id);
      }
      
      res.json({ expenses });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", authMiddleware, async (req: any, res) => {
    try {
      console.log('Received expense data:', req.body);
      
      const expenseData = insertExpenseSchema.parse(req.body);
      console.log('Parsed expense data:', expenseData);
      
      const expense = await storage.createExpense({
        ...expenseData,
        userId: req.user.id
      });
      
      console.log('Created expense:', expense);
      res.json({ expense });
    } catch (error: any) {
      console.error('Expense creation error:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/expenses/:id", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      
      const expense = await storage.updateExpense(id, req.user.id, expenseData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ expense });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/expenses/:id", authMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id, req.user.id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stats", authMiddleware, async (req: any, res) => {
    try {
      const stats = await storage.getMonthlyStats(req.user.id);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
