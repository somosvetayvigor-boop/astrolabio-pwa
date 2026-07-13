
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0d1117",
};

export const metadata: Metadata = {
  title: "Astrolabio | Navegando por historias",
  description: "Lee y vende libros. Apoya a escritores independientes.",
  appleWebApp: {
    capable: true,
    title: "Astrolabio",
    statusBarStyle: "default",
  },
};

import { createClient } from '@/utils/supabase/server';
import { logout } from '@/app/login/actions';

import PWAProvider from '@/components/PWAProvider';
import InstallPWA from '@/components/InstallPWA';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import Navbar from '@/components/Navbar';
import { AudioProvider } from '@/components/GlobalAudioPlayer';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let currentStreak = 0;
  let isAdmin = false;
  let isPremium = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, is_admin, subscription_status')
      .eq('id', user.id)
      .single();
      
    if (profile && profile.current_streak) {
      currentStreak = profile.current_streak;
    }
    if (profile && profile.is_admin) {
      isAdmin = profile.is_admin;
    }
    if (profile && profile.subscription_status === 'active') {
      isPremium = true;
    }
  }

  return (
    <html lang="es">
      <body className={`${inter.variable}`}>
        <AudioProvider>
          <CustomSplashScreen />
          <PWAProvider />
          <Navbar user={user} streak={currentStreak} isAdmin={isAdmin} isPremium={isPremium} />
          <main>
            {children}
          </main>
          <InstallPWA />
        </AudioProvider>
      </body>
    </html>
  );
}
