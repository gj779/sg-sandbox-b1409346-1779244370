import { useState } from "react";
import Head from "next/head";
import FirebaseConfigTester from "@/components/debug/FirebaseConfigTester";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DebugFirebasePage() {
  return (
    <>
      <Head>
        <title>Firebase Configuration Debug - StaffSpace</title>
        <meta name="description" content="Debug Firebase configuration issues" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto py-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Firebase Configuration Debug
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Test and diagnose Firebase authentication issues
            </p>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Current Issue: Invalid API Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You're experiencing: <strong>"Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)"</strong>
              </p>
              <p className="text-gray-600 text-sm">
                This usually happens when the Firebase API key in your .env.local file is outdated or incorrect. 
                Use the tester below to diagnose the issue and get instructions to fix it.
              </p>
            </CardContent>
          </Card>

          <FirebaseConfigTester />

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Quick Fix Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Most Likely Fix:</h4>
                  <p className="text-yellow-700 text-sm">
                    Your Firebase API key has been regenerated or your project configuration has changed. 
                    You need to get fresh configuration values from Firebase Console.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Step 1: Get New Config</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                      <li>Select your "staffspace-8bab9" project</li>
                      <li>Click ⚙️ (Settings) → Project Settings</li>
                      <li>Scroll to "Your apps" section</li>
                      <li>Find your web app and copy config</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Step 2: Update .env.local</h4>
                    <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                      <li>Open your .env.local file</li>
                      <li>Replace the NEXT_PUBLIC_FIREBASE_* values</li>
                      <li>Save the file</li>
                      <li>Restart your development server</li>
                      <li>Test the configuration again</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
