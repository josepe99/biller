import type { Metadata } from "next";
import { Roboto } from 'next/font/google'; // Import Roboto from next/font/google
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Configure Roboto font
const roboto = Roboto({
  weight: ['300', '400', '500', '700'], // Specify the weights you need
  subsets: ['latin'],
  display: 'swap', // Use 'swap' for font display strategy [^1]
});

export const metadata: Metadata = {
  title: "Vercel POS System",
  description: "A modern point of sale system designed with Next.js and Tailwind CSS.",
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={roboto.className}><body>
      <ThemeProvider
        attribute="class"
        defaultTheme="light" // Force light mode
        enableSystem={false} // Disable system theme detection
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </body></html>
  );
}
