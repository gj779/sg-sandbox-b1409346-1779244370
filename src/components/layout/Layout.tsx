
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/toaster';
import BackButton from "@/components/common/BackButton";
import { useRouter } from "next/router";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  // Don't show back button on home page
  const showBackButton = router.pathname !== '/';
  
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <div className='flex min-h-screen flex-col'>
        <Header />
        <main className='flex-1'>
          {showBackButton && (
            <div className='container py-4'>
              <BackButton />
            </div>
          )}
          {children}
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
