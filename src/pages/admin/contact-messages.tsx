import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Eye, CheckCircle, MessageSquare } from "lucide-react";
import { getAllContactMessages, updateMessageStatus, ContactMessage } from "@/services/contactService";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function ContactMessagesPage() {
  const { userProfile } = useFirebaseAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.userType !== "admin") {
      router.push("/");
      return;
    }

    loadMessages();
  }, [userProfile, router]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await getAllContactMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);

    if (message.status === "new" && message.id) {
      try {
        await updateMessageStatus(message.id, "read");
        await loadMessages();
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    }
  };

  const handleMarkAsResponded = async (messageId: string) => {
    try {
      await updateMessageStatus(messageId, "responded");
      await loadMessages();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "responded":
        return <Badge variant="outline">Responded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: "General Inquiry",
      support: "Technical Support",
      billing: "Billing Question",
      partnership: "Partnership Opportunity",
      feedback: "Feedback",
    };
    return labels[type] || type;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  if (loading) {
    return (
      <DashboardLayout title="Contact Messages" userType="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Contact Messages | Admin Dashboard</title>
      </Head>

      <DashboardLayout title="Contact Messages" userType="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contact Messages</h1>
              <p className="text-muted-foreground">
                View and manage messages from the contact form
              </p>
            </div>
            <Button onClick={loadMessages} variant="outline">
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messages.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Messages</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messages.filter(m => m.status === "new").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messages.filter(m => m.status === "responded").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>{getStatusBadge(message.status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(message.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">{message.name}</TableCell>
                        <TableCell>{message.email}</TableCell>
                        <TableCell className="text-sm">
                          {getInquiryTypeLabel(message.inquiryType)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {message.subject}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
              <DialogDescription>
                {selectedMessage && formatDate(selectedMessage.createdAt)}
              </DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="font-medium">
                      {getInquiryTypeLabel(selectedMessage.inquiryType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Subject</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() =>
                      window.open(
                        `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`,
                        "_blank"
                      )
                    }
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Reply via Email
                  </Button>
                  {selectedMessage.status !== "responded" && selectedMessage.id && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkAsResponded(selectedMessage.id!)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Responded
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}

export default function ContactMessagesPageWrapper() {
  return (
    <ProtectedRoute allowedUserTypes={['admin']}>
      <ContactMessagesPage />
    </ProtectedRoute>
  );
}