'use client'

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'
import type { Database } from '@/lib/database.types'

export type Expense = Database['public']['Tables']['expenses']['Row']

/** Top-level Firestore collection; each user has a doc and an "expenses" subcollection. */
const TOP_LEVEL_COLLECTION = 'expense_manager'
const EXPENSES_SUBCOLLECTION = 'expenses'

function expensesRef(db: ReturnType<typeof getFirestoreDb>, userId: string) {
  return collection(db, TOP_LEVEL_COLLECTION, userId, EXPENSES_SUBCOLLECTION)
}

function mapDocToExpense(
  id: string,
  userId: string,
  data: Record<string, unknown>
): Expense {
  const d = data as {
    amount: number
    description: string
    category: string
    date: string
    tags?: string[] | null
    created_at: Timestamp | string
    updated_at: Timestamp | string
  }
  return {
    id,
    user_id: userId,
    amount: d.amount,
    description: d.description,
    category: d.category,
    date: d.date,
    tags: d.tags ?? null,
    created_at:
      typeof d.created_at === 'string'
        ? d.created_at
        : d.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updated_at:
      typeof d.updated_at === 'string'
        ? d.updated_at
        : d.updated_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
}

export async function fetchExpenses(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  const db = getFirestoreDb()
  const c = expensesRef(db, userId)
  const q = query(
    c,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => mapDocToExpense(d.id, userId, d.data()))
}

export async function addExpense(
  userId: string,
  data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
    tags?: string[] | null
  }
): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(expensesRef(db, userId))
  await setDoc(ref, {
    amount: data.amount,
    description: data.description,
    category: data.category,
    date: data.date,
    tags: data.tags ?? null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

export async function updateExpense(
  userId: string,
  id: string,
  data: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date' | 'tags'>>
): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, TOP_LEVEL_COLLECTION, userId, EXPENSES_SUBCOLLECTION, id)
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  })
}

export async function deleteExpense(userId: string, id: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = doc(db, TOP_LEVEL_COLLECTION, userId, EXPENSES_SUBCOLLECTION, id)
  await deleteDoc(ref)
}
