
import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";

interface NavigationTabsProps {
  userType: "applicant" | "restaurant";
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

  const tabs = userType === "applicant" ? applicantTabs : restaurantTabs;
  
  const getCurrentTab = () => {
    const path = router.pathname;
    const tab = tabs.find(tab => path === tab.path);
    return tab ? tab.value : tabs[0].value;
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
