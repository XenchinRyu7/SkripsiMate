import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

export const metadata: Metadata = {
  title: "SkripsiMate - AI-Powered Thesis Planner",
  description: "Plan your thesis with AI assistance. Interactive roadmap builder for Indonesian students.",
  keywords: ["skripsi", "thesis", "planner", "AI", "Indonesia", "university"],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <DarkModeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
