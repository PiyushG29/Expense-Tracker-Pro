import { Card, CardContent } from '@/components/ui/card';
import { Calendar, TrendingUp, Receipt, PiggyBank } from 'lucide-react';
import type { Expense } from '@shared/schema';

interface StatsCardsProps {
  expenses: Expense[];
  monthlyStats: { month: string; total: number; count: number }[];
}

export default function StatsCards({ expenses, monthlyStats }: StatsCardsProps) {
  const currentMonth = new Date();
  const currentMonthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

  const currentMonthStats = monthlyStats.find(stat => stat.month === currentMonthKey) || { total: 0, count: 0 };
  const lastMonthStats = monthlyStats.find(stat => stat.month === lastMonthKey) || { total: 0, count: 0 };
  
  const totalExpenses = expenses.length;
  const avgMonthly = monthlyStats.length > 0 
    ? monthlyStats.reduce((sum, stat) => sum + stat.total, 0) / monthlyStats.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex-shrink-0">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">This Month</p>
            <p className="text-2xl font-semibold">₹{currentMonthStats.total.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-secondary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">Last Month</p>
            <p className="text-2xl font-semibold">₹{lastMonthStats.total.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex-shrink-0">
            <Receipt className="h-8 w-8 text-destructive" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-semibold">{totalExpenses}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex-shrink-0">
            <PiggyBank className="h-8 w-8 text-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">Avg Monthly</p>
            <p className="text-2xl font-semibold">₹{avgMonthly.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
