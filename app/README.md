# Roadmapster - Visual Capacity Planning Tool

A visual, Tetris-inspired capacity planning tool for software development teams. Built with Next.js, React, and TypeScript.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: CSS Modules
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Features

- 📊 **Visual Capacity Planning**: Plan team capacity across quarters with intuitive drag-and-drop
- 👥 **Team Management**: Configure team members, vacation days, and working capacity
- 📝 **Epic Management**: Create, edit, and organize epics with T-shirt sizing
- 📅 **Quarter Planning**: Manage multiple quarters with capacity visualization
- 💾 **Data Persistence**: Automatic saving to browser localStorage
- 📤 **Import/Export**: Export planning data to JSON for backup and sharing

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/roadmapster.git
cd roadmapster/app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

### `npm run dev`
Runs the app in development mode with hot-reload enabled.

### `npm run build`
Builds the app for production in the `.next` folder.

### `npm run start`
Runs the built app in production mode. Run `npm run build` first.

### `npm run lint`
Runs the Next.js linter to check for code quality issues.

## Project Structure

```
app/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   │   ├── Backlog.tsx
│   │   ├── EpicCard.tsx
│   │   ├── EpicForm.tsx
│   │   ├── QuarterForm.tsx
│   │   ├── QuartersPanel.tsx
│   │   ├── QuarterView.tsx
│   │   └── TeamConfiguration.tsx
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page component
│   ├── App.css           # Application styles
│   └── index.css         # Global styles
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Usage Guide

### Team Configuration
1. Click "Team Settings" to configure your team
2. Add team members and set their vacation days
3. Adjust buffer percentage for unknown work
4. Set on-call days per sprint

### Epic Management
1. Click "Add Epic" to create new work items
2. Set T-shirt size (XS, S, M, L, XL) for effort estimation
3. Assign priority (P0-P3) for sorting
4. Add description, owner, and required skills

### Quarter Planning
1. Click "Create Quarter" to add planning periods
2. Drag epics from backlog to quarters (Note: drag-and-drop has known issues)
3. Monitor capacity utilization with visual indicators:
   - Green: Under 75% capacity
   - Yellow: 75-90% capacity
   - Red: Over 90% capacity

### Data Management
- **Export**: Click "Export" to download planning data as JSON
- **Import**: Click "Import" to load previously exported data
- **Auto-save**: All changes are automatically saved to browser localStorage

## Known Issues

- **Drag and Drop**: The drag-and-drop functionality for moving epics between backlog and quarters is currently not working properly. Use the edit functionality as a workaround.
- **Logo 404**: Missing logo192.png file causes a 404 error in the console (cosmetic issue only)

## Development Notes

This project was migrated from Create React App to Next.js. The migration provides:
- Better performance with automatic code splitting
- Server-side rendering capabilities
- Built-in optimization features
- Modern React 19 features support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue in the GitHub repository.