import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  // Skip authentication, use a default demo user ID
  // This is a fixed UUID that will be used for all expenses in demo mode
  const defaultUserId = '00000000-0000-0000-0000-000000000000'
  
  return <DashboardClient userId={defaultUserId} />
}
