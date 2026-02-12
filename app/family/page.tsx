import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'
import FamilyClient from './family-client'

export default async function FamilyPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/login')
  }

  return <FamilyClient userId={user.id} />
}
