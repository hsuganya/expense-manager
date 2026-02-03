import { redirect } from 'next/navigation'

export default async function Home() {
  // Directly redirect to dashboard, skip authentication
  redirect('/dashboard')
}
