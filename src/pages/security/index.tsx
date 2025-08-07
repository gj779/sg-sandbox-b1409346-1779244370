import React from "react";
import { GetServerSideProps } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataPrivacyManager from "@/components/security/DataPrivacyManager";
import SecurityAlerts from "@/components/security/SecurityAlerts";
import { UserRole } from "@/types";

const SecurityPage = () => {
  return (
    <ProtectedRoute allowedUserTypes={[UserRole.ADMIN]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Security Center</h1>
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="privacy">Data & Privacy</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <SecurityDashboard />
          </TabsContent>
          <TabsContent value="alerts">
            <SecurityAlerts />
          </TabsContent>
          <TabsContent value="privacy">
            <DataPrivacyManager />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default SecurityPage;