import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import ExpensesClient from './expenses-client'

export default async function ExpensesPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/login')
  }

  return <ExpensesClient userId={user.id} />
}
