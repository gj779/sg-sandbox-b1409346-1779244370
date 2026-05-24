import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, HelpCircle, Star, Briefcase, ChefHat } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing | StaffSpace</title>
        <meta name="description" content="StaffSpace pricing plans for job seekers and restaurants. Find the right plan for your needs." />
      </Head>

      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
            Choose the plan that's right for you. Whether you're looking for work or hiring staff, we have options to fit your needs.
          </p>
        </div>

        <Tabs defaultValue="restaurants" className="w-full mb-12">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="restaurants" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                For Restaurants
              </TabsTrigger>
              <TabsTrigger value="jobseekers" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                For Job Seekers
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Restaurant Plans */}
          <TabsContent value="restaurants">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <CardDescription>For small restaurants just getting started</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>1 active job listing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Basic applicant filtering</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Standard listing visibility</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Featured listings</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Advanced applicant filtering</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Applicant messaging</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/register?type=restaurant">
                      Sign Up Free
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Standard Plan */}
              <Card className="flex flex-col border-primary relative">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                  <Badge variant="default" className="bg-primary">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Standard</CardTitle>
                  <CardDescription>For growing restaurants with regular hiring needs</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>5 active job listings</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced applicant filtering</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>1 featured listing per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Applicant messaging</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Resume downloads</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Applicant insights</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/auth/register?type=restaurant&plan=standard">
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>For restaurants with high-volume hiring needs</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Unlimited job listings</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced applicant filtering</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>3 featured listings per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Applicant messaging</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Resume downloads</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Applicant insights & analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/register?type=restaurant&plan=premium">
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Job Seeker Plans */}
          <TabsContent value="jobseekers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Browse available positions</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>View all job listings</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Browse restaurant profiles</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Create profile</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Apply to jobs</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Job alerts</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Featured profile</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/register?type=applicant">
                      Sign Up Free
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Basic Plan */}
              <Card className="flex flex-col border-primary relative">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                  <Badge variant="default" className="bg-primary">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <CardDescription>For active job seekers</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$1</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Create a profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Apply to unlimited jobs</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Basic job alerts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Track application status</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Featured profile</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Early access to listings</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/auth/register?type=applicant&plan=basic">
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>For serious job seekers who want to stand out</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$4.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>All Basic features</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Featured profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Early access to new listings (24 hours)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Application insights</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Enhanced job alerts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Direct messaging with employers</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Resume review</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/register?type=applicant&plan=premium">
                      Get Premium
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 text-primary mr-2" />
                Can I change plans later?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 text-primary mr-2" />
                Is there a contract or commitment?
              </h3>
              <p className="text-muted-foreground">
                No, all our plans are month-to-month with no long-term commitment. You can cancel at any time.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 text-primary mr-2" />
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. We also support PayPal for payment.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 text-primary mr-2" />
                Do you offer discounts for annual payments?
              </h3>
              <p className="text-muted-foreground">
                Yes, we offer a 20% discount when you pay annually. Contact our sales team for more information.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 text-primary mr-2" />
                What is a featured listing?
              </h3>
              <p className="text-muted-foreground">
                Featured listings appear at the top of search results with a highlighted badge, making them more visible to potential applicants. They typically receive 3-5 times more views than standard listings.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground md:text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of restaurants and job seekers who are already using StaffSpace to connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register?type=applicant">
                <Briefcase className="mr-2 h-4 w-4" /> Sign Up as Job Seeker
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/register?type=restaurant">
                <ChefHat className="mr-2 h-4 w-4" /> Sign Up as Restaurant
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
