# Membership Analytics Dashboard

A comprehensive Next.js dashboard for analyzing membership, marketing, and sales pipeline data.

## Features

- **File Upload Interface**: Easy-to-use drag-and-drop CSV file upload
- **Real-time Analysis**: Instant processing of your membership data
- **Comprehensive KPIs**: Track all key metrics including:
  - Total members, active/canceled rates
  - Free trial usage and retention
  - Jotform quiz conversion funnel
  - Member sources and attribution
  - Monthly trends and patterns
  
- **Beautiful Visualizations**: Charts and graphs powered by Recharts
- **Actionable Insights**: AI-powered recommendations based on your data
- **Responsive Design**: Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
cd membership-dashboard
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How to Use

1. **Upload Your CSV Files**:
   - Account Data (all accountsw.csv)
   - Financial Data (updatedfinancial.csv)
   - Jotform Data (jotformemails.csv)

2. **Click "Analyze Data"**: The dashboard will process your files and generate insights

3. **Explore the Dashboard**:
   - **Overview**: High-level KPIs and member statistics
   - **Jotform Pipeline**: Detailed conversion funnel analysis
   - **Free Trial**: Usage patterns and retention metrics
   - **Insights**: Actionable recommendations for improvement

## Key Metrics Explained

### Conversion Rate
Percentage of Jotform quiz takers who become paying members. Industry benchmark: 5-10%

### Free Trial Cancellation Rate
Percentage of free trial users who cancel. Lower is better; aim for <30%

### Retention Rate
Percentage of members who remain active. Target: >70%

### Member Sources
Shows where your members are coming from (Jotform vs. direct/other channels)

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Shadcn UI**: Beautiful, accessible component library
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Papaparse**: CSV parsing
- **date-fns**: Date manipulation

## Project Structure

```
membership-dashboard/
├── app/
│   ├── page.tsx           # Main page with upload and dashboard logic
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── FileUploader.tsx   # CSV file upload component
│   ├── Dashboard.tsx      # Main dashboard with all visualizations
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── types.ts           # TypeScript type definitions
│   ├── dataProcessor.ts   # Data analysis logic
│   └── utils.ts           # Utility functions
└── README.md
```

## Customization

### Adding New Metrics

1. Update `lib/types.ts` to add new fields to `AnalysisResult`
2. Modify `lib/dataProcessor.ts` to calculate the new metrics
3. Update `components/Dashboard.tsx` to display the new data

### Styling

The app uses Tailwind CSS and Shadcn UI. Modify:
- `tailwind.config.ts` for theme customization
- `app/globals.css` for global styles
- Component-level className props for specific styling

## Support

For issues or questions, please refer to the documentation or contact support.

## License

Proprietary - All rights reserved
