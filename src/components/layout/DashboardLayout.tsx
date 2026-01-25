
import { ReactNode } from "react";
import Head from "next/head";
import NavigationTabs from "@/components/common/NavigationTabs";
import { useUser } from "@/contexts/UserContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  userType: "applicant" | "restaurant" | "admin";
}

export default function DashboardLayout({
  children,
  title,
  description,
  userType,
}: DashboardLayoutProps) {
  const { isAuthenticated } = useUser();

  return (
    <>
      <Head>
        <title>{title} | StaffSpace</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <div className="container py-6 md:py-8">
        {isAuthenticated && (
          <div className="mb-6">
            <NavigationTabs userType={userType} />
          </div>
        )}
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>

        {children}
      </div>
    </>
  );
}
