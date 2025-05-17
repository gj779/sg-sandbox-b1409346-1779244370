
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2 } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Timestamp } from "firebase/firestore";

export default function ProfilePage() {
  const { userProfile, isLoading } = useFirebaseAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "N/A";
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <>
      <Head>
        <title>Profile | StaffSpace</title>
      </Head>
      <div className="container max-w-3xl py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <Link href="/profile/edit" passHref>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  {userProfile?.photoURL && (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">
                      {userProfile?.displayName || "No Name Set"}
                    </h2>
                    <p className="text-muted-foreground">
                      {userProfile?.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <span className="text-sm font-medium">Account Type:</span>
                    <p className="capitalize">{userProfile?.userType || "Not Set"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Member Since:</span>
                    <p>{formatDate(userProfile?.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Phone:</span>
                    <p>{userProfile?.phoneNumber || "Not Set"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Location:</span>
                    <p>{userProfile?.location || "Not Set"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {userProfile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{userProfile.bio}</p>
              </CardContent>
            </Card>
          )}

          {userProfile?.skills && userProfile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
