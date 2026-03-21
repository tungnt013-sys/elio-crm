import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elio CRM",
  description: "Lead-to-enrollment CRM for Elio Education"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
        {/* Prevent flash of wrong theme — runs before CSS paints */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('elio:theme');if(t!=='light')document.documentElement.setAttribute('data-theme','dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}` }} />
      </head>
      <body>
        <Providers>
          <div className="app-shell">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
