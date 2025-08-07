import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DataPrivacyManager = () => {
  // Placeholder functionality
  const handleExportData = () => {
    alert("Data export initiated. You will receive an email shortly.");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion process started.");
    }
  };

  return (
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
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataPrivacyManager;