import './index.css';
import './App.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmapster - Visual Capacity Planning',
  description: 'Transform quarterly planning with visual, Tetris-inspired capacity management',
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}