import type { Metadata } from "next";
import "./globals.css";
import { ProductProvider } from "@/contexts/ProductContext";
import { BrandGuidelinesProvider } from "@/contexts/BrandGuidelinesContext";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Further AI - AI-Powered Product Visuals",
  description: "Created By Further AI Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <AuthProvider>
          <BrandGuidelinesProvider>
            <ProductProvider>
              {children}
            </ProductProvider>
          </BrandGuidelinesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
