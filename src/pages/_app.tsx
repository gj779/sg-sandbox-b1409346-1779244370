
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/layout/Layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
