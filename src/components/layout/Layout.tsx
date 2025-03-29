import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <UserProvider>
        <div className='flex min-h-screen flex-col'>
          <Header />
          <main className='flex-1'>{children}</main>
          <Footer />
        </div>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  );
}