'use client'

import { format } from 'date-fns'
import { Database } from '@/lib/database.types'

type Expense = Database['public']['Tables']['expenses']['Row']

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-800',
  Transport: 'bg-blue-100 text-blue-800',
  Shopping: 'bg-purple-100 text-purple-800',
  Bills: 'bg-red-100 text-red-800',
  Entertainment: 'bg-pink-100 text-pink-800',
  Healthcare: 'bg-green-100 text-green-800',
  Education: 'bg-indigo-100 text-indigo-800',
  Other: 'bg-gray-100 text-gray-800',
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p className="text-lg">No expenses for this month</p>
        <p className="text-sm mt-2">Click "Add Expense" to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
                <p className="text-sm text-gray-500">
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  ${expense.amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium active:bg-primary-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium active:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
