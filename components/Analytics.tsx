'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { Users, TrendingUp, TrendingDown, Receipt, Target, BarChart3 } from 'lucide-react'
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
  /** Total spent in the previous month (for comparison) */
  previousMonthTotal?: number | null
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#64748b']

export default function Analytics({ expenses, selectedMonth, familyMembers = [], previousMonthTotal }: AnalyticsProps) {
  const analytics = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const avgPerDay = expenses.length > 0 ? total / new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() : 0
    const count = expenses.length
    const avgTransaction = count > 0 ? total / count : 0
    const biggestExpense = expenses.length > 0
      ? expenses.reduce((max, exp) => (exp.amount > max.amount ? exp : max), expenses[0])
      : null

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

    const topCategory = categoryData[0]?.name ?? null
    const vsLastMonth =
      previousMonthTotal != null && previousMonthTotal > 0
        ? parseFloat((((total - previousMonthTotal) / previousMonthTotal) * 100).toFixed(1))
        : null

    return {
      total,
      avgPerDay,
      count,
      avgTransaction,
      biggestExpense,
      topCategory,
      vsLastMonth,
      categoryData,
      dailyChartData,
      familyMemberData,
    }
  }, [expenses, selectedMonth, familyMembers, previousMonthTotal])

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

      {analytics.count > 0 && (
        <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Expense insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Receipt className="h-3.5 w-3.5" />
                Biggest expense
              </p>
              {analytics.biggestExpense ? (
                <>
                  <p className="text-lg font-bold text-foreground">
                    ₹{analytics.biggestExpense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground truncate" title={analytics.biggestExpense.description}>
                    {analytics.biggestExpense.description}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                Average transaction
              </p>
              <p className="text-lg font-bold text-foreground">
                ₹{analytics.avgTransaction.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Top category</p>
              <p className="text-lg font-bold text-foreground">
                {analytics.topCategory ?? '—'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Vs last month</p>
              {analytics.vsLastMonth != null ? (
                <div className="flex items-center gap-1">
                  {analytics.vsLastMonth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  )}
                  <span
                    className={
                      analytics.vsLastMonth >= 0
                        ? 'text-lg font-bold text-destructive'
                        : 'text-lg font-bold text-green-600 dark:text-green-400'
                    }
                  >
                    {analytics.vsLastMonth >= 0 ? '+' : ''}{analytics.vsLastMonth}%
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No previous month data</p>
              )}
            </div>
          </div>
        </div>
      )}

      {analytics.categoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card rounded-lg shadow p-4 sm:p-6 border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Spending by Category
            </h3>
            <div className="w-full space-y-4">
              <div className="w-full" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={analytics.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={100}
                      labelLine={false}
                      label={false}
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
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const total = analytics.categoryData.reduce((s, d) => s + d.value, 0)
                        const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                        return [`₹${value.toFixed(2)} (${pct}%)`, name]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {analytics.categoryData.map((entry, index) => {
                  const total = analytics.categoryData.reduce((s, d) => s + d.value, 0)
                  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0'
                  return (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {entry.name} <span className="text-muted-foreground">({pct}%)</span>
                      </span>
                    </div>
                  )
                })}
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
