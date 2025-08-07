
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, FileText, Settings, AlertTriangle } from 'lucide-react';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import DataPrivacyManager from '@/components/security/DataPrivacyManager';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useFirebaseAuth';

export default function SecurityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
                <p className="text-gray-600">Manage your security settings and privacy preferences</p>
              </div>
            </div>

            {/* Security Status Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Encryption Active</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">Data protected with AES-256</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Audit Logging</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">All activities monitored</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">GDPR Compliant</span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">Privacy rights protected</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Security Alerts</span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">Real-time monitoring</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <DataPrivacyManager />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Activity Logs
                  </CardTitle>
                  <CardDescription>
                    View detailed logs of all account activities and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecurityDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Configure advanced security options and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Session Management</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Control how long your sessions remain active
                        </p>
                        <Button variant="outline" size="sm">
                          Configure Sessions
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">API Access</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage API keys and third-party integrations
                        </p>
                        <Button variant="outline" size="sm">
                          Manage API Keys
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Security Notifications</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get notified about suspicious activities
                        </p>
                        <Button variant="outline" size="sm">
                          Configure Alerts
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
