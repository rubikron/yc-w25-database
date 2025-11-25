# YC Winter 2025 Database

A comprehensive dashboard for exploring and analyzing Y Combinator's Winter 2025 batch of 127 startups.

## Features

- **Company Explorer**: Browse all YC W25 startups with detailed information
- **VC Screening Reports**: AI-generated investment analysis for each company
- **Advanced Filtering**: Search and filter by category, score, and more
- **Table & Grid Views**: Multiple ways to view company data
- **Export Functionality**: Export filtered data for further analysis
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with shadcn/ui
- **State Management**: Zustand
- **Data Tables**: TanStack React Table
- **Charts**: Recharts
- **Search**: Fuse.js

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd yc-w25-database
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Add your API keys to `.env` (only needed if using chat functionality):
```
BRAVE_API_KEY=your_key_here
PERPLEXITY_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. (Optional) Add environment variables if using chat features
7. Click "Deploy"

Your site will be live in minutes!

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Data

The project includes pre-generated VC screening reports for all 127 YC W25 companies in `public/data/companies.json`.

## License

MIT
