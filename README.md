# Cyberstats Platform - Market Intelligence

A modern Next.js application for exploring and analyzing 8000+ curated cybersecurity statistics from 200+ industry sources.

## Features

### 🏠 Landing Page
- Real-time statistics display
- Search functionality
- Overview of platform capabilities
- CTA sections for user conversion

### 🔍 Advanced Search
- Full-text search across 8000+ statistics
- Multiple filter options:
  - Date range filtering
  - Topic tags
  - Publisher filtering
  - Sort by relevance or date
- Real-time results with count
- Export functionality
- Bookmark statistics

### 📊 Analytics Dashboard
- Key metrics visualization:
  - Total statistics count
  - Weekly growth tracking
  - Active data sources
  - Topics covered
- Interactive charts:
  - Weekly activity trend (line chart)
  - Top publishers (bar chart)
  - Topic distribution (pie chart)
  - Recent activity feed
- Trending topics overview

### 📁 Collections
- Create and organize custom collections
- Public/private collection settings
- Collection sharing capabilities
- Tag-based organization
- Team collections (coming soon)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Backend:** Supabase
- **State Management:** React Hooks
- **Icons:** Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Access to the Supabase backend

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://uskpjocrgzwskvsttzxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── search/
│   │   │   └── page.tsx          # Search page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Analytics dashboard
│   │   ├── collections/
│   │   │   └── page.tsx          # Collections management
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   └── lib/
│       ├── supabase.ts           # Supabase client
│       └── utils.ts              # Utility functions
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example env file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.js                # Next.js config
```

## API Integration

The platform connects to the existing Cyberstats RSS API:

### Endpoints Used

**Get Statistics:**
```
GET /functions/v1/rss-cyberstats?key={API_KEY}&format=json&limit=50
```

**Search Statistics:**
```
GET /functions/v1/rss-cyberstats?key={API_KEY}&q={query}&format=json&limit=50&count=1
```

**Parameters:**
- `key` (required): API authentication key
- `format`: Response format (`json` or `rss`)
- `limit`: Number of results (default: 20, max: 100)
- `q`: Search query
- `count`: Include total count (`1` to enable)
- `sort`: Sort order (`relevance`, `date`, `publisher`)
- `digest`: Filter by digest type (`daily`, `monthly`)

### Response Format

```json
{
  "items": [
    {
      "id": 123,
      "title": "70% of organizations experienced a ransomware attack in 2024",
      "link": "https://example.com/report",
      "publisher": "Cybersecurity Ventures",
      "source_name": "2024 Ransomware Report",
      "published_on": "2024-01-15",
      "created_at": "2024-01-16",
      "tags": ["ransomware", "trends", "2024"]
    }
  ],
  "total_count": 8589
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Pages

1. Create a new directory in `src/app/your-page/`
2. Add `page.tsx` with your component
3. Update navigation links in existing pages

### Styling Guidelines

- Use Tailwind utility classes
- Follow the existing color scheme:
  - Primary: Blue (`blue-500`, `blue-600`)
  - Secondary: Purple (`purple-500`, `purple-600`)
  - Success: Green (`green-500`)
  - Warning: Orange (`orange-500`)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production bundle:
```bash
npm run build
```

The output will be in `.next/` directory. Follow your hosting platform's Next.js deployment guide.

## Roadmap

### Phase 1: Enhanced Discovery ✅
- [x] Interactive landing page
- [x] Advanced search with filters
- [x] Analytics dashboard
- [x] Collections feature

### Phase 2: Intelligence & Analysis (Next)
- [ ] AI-powered insights
- [ ] Trend analysis with anomaly detection
- [ ] Competitive intelligence tracking
- [ ] Custom alerts and notifications

### Phase 3: Teams & Collaboration
- [ ] Multi-user authentication
- [ ] Team workspaces
- [ ] Shared collections
- [ ] Permission management
- [ ] Activity logs

### Phase 4: Reports & Content
- [ ] Report builder
- [ ] Export to PDF/PowerPoint
- [ ] Branded templates
- [ ] Citation management

### Phase 5: Enterprise Features
- [ ] SSO integration
- [ ] API access
- [ ] Custom integrations
- [ ] White-label options

## Important Notes

⚠️ **This project is separate from cyberstats-rss**

The platform is a **read-only frontend** that consumes the existing Cyberstats RSS API. It does not modify:
- Supabase database
- Edge Functions
- RSS feeds
- Slack bot
- Ghost CMS integration

All backend services continue to work independently.

## Support

For issues or questions:
1. Check existing documentation
2. Review the PLATFORM_VISION.md document
3. Contact the development team

## License

Proprietary - All rights reserved
