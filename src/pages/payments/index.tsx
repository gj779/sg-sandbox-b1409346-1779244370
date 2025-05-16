import Head from "next/head";
import PaymentForm from "@/components/payments/PaymentForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import { CreditCard } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <>
      <Head>
        <title>Payment | StaffSpace</title>
        <meta name="description" content="Process payments securely with StaffSpace" />
      </Head>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
              <p className="text-muted-foreground">
                Process payments securely with our payment system
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your payment information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}