
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | StaffSpace</title>
        <meta name="description" content="Page not found" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen flex items-center justify-center">
        <div className="container max-w-md text-center space-y-6 py-12">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">Sorry, we couldn't find the page you requested. This page may have been moved, deleted, or never existed.</p>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}
