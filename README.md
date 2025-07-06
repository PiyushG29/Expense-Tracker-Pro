# ExpenseTracker

A modern expense tracking application built with React, TypeScript, and Express.js.

## Features

- 📊 Track expenses with categories and descriptions
- 📈 View monthly statistics and analytics
- 💻 Modern, responsive UI with shadcn/ui components
- 🔒 User authentication and data isolation
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite
- **Deployment**: Vercel

## Deployment on Vercel

### Prerequisites

1. A Vercel account
2. A PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo>
   cd ExpenseTracker
   npm install
   ```

2. **Database Setup**
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your database connection string

3. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

4. **Deploy to Vercel**
   ```bash
   npx vercel
   ```

5. **Configure Environment Variables in Vercel**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add `DATABASE_URL` environment variable

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production" for production builds

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm run start
```

## Security Notes

⚠️ **Important**: The current authentication system uses header-based authentication which is not secure for production. Consider implementing:

- JWT tokens
- OAuth integration  
- Proper session management
- HTTPS enforcement

## Database Schema

The application uses two main tables:
- `users`: User information and authentication
- `expenses`: Expense records linked to users

## License

MIT License
