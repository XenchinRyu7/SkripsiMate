import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "SkripsiMate - AI-Powered Thesis Planner",
  description: "Plan your thesis with AI assistance. Interactive roadmap builder for Indonesian students.",
  keywords: ["skripsi", "thesis", "planner", "AI", "Indonesia", "university"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
