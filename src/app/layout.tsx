import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calendar App",
  description: "A simple calendar application",
};

// This script runs before React hydration
const removeJsFocusVisible = `
  (function() {
    document.documentElement.classList.remove('js-focus-visible');
    document.documentElement.removeAttribute('data-js-focus-visible');
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: removeJsFocusVisible }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
