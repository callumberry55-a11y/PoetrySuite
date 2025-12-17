# Poetry Suite

A modern, feature-rich poetry writing and management application built with React, TypeScript, and Supabase. Poetry Suite helps writers create, organize, and analyze their poetry with AI-powered assistance.

## Features

- **Authentication**: Secure user authentication with email/password
- **Poem Editor**: Write and edit poems with real-time saving
- **AI Assistance**: Get creative help from Google's Gemini AI for poetry composition
- **Library Management**: Organize poems into collections
- **Analytics**: Track your writing progress and statistics
- **Dark/Light Theme**: Toggle between dark and light modes
- **Offline Support**: Progressive Web App (PWA) with offline capabilities
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **PWA**: Service Worker with offline support

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key (optional, for AI features)

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Getting Supabase Credentials

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key
4. The database migrations will run automatically when you use the app

### Getting Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### Supabase Security Configuration

After creating your Supabase project, configure these security settings:

#### Enable Password Breach Protection

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Security and Protection**
4. Enable **"Check for compromised passwords"**
5. This prevents users from using passwords that have been leaked in data breaches

#### Configure Auth Connection Strategy

1. Go to **Project Settings** → **Database**
2. Navigate to **Connection Pooling** settings
3. Under **Auth Server Configuration**, change from fixed connections to **percentage-based**
4. Recommended: Set to 10-20% of total connections
5. This ensures Auth server scales properly with instance size increases

#### Database Migrations

The database migrations in `supabase/migrations/` will automatically set up:
- All required tables (poems, collections, poem_collections, analytics)
- Row Level Security (RLS) policies
- Foreign key indexes for optimal performance
- Proper constraints and default values

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## Project Structure

```
├── public/              # Static assets and PWA files
│   ├── icon.svg        # App icon
│   ├── manifest.json   # PWA manifest
│   └── sw.js          # Service worker
├── src/
│   ├── components/     # React components
│   │   ├── Analytics.tsx
│   │   ├── AuthPage.tsx
│   │   ├── Layout.tsx
│   │   ├── Library.tsx
│   │   ├── PoemEditor.tsx
│   │   └── Settings.tsx
│   ├── contexts/       # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/           # Library integrations
│   │   ├── gemini.ts
│   │   └── supabase.ts
│   ├── utils/         # Utility functions
│   │   └── registerSW.ts
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # App entry point
│   └── index.css      # Global styles
├── supabase/
│   └── migrations/    # Database migrations
└── scripts/           # Build scripts
```

## Database Schema

The app uses the following tables:

- **poems**: Store poem content and metadata
- **collections**: Organize poems into collections
- **poem_collections**: Junction table for poem-collection relationships
- **analytics**: Track writing metrics and statistics

All tables include Row Level Security (RLS) policies to ensure data privacy.

## Features Guide

### Writing Poems

1. Click "New Poem" in the editor
2. Write your poem with title and content
3. Save manually or enable auto-save
4. Use AI assistance for creative suggestions

### Managing Collections

1. Navigate to Library
2. Create new collections to organize your work
3. Add poems to collections
4. Search and filter your library

### Analytics

Track your writing progress:
- Total poems written
- Total word count
- Writing streaks
- Activity over time

### Settings

Configure your experience:
- Toggle dark/light theme
- Manage AI API keys
- Set auto-save preferences

## Deployment

### Deploy to Vercel

```bash
npm run build
# Deploy the 'dist' folder to Vercel
```

### Deploy to Netlify

```bash
npm run build
# Deploy the 'dist' folder to Netlify
```

### Deploy to Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

## Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Password breach protection
- API keys stored securely in environment variables
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue in the GitHub repository.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Database by [Supabase](https://supabase.com)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Icons by [Lucide](https://lucide.dev/)
