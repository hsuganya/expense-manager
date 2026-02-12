'use client'

import { format } from 'date-fns'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'

type Expense = Database['public']['Tables']['expenses']['Row']

interface FamilyMemberOption {
  id: string
  name: string
}

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  familyMembers?: FamilyMemberOption[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Groceries: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Vegetables: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  Fruits: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  Meats: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Fuel: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Travel: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  Shopping: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Bills: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Gifts: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  Healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'School fee': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'Education & Learning': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const TAG_COLORS: Record<string, string> = {
  'Needs': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  'Wants': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  'Savings / Investments': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  'Debt Repayment': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  'Obligations / Commitments': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  'Discretionary / Nice-to-Have': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  'Luxury / Lifestyle Upgrades': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
}

export default function ExpenseList({ expenses, onEdit, onDelete, familyMembers = [] }: ExpenseListProps) {
  const familyById = Object.fromEntries(familyMembers.map((m) => [m.id, m.name]))
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
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                  {expense.family_member_id && familyById[expense.family_member_id] && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {familyById[expense.family_member_id]}
                    </span>
                  )}
                  {(expense as any).tags && (expense as any).tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {((expense as any).tags as string[]).map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 text-xs font-medium rounded-md border ${
                            TAG_COLORS[tag] || 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
