import React from 'react';
import Navbar from './components/Navbar'; // Make sure the path is correct
import './globals.css'; // Assuming you have a global CSS file for Tailwind

// This is the root layout for your entire application.
// The `children` prop will be the content of your pages.

export const metadata = {
  title: 'Recipe Ingredient Manager',
  description: 'Manage your recipe ingredients with ease.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
