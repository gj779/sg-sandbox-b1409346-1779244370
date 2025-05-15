import React, { useState, useEffect } from "react";
import Head from "next/head";
import FileBrowser from "@/components/file-storage/FileBrowser";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"; // Changed from useAuth
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import Layout from "@/components/layout/Layout"; // Assuming you have a Layout component
import { UserRole } from "@/types";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function FileManagementPage() {
  const { user, isLoading: authLoading, userProfile } = useFirebaseAuth(); // Changed from useAuth, aliased loading

  if (authLoading) { // Use aliased authLoading
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
          <p>Loading user information...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Head>
          <title>File Management - StaffSpace</title>
        </Head>
        <div className="container mx-auto px-4 py-8 text-center">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You need to be logged in to access the file management page.
              Please <Link href="/auth/login" className="underline hover:text-primary">login</Link> or <Link href="/auth/register" className="underline hover:text-primary">register</Link>.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>File Management - StaffSpace</title>
        <meta name="description" content="Manage your files on StaffSpace." />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <FileBrowser userId={user.uid} initialFolderPath={`documents/${user.uid}/`} />
      </main>
    </Layout>
  );
}