import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Roboto } from 'next/font/google';
import type { Metadata } from "next";
import "./globals.css";

// Configure Roboto font
const roboto = Roboto({
  weight: ['300', '400', '500', '700'], // Specify the weights you need
  subsets: ['latin'],
  display: 'swap', // Use 'swap' for font display strategy [^1]
});

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </body></html>
  );
}
