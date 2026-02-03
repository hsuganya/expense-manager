'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { Database } from '@/lib/database.types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type Expense = Database['public']['Tables']['expenses']['Row']

interface AnalyticsProps {
  expenses: Expense[]
  selectedMonth: Date
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#64748b']

export default function Analytics({ expenses, selectedMonth }: AnalyticsProps) {
  const analytics = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const avgPerDay = expenses.length > 0 ? total / new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() : 0
    const count = expenses.length

    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>)

    const categoryData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)

    const dailyData = expenses.reduce((acc, exp) => {
      const day = format(new Date(exp.date), 'MMM dd')
      acc[day] = (acc[day] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>)

    const dailyChartData = Object.entries(dailyData)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => {
        const dateA = new Date(`${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}-${a.name.split(' ')[1]}`)
        const dateB = new Date(`${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}-${b.name.split(' ')[1]}`)
        return dateA.getTime() - dateB.getTime()
      })

    return { total, avgPerDay, count, categoryData, dailyChartData }
  }, [expenses, selectedMonth])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            ${analytics.total.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Average per Day</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            ${analytics.avgPerDay.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.count}</p>
        </div>
      </div>

      {analytics.categoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Spending by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Daily Spending
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {analytics.categoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
            Category Breakdown
          </h3>
          <div className="space-y-2">
            {analytics.categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ${item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
