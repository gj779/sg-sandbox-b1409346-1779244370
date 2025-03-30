import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/layout/Layout";
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/toaster';

// Load Poppins font for a modern, professional look
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className={`${poppins.variable} font-sans`}>
          <Layout>
            <Component {...pageProps} />
            <Toaster />
          </Layout>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}