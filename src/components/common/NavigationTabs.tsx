import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";

interface NavigationTabsProps {
  userType: "applicant" | "restaurant" | "admin";
  className?: string;
}

export default function NavigationTabs({ userType, className }: NavigationTabsProps) {
  const router = useRouter();
  const { isAuthenticated } = useUser();

  const applicantTabs = [
    { value: "dashboard", label: "Dashboard", path: "/applicant/dashboard" },
    { value: "jobs", label: "Browse Jobs", path: "/jobs" },
    { value: "applications", label: "My Applications", path: "/applications" },
    { value: "resume", label: "My Resume", path: "/applicant/create-resume" },
    { value: "messages", label: "Messages", path: "/messaging" },
  ];

  const restaurantTabs = [
    { value: "dashboard", label: "Dashboard", path: "/restaurant/dashboard" },
    { value: "listings", label: "My Listings", path: "/restaurant/listings" },
    { value: "create", label: "Create Listing", path: "/restaurant/create-listing" },
    { value: "applicants", label: "Applicants", path: "/restaurant/applicants" },
    { value: "messages", label: "Messages", path: "/messaging" },
  ];

  const adminTabs = [
    { value: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
    { value: "users", label: "Users", path: "/admin/users" },
    { value: "jobs", label: "Jobs", path: "/admin/jobs" },
    { value: "messages", label: "Messages", path: "/admin/contact-messages" },
    { value: "test-accounts", label: "Test Accounts", path: "/admin/test-accounts" },
  ];

  const tabs = userType === "applicant" ? applicantTabs : userType === "restaurant" ? restaurantTabs : adminTabs;
  
  const getCurrentTab = () => {
    const path = router.pathname;
    
    // Extract base path for nested route matching (e.g., /jobs/123 -> /jobs)
    const pathSegments = path.split('/').filter(Boolean);
    const basePath = pathSegments.length > 0 ? '/' + pathSegments[0] : '/';
    
    // Try exact match first
    let tab = tabs.find(tab => path === tab.path);
    
    // If no exact match, try base path match (for nested routes like /jobs/[id])
    if (!tab) {
      tab = tabs.find(tab => tab.path.startsWith(basePath) || path.startsWith(tab.path));
    }
    
    // Safe fallback with validation - check if tabs[0] exists
    return tab ? tab.value : (tabs[0]?.value || "dashboard");
  };

  const handleTabChange = (value: string) => {
    const tab = tabs.find(tab => tab.value === value);
    if (tab) {
      router.push(tab.path);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`w-full overflow-auto ${className}`}>
      <Tabs defaultValue={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 max-w-[200px]">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
