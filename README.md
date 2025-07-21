# TasteTrail - AI Travel Planning App

An AI-powered travel planning web application that creates personalized itineraries based on your preferences.

## Important: Setup Instructions

⚠️ **You cannot run this app by opening `index.html` directly in your browser!** This is a React application that requires a development server.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Technology Stack

- **Frontend:** React 18, TypeScript
- **Routing:** React Router Dom
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Date Handling:** date-fns

### Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── assets/           # Static assets
```

## Features

- ✨ AI-powered trip planning
- 📅 Interactive date selection with calendar
- 👥 Customizable traveler options (adults, children, rooms)
- 🗺️ Interactive itinerary timeline
- 📱 Responsive design
- 🌙 Dark mode support

## Development

The app includes mock data for development. Backend API integration points are marked with TODO comments for future implementation.

---

## Deployment

You can deploy this project using [Lovable](https://lovable.dev/projects/714fb7c1-c619-4fc2-9f7a-4e36a5858110) by clicking Share -> Publish.

## Custom Domain

To connect a custom domain, navigate to Project > Settings > Domains in Lovable.