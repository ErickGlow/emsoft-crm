import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMSOFT CRM",
  description: "Internal business-development tracker for EMSOFT",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('emsoft-theme');
    var theme = stored || 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
