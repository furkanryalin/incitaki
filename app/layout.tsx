import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ToastProvider } from "@/components/ToastContainer";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { validateEnv } from "@/lib/env";

// Validate environment variables on startup
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // In development, log warning but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Environment validation warning:', error instanceof Error ? error.message : error);
    } else {
      // In production, throw error
      throw error;
    }
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "İnci Takı - Geniş Ürün Yelpazesi",
    template: "%s | İnci Takı",
  },
  description: "Takılar, saatler, oyuncaklar, masa oyunları, eğlence oyunları, hediyelik eşyalar ve daha fazlası. Kaliteli ürünlerle hayatınıza değer katın.",
  keywords: ["takı", "mücevher", "saat", "oyuncak", "hediyelik eşya", "tesbih", "bileklik", "kolye", "online alışveriş", "e-ticaret"],
  authors: [{ name: "İnci Takı" }],
  creator: "İnci Takı",
  publisher: "İnci Takı",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "İnci Takı - Geniş Ürün Yelpazesi",
    description: "Takılar, saatler, oyuncaklar, masa oyunları, eğlence oyunları, hediyelik eşyalar ve daha fazlası. Kaliteli ürünlerle hayatınıza değer katın.",
    siteName: "İnci Takı",
    images: [
      {
        url: "/incitakilogo.png",
        width: 1200,
        height: 630,
        alt: "İnci Takı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "İnci Takı - Geniş Ürün Yelpazesi",
    description: "Takılar, saatler, oyuncaklar, masa oyunları, eğlence oyunları, hediyelik eşyalar ve daha fazlası.",
    images: ["/incitakilogo.png"],
  },
  icons: {
    icon: '/incitakilogo.png',
    apple: '/incitakilogo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'İnci Takı',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ea580c',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <AdminProvider>
                    <ToastProvider>
                      {children}
                      <PWAInstallPrompt />
                      <ServiceWorkerRegistration />
                    </ToastProvider>
                  </AdminProvider>
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </body>
    </html>
  );
}
