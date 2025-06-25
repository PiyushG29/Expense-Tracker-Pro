import { users, expenses, type User, type InsertUser, type Expense, type InsertExpense } from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Expense operations
  getExpensesByUser(userId: number): Promise<Expense[]>;
  getExpensesByUserAndMonth(userId: number, year: number, month: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense & { userId: number }): Promise<Expense>;
  updateExpense(id: number, userId: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number, userId: number): Promise<boolean>;
  getMonthlyStats(userId: number): Promise<{ month: string; total: number; count: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private expenses: Map<number, Expense>;
  private currentUserId: number;
  private currentExpenseId: number;

  constructor() {
    this.users = new Map();
    this.expenses = new Map();
    this.currentUserId = 1;
    this.currentExpenseId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getExpensesByUser(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpensesByUserAndMonth(userId: number, year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return Array.from(this.expenses.values())
      .filter(expense => 
        expense.userId === userId &&
        new Date(expense.date) >= startDate &&
        new Date(expense.date) <= endDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createExpense(expenseData: InsertExpense & { userId: number }): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = {
      ...expenseData,
      id,
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, userId: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense || expense.userId !== userId) {
      return undefined;
    }

    const updatedExpense: Expense = {
      ...expense,
      ...expenseData
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number, userId: number): Promise<boolean> {
    const expense = this.expenses.get(id);
    if (!expense || expense.userId !== userId) {
      return false;
    }
    return this.expenses.delete(id);
  }

  async getMonthlyStats(userId: number): Promise<{ month: string; total: number; count: number }[]> {
    const userExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.userId === userId);

    const monthlyData = new Map<string, { total: number; count: number }>();

    userExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, count: 0 });
      }
      
      const current = monthlyData.get(monthKey)!;
      current.total += parseFloat(expense.amount);
      current.count += 1;
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const sql_client = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql_client);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getExpensesByUser(userId: number): Promise<Expense[]> {
    return await this.db.select().from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date));
  }

  async getExpensesByUserAndMonth(userId: number, year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await this.db.select().from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .orderBy(desc(expenses.date));
  }

  async createExpense(expenseData: InsertExpense & { userId: number }): Promise<Expense> {
    const result = await this.db.insert(expenses).values(expenseData).returning();
    return result[0];
  }

  async updateExpense(id: number, userId: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const result = await this.db.update(expenses)
      .set(expenseData)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteExpense(id: number, userId: number): Promise<boolean> {
    const result = await this.db.delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getMonthlyStats(userId: number): Promise<{ month: string; total: number; count: number }[]> {
    const result = await this.db.select({
      month: sql<string>`TO_CHAR(${expenses.date}, 'YYYY-MM')`.as('month'),
      total: sql<number>`SUM(${expenses.amount}::numeric)`.as('total'),
      count: sql<number>`COUNT(*)`.as('count')
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM') DESC`);

    return result.map(row => ({
      month: row.month,
      total: Number(row.total),
      count: Number(row.count)
    }));
  }
}

// Use database storage in production, memory storage for development/testing
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
