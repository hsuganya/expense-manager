import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/login')
  }

  return <DashboardClient userId={user.id} />
}
