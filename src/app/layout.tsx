import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career Guidance Platform",
  description: "AI-powered career counseling and guidance platform for schools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto py-6 px-4">
              <div className="text-center text-gray-600">
                <p>© 2025 CareerGuide. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
