import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Receipt, LogOut } from 'lucide-react';
import StatsCards from '@/components/stats-cards';
import ExpenseForm from '@/components/expense-form';
import ExpenseList from '@/components/expense-list';
import ReceiptModal from '@/components/receipt-modal';
import { authService } from '@/lib/auth';
import type { Expense } from '@shared/schema';
import type { AuthUser } from '@/lib/auth';

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ expenses: Expense[]; month: string }>({
    expenses: [],
    month: '',
  });

  const { data: expensesData } = useQuery({
    queryKey: ['/api/expenses'],
    queryFn: async () => {
      const response = await fetch('/api/expenses', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      return response.json();
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        headers: authService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const expenses = expensesData?.expenses || [];
  const monthlyStats = statsData?.stats || [];

  const handleGenerateReceipt = (expenses: Expense[], month: string) => {
    setReceiptData({ expenses, month });
    setReceiptModalOpen(true);
  };

  return (
    <div className="min-h-screen main-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold">ExpenseTracker Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards expenses={expenses} monthlyStats={monthlyStats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Expense Form */}
          <div className="lg:col-span-1">
            <ExpenseForm />
          </div>

          {/* Expense List */}
          <div className="lg:col-span-2">
            <ExpenseList 
              expenses={expenses}
              onGenerateReceipt={handleGenerateReceipt}
            />
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Expense Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {monthlyStats.slice(0, 3).map((stat, index) => {
                const [year, month] = stat.month.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                return (
                  <div 
                    key={stat.month} 
                    className={`text-center p-4 rounded-lg ${
                      index === 0 ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${
                      index === 0 ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {monthName}
                    </h3>
                    <p className="text-2xl font-bold">₹{stat.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{stat.count} expenses</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        expenses={receiptData.expenses}
        month={receiptData.month}
        user={user}
      />
    </div>
  );
}
