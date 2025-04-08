
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function AdminSettings() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUser();

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/admin-login');
        return;
      }
      
      if (!user || user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Safe early return while loading
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Safe early return if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Platform Settings | Admin Dashboard | StaffSpace</title>
        <meta name="description" content="Configure platform settings for StaffSpace" />
      </Head>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
            <p className="text-muted-foreground">
              Configure and manage StaffSpace platform settings
            </p>
          </div>
          <Button onClick={() => router.push("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>The platform settings feature is currently under development and will be available soon.</p>
            <p className="mt-4">This page will include:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>User registration settings</li>
              <li>Email notification configuration</li>
              <li>Platform appearance customization</li>
              <li>Security and privacy settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
