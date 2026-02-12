'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Database } from '@/lib/database.types'
import { addExpense, updateExpense } from '@/lib/firestore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ChevronDown, X } from 'lucide-react'

type Expense = Database['public']['Tables']['expenses']['Row']

const CATEGORIES = [
  'Food',
  'Groceries',
  'Vegetables',
  'Fruits',
  'Meats',
  'Transport',
  'Fuel',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Gifts',
  'Healthcare',
  'School fee',
  'Education & Learning',
  'Other',
]

const TAGS = [
  'Needs',
  'Wants',
  'Savings / Investments',
  'Debt Repayment',
  'Obligations / Commitments',
  'Discretionary / Nice-to-Have',
  'Luxury / Lifestyle Upgrades',
]

export interface FamilyMemberOption {
  id: string
  name: string
}

interface ExpenseFormProps {
  userId: string
  expense?: Expense | null
  familyMembers?: FamilyMemberOption[]
  onClose: () => void
}

export default function ExpenseForm({ userId, expense, familyMembers = [], onClose }: ExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tags, setTags] = useState<string[]>([])
  const [familyMemberId, setFamilyMemberId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString())
      setDescription(expense.description)
      setCategory(expense.category)
      setDate(expense.date)
      setTags((expense as any).tags || [])
      setFamilyMemberId(expense.family_member_id ?? '')
    }
  }, [expense])

  const handleTagToggle = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (expense) {
        await updateExpense(userId, expense.id, {
          amount: parseFloat(amount),
          description,
          category,
          date,
          tags,
          family_member_id: familyMemberId || null,
        })
      } else {
        await addExpense(userId, {
          amount: parseFloat(amount),
          description,
          category,
          date,
          tags,
          family_member_id: familyMemberId || null,
        })
      }

      onClose()
    } catch (err: unknown) {
      console.error('Error saving expense:', err)
      alert(err instanceof Error ? err.message : 'Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="What did you spend on?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {familyMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="familyMember">Family member (optional)</Label>
              <Select value={familyMemberId || 'none'} onValueChange={(v) => setFamilyMemberId(v === 'none' ? '' : v)}>
                <SelectTrigger id="familyMember">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {familyMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-10 py-2"
                >
                  <div className="flex flex-wrap gap-1 flex-1">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-md"
                        >
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-primary/80"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeTag(tag)
                            }}
                          />
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Select tags...</span>
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
                <div className="p-2">
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {TAGS.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={tags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : expense ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
