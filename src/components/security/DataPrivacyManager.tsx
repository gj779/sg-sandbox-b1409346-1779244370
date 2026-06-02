import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DataPrivacyManager = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = () => {
    // Placeholder functionality
    alert("Data export initiated. You will receive an email shortly.");
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(false);
    // Placeholder functionality
    alert("Account deletion process started.");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy Settings</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visibility">Make my profile public</Label>
              <Switch id="profile-visibility" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sharing">Share data with third-party services</Label>
              <Switch id="data-sharing" defaultChecked />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Manage Your Data</h3>
            <div className="flex items-center justify-between">
              <span>Export my data</span>
              <Button variant="outline" onClick={handleExportData}>Export</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Delete my account</span>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataPrivacyManager;