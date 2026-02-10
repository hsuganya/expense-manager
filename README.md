# Expense Manager
e
A modern expense tracking application built with Next.js 14, Firebase, and TypeScript. Features full CRUD operations, authentication, and comprehensive analytics.

## Features

- 🔐 **Authentication**: Secure login/signup flow with Firebase Auth (email/password + Google & GitHub)
- 💰 **Expense Management**: Full CRUD operations (Create, Read, Update, Delete)
- 📊 **Analytics Dashboard**: 
  - Total spending overview
  - Category-wise breakdown with pie charts
  - Daily spending trends with bar charts
  - Average daily spending
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🎨 **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Firebase (Firestore + Firebase Auth)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the Firebase config from `env.firebase.example` into a `.env.local` file in the root directory. Use the values from your Firebase project (**Project settings** → **Your apps** → **SDK setup and configuration**):

```env
# Firebase (client) – from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

For **server-side session verification** (recommended for protected routes), add Firebase Admin credentials from **Project settings** → **Service accounts** → **Generate new private key**:

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. (Optional) Enable Social Login

1. In Firebase Console go to **Authentication** → **Sign-in method**
2. Enable **Google** and/or **GitHub** and follow the prompts
3. In **Authentication** → **Settings** → **Authorized domains**, ensure your app domain (and `localhost` for dev) is listed

### 4. Firestore

- **Data model**: Top-level collection is `expense_manager`. Each logged-in user has a document by their `userId`, with a subcollection `expenses` for their expense items: `expense_manager/{userId}/expenses/{expenseId}`.
- No schema setup is required; documents are created on first use.
- Deploy the index for date-range queries: run `npx firebase deploy --only firestore:indexes` (requires Firebase CLI and `firebase init`), or create the index when Firestore prompts you via the link in the error message.
- In **Firestore** → **Rules**, restrict access so each user can only read/write their own `expense_manager` doc and its `expenses` subcollection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expense_manager/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Create an account from the login page (Sign up).

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Add Expenses**: Click "Add Expense" to record your spending
3. **View Analytics**: See your spending patterns in the dashboard
4. **Edit/Delete**: Manage your expenses with edit and delete options
5. **Filter by Month**: Navigate between months to view historical data

## Project Structure

```
expense-manager/
├── app/
│   ├── api/auth/session/   # Session cookie API (Firebase)
│   ├── auth/callback/      # OAuth redirect handler (optional)
│   ├── dashboard/          # Dashboard page with analytics
│   ├── login/              # Authentication page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects)
│   └── globals.css         # Global styles
├── components/
│   ├── Analytics.tsx       # Analytics dashboard component
│   ├── ExpenseForm.tsx     # Add/Edit expense form
│   └── ExpenseList.tsx     # List of expenses
├── lib/
│   ├── firebase.ts         # Client Firebase app & Auth/Firestore
│   ├── firebase-admin.ts   # Server Firebase Admin (session verification)
│   ├── firestore.ts        # Firestore helpers for expenses
│   ├── auth-server.ts      # getServerUser() for protected pages
│   └── database.types.ts   # TypeScript types (expense shape)
├── firestore.indexes.json  # Composite index for expenses queries
└── env.firebase.example    # Env vars template for Firebase
```

## Features in Detail

### Authentication
- Email/password and Google/GitHub sign-in via Firebase Auth
- Session cookies for server-side protection (when Firebase Admin is configured)
- Protected routes (middleware + server checks)

### Expense Management
- Add expenses with amount, description, category, and date
- Edit existing expenses
- Delete expenses with confirmation
- Filter expenses by month

### Analytics
- **Total Spent**: Sum of all expenses for the selected month
- **Average per Day**: Daily spending average
- **Total Transactions**: Count of expenses
- **Category Breakdown**: Pie chart showing spending by category
- **Daily Spending**: Bar chart showing daily spending trends

### Categories
- Food
- Transport
- Shopping
- Bills
- Entertainment
- Healthcare
- Education
- Other

## Security

- Firestore security rules should restrict access to each user’s own documents
- Server-side session verification with Firebase Admin (when env vars are set)
- Environment variables for API keys and service account

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all Firebase env vars from `env.firebase.example` in Vercel dashboard
4. Deploy!

### Other Platforms

Set the same environment variables as in `env.firebase.example` (all `NEXT_PUBLIC_FIREBASE_*` and, for server auth, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
