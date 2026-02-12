'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fetchExpenses, fetchFamilyMembers, type Expense, type FamilyMember } from '@/lib/firestore'
import { Wallet, Receipt, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import Analytics from '@/components/Analytics'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import MobileBottomNav from '@/components/MobileBottomNav'
import Logo from '@/components/Logo'
import SignOutButton from '@/components/SignOutButton'

export default function DashboardClient({ userId }: { userId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    loadExpenses()
  }, [selectedMonth])

  useEffect(() => {
    fetchFamilyMembers(userId).then(setFamilyMembers).catch(console.error)
  }, [userId])

  const loadExpenses = async () => {
    try {
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
      const data = await fetchExpenses(userId, startDate, endDate)
      setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth((prev) =>
      direction === 'prev' ? subMonths(prev, 1) : new Date()
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar className="hidden md:flex">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <Logo size="sm" showText={false} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Expense Manager</span>
              <span className="text-xs text-muted-foreground">Track your spending</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard">
                      <Wallet className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/expenses">
                      <Receipt className="h-4 w-4" />
                      <span>Expenses</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/family">
                      <Users className="h-4 w-4" />
                      <span>Family</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 space-y-2">
            <SignOutButton />
            <div className="text-xs text-muted-foreground">
              Expense Manager v0.1.0
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:flex hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:flex hidden" />
          <Logo size="sm" showText={true} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <h2 className="text-lg sm:text-xl font-semibold flex-1 text-center sm:text-left">
                {format(selectedMonth, 'MMMM yyyy')}
              </h2>
              {format(selectedMonth, 'yyyy-MM') !== format(new Date(), 'yyyy-MM') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth('next')}
                >
                  Current
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button asChild className="hidden sm:flex">
              <Link href="/expenses">Add Expense</Link>
            </Button>
          </div>

          <Analytics
            expenses={expenses}
            selectedMonth={selectedMonth}
            familyMembers={familyMembers.map((m) => ({ id: m.id, name: m.name }))}
          />
        </div>
      </SidebarInset>
      <MobileBottomNav addHref="/expenses" />
    </SidebarProvider>
  )
}
