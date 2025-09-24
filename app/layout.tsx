import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { CashRegisterProvider } from "@/components/checkout/CashRegisterContext";
import { Roboto } from 'next/font/google';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Biller - Sistema de Punto de Venta',
  description: 'Gestiona tu negocio de manera eficiente con nuestro sistema integral de ventas, inventario y administración. Diseñado para ser fácil de usar y potente.',
};

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
          <CashRegisterProvider>
            {children}
          </CashRegisterProvider>
        </AuthProvider>
      </ThemeProvider>
    </body></html>
  );
}
