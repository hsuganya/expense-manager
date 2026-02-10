'use client'

import { Wallet, Receipt, Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Wallet },
  { title: 'Expenses', href: '/expenses', icon: Receipt },
]

interface MobileBottomNavProps {
  onAddExpense?: () => void
  addHref?: string
}

export default function MobileBottomNav({ onAddExpense, addHref }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors rounded-lg min-w-0',
                isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
              <span className="text-xs font-medium truncate">{item.title}</span>
            </Link>
          )
        })}
        {(onAddExpense || addHref) && (
          onAddExpense ? (
            <button
              onClick={onAddExpense}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors rounded-lg min-w-0 text-primary active:text-primary/80"
              aria-label="Add Expense"
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium truncate">Add</span>
            </button>
          ) : (
            <Link
              href={addHref!}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors rounded-lg min-w-0 text-primary active:text-primary/80"
              aria-label="Add Expense"
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium truncate">Add</span>
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
