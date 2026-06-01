import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Shield,
  UserX
} from "lucide-react";
import { firebaseAdminService } from "@/services/firebaseAdmin";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { UserProfile, UserRole } from "@/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { userProfile, isLoading } = useFirebaseAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!userProfile || userProfile.userType !== "admin")) {
      router.push("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const usersData = await firebaseAdminService.getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (userProfile && userProfile.userType === "admin") {
      fetchUsers();
    }
  }, [isLoading, userProfile, router]); // FIXED: Correct dependencies - only run when auth state changes

  useEffect(() => {
    // Filter users based on search query and selected user type
    let filtered = users;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.firstName && user.firstName.toLowerCase().includes(query)) || 
        (user.lastName && user.lastName.toLowerCase().includes(query)) || 
        user.email.toLowerCase().includes(query)
      );
    }
    
    if (selectedUserType !== "all") {
      filtered = filtered.filter(user => user.userType === selectedUserType);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, selectedUserType, users]);

  const handleMakeAdmin = async (userId: string) => {
    try {
      await firebaseAdminService.setUserAsAdmin(userId);
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, userType: UserRole.ADMIN } 
            : user
        )
      );
    } catch (error) {
      console.error("Error making user admin:", error);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await firebaseAdminService.updateUserStatus(userId, !isActive);
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isActive: !isActive } 
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.userType !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Head>
        <title>Manage Users | Admin Dashboard | StaffSpace</title>
        <meta name="description" content="Manage users on the StaffSpace platform" />
      </Head>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/admin/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Button onClick={() => router.push("/admin/users/create")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Users</CardTitle>
                <CardDescription>
                  Manage all users on the StaffSpace platform
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedUserType === "all" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedUserType("all")}
                >
                  All ({users.length})
                </Badge>
                <Badge variant={selectedUserType === "applicant" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedUserType("applicant")}
                >
                  Applicants ({users.filter(u => u.userType === "applicant").length})
                </Badge>
                <Badge variant={selectedUserType === "restaurant" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedUserType("restaurant")}
                >
                  Restaurants ({users.filter(u => u.userType === "restaurant").length})
                </Badge>
                <Badge variant={selectedUserType === "admin" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedUserType("admin")}
                >
                  Admins ({users.filter(u => u.userType === "admin").length})
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.userType === "admin" 
                              ? "default" 
                              : user.userType === "restaurant" 
                                ? "secondary" 
                                : "outline"
                          }>
                            {user.userType === "admin" 
                              ? "Admin" 
                              : user.userType === "restaurant" 
                                ? "Restaurant" 
                                : "Applicant"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.userType !== "admin" && (
                                <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.isActive)}>
                                {user.isActive ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
