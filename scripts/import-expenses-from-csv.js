/**
 * Script to import expenses from CSV file into Supabase database
 * Usage: node scripts/import-expenses-from-csv.js <path-to-csv-file>
 * Example: node scripts/import-expenses-from-csv.js "/Users/gsuresh86/Desktop/Selavu - Sheet1.csv"
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Default user ID for demo mode (no authentication)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

// Category mapping from CSV to our categories
const CATEGORY_MAP = {
  'Food': 'Food',
  'Travel': 'Transport',
  'Groceries': 'Shopping',
  'Events': 'Entertainment',
  'Bills': 'Bills',
  'Entertainment': 'Entertainment',
  'Healthcare': 'Healthcare',
  'Education': 'Education',
  'Other': 'Other',
}

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  const expenses = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Handle CSV with potential commas in values
    const values = []
    let current = ''
    let inQuotes = false
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    if (values.length >= 4) {
      const [item, category, amount, dateStr] = values
      
      // Parse date from MM/DD/YYYY to YYYY-MM-DD
      const dateParts = dateStr.split('/')
      if (dateParts.length === 3) {
        const month = dateParts[0].padStart(2, '0')
        const day = dateParts[1].padStart(2, '0')
        const year = dateParts[2]
        const formattedDate = `${year}-${month}-${day}`
        
        // Map category
        const mappedCategory = CATEGORY_MAP[category] || 'Other'
        
        expenses.push({
          description: item || 'Untitled Expense',
          category: mappedCategory,
          amount: parseFloat(amount) || 0,
          date: formattedDate,
        })
      }
    }
  }
  
  return expenses
}

async function importExpenses(csvFilePath) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables')
    console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file')
    process.exit(1)
  }

  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Error: File not found: ${csvFilePath}`)
    process.exit(1)
  }

  // Read CSV file
  console.log(`\n📄 Reading CSV file: ${csvFilePath}`)
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  
  // Parse CSV
  const expenses = parseCSV(csvContent)
  
  if (expenses.length === 0) {
    console.error('❌ Error: No expenses found in CSV file')
    process.exit(1)
  }

  console.log(`✅ Parsed ${expenses.length} expenses from CSV`)
  console.log('\n📋 Expenses to import:')
  expenses.forEach((exp, index) => {
    console.log(`   ${index + 1}. ${exp.description} - ${exp.category} - $${exp.amount} - ${exp.date}`)
  })

  // Connect to Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  console.log('\n⏳ Importing expenses to database...\n')

  // Prepare expenses with user_id
  const expensesToInsert = expenses.map(exp => ({
    user_id: DEFAULT_USER_ID,
    description: exp.description,
    category: exp.category,
    amount: exp.amount,
    date: exp.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  try {
    // Insert expenses in batches to avoid overwhelming the database
    const batchSize = 10
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < expensesToInsert.length; i += batchSize) {
      const batch = expensesToInsert.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('expenses')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        errorCount += batch.length
      } else {
        successCount += data.length
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data.length} expenses`)
      }
    }

    console.log('\n✨ Import completed!')
    console.log(`   ✅ Successfully imported: ${successCount} expenses`)
    if (errorCount > 0) {
      console.log(`   ❌ Failed to import: ${errorCount} expenses`)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.log('Usage: node scripts/import-expenses-from-csv.js <path-to-csv-file>')
  console.log('\nExample:')
  console.log('  node scripts/import-expenses-from-csv.js "/Users/gsuresh86/Desktop/Selavu - Sheet1.csv"')
  console.log('\nOr use the npm script:')
  console.log('  npm run import-expenses "/Users/gsuresh86/Desktop/Selavu - Sheet1.csv"')
  process.exit(1)
}

const csvFilePath = args[0]

importExpenses(csvFilePath)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed to import expenses:', error)
    process.exit(1)
  })
