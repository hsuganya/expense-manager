'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { Users } from 'lucide-react'
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

interface FamilyMemberOption {
  id: string
  name: string
}

interface AnalyticsProps {
  expenses: Expense[]
  selectedMonth: Date
  familyMembers?: FamilyMemberOption[]
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#64748b']

export default function Analytics({ expenses, selectedMonth, familyMembers = [] }: AnalyticsProps) {
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

    const familyById = Object.fromEntries(familyMembers.map((m) => [m.id, m.name]))
    const expensesWithFamily = expenses.filter((exp) => exp.family_member_id)
    const byFamilyMember = expensesWithFamily.reduce((acc, exp) => {
      const id = exp.family_member_id!
      const name = familyById[id] ?? 'Unknown'
      if (!acc[name]) acc[name] = { total: 0, count: 0 }
      acc[name].total += exp.amount
      acc[name].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)
    const familyTotal = Object.values(byFamilyMember).reduce((sum, { total }) => sum + total, 0)
    const familyMemberData = Object.entries(byFamilyMember)
      .map(([name, { total, count }]) => ({
        name,
        total: parseFloat(total.toFixed(2)),
        count,
        percent: familyTotal > 0 ? parseFloat(((total / familyTotal) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    return { total, avgPerDay, count, categoryData, dailyChartData, familyMemberData }
  }, [expenses, selectedMonth, familyMembers])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            ₹{analytics.total.toFixed(2)}
          </p>
        </div>
        <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Average per Day</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            ₹{analytics.avgPerDay.toFixed(2)}
          </p>
        </div>
        <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Transactions</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics.count}</p>
        </div>
      </div>

      {analytics.categoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Spending by Category
            </h3>
            <div className="relative w-full" style={{ height: 420 }}>
              <ResponsiveContainer width="100%" height={420}>
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={120}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
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
                  <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col gap-1.5 text-center max-h-[280px] overflow-y-auto">
                  {analytics.categoryData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-center gap-2"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
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
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {analytics.categoryData.length > 0 && (
        <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
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
                  <span className="text-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">
                  ₹{item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.familyMemberData.length > 0 && (
        <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Spending by family member
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Expenses tagged with a family member this month
          </p>
          <div className="space-y-3">
            {analytics.familyMemberData.map((item, index) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'expense' : 'expenses'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    ₹{item.total.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {item.percent}% of family spending
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
            Total for family members: ₹
            {analytics.familyMemberData
              .reduce((s, r) => s + r.total, 0)
              .toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}
