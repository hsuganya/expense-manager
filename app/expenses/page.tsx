import ExpensesClient from './expenses-client'

export default async function ExpensesPage() {
  const defaultUserId = '00000000-0000-0000-0000-000000000000'
  return <ExpensesClient userId={defaultUserId} />
}
