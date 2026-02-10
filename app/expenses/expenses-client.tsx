'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import { Database } from '@/lib/database.types'

type Expense = Database['public']['Tables']['expenses']['Row']

export default function ExpensesClient({ userId }: { userId: string }) {
  const pathname = usePathname()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    fetchExpenses()
  }, [selectedMonth])

  const fetchExpenses = async () => {
    try {
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
      fetchExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Failed to delete expense')
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingExpense(null)
    fetchExpenses()
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth((prev) =>
      direction === 'prev' ? subMonths(prev, 1) : new Date()
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-900">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Expense Manager</h1>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${pathname?.startsWith('/dashboard') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Dashboard
              </Link>
              <Link
                href="/expenses"
                className={`text-sm font-medium ${pathname?.startsWith('/expenses') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Expenses
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => changeMonth('prev')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-gray-900"
            >
              ← Prev
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 text-center sm:text-left">
              {format(selectedMonth, 'MMMM yyyy')}
            </h2>
            {format(selectedMonth, 'yyyy-MM') !== format(new Date(), 'yyyy-MM') && (
              <button
                onClick={() => changeMonth('next')}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 text-gray-900"
              >
                Current →
              </button>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="hidden sm:block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm"
          >
            + Add Expense
          </button>
        </div>

        <ExpenseList
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 active:bg-primary-800 flex items-center justify-center text-2xl font-light z-40 transition-transform active:scale-95"
        aria-label="Add Expense"
      >
        +
      </button>

      {showForm && (
        <ExpenseForm
          userId={userId}
          expense={editingExpense}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
