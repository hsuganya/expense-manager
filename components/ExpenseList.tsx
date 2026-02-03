'use client'

import { format } from 'date-fns'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'

type Expense = Database['public']['Tables']['expenses']['Row']

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Shopping: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Bills: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Education: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow p-8 text-center text-muted-foreground">
        <p className="text-lg">No expenses for this month</p>
        <p className="text-sm mt-2">Click "Add Expense" to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-border">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="p-4 hover:bg-accent transition-colors"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    {expense.description}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other
                    }`}
                  >
                    {expense.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className="text-lg sm:text-xl font-bold text-foreground">
                  ₹{expense.amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
