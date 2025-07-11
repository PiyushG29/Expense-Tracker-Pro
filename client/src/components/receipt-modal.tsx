import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Expense } from '@shared/schema';
import type { AuthUser } from '@/lib/auth';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  month: string;
  user: AuthUser;
}

export default function ReceiptModal({ isOpen, onClose, expenses, month, user }: ReceiptModalProps) {
  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader className="print-hidden">
          <DialogTitle>Expense Receipt</DialogTitle>
          <div className="flex space-x-2">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-area bg-white p-8 min-h-[600px]">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold mb-2">ExpenseTracker Pro</h1>
            <p className="text-muted-foreground">Expense Report</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Report Details</h3>
              <p className="text-sm text-muted-foreground">
                Period: <span className="text-foreground">{month}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Generated: <span className="text-foreground">{format(new Date(), 'dd/MM/yy')}</span>
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">User Information</h3>
              <p className="text-sm text-muted-foreground">
                Name: <span className="text-foreground">{user.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Email: <span className="text-foreground">{user.email}</span>
              </p>
            </div>
          </div>
          
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 text-sm font-semibold">Date</th>
                <th className="text-left py-2 text-sm font-semibold">Description</th>
                <th className="text-left py-2 text-sm font-semibold">Category</th>
                <th className="text-right py-2 text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b">
                  <td className="py-2 text-sm">
                    {format(new Date(expense.date), 'dd/MM/yy')}
                  </td>
                  <td className="py-2 text-sm">{expense.description}</td>
                  <td className="py-2 text-sm">{expense.category}</td>
                  <td className="py-2 text-sm text-right">
                    ₹{parseFloat(expense.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan={3} className="py-3 text-sm font-bold">
                  Total Amount:
                </td>
                <td className="py-3 text-sm text-right font-bold text-primary">
                  ₹{total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <div className="text-center text-xs text-muted-foreground mt-8">
            <p>This receipt was generated by ExpenseTracker Pro</p>
            <p>For questions, contact support@expensetracker.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
