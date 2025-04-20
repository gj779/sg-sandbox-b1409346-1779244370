
import Head from "next/head";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Users, Award, Clock, Globe, ChefHat, Briefcase } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | StaffSpace</title>
        <meta name="description" content="Learn about StaffSpace - the premier platform connecting talented staff with the best restaurants and hospitality venues." />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
              Connecting Talent with <span className="text-primary">Opportunity</span>
            </h1>
            <p className="text-muted-foreground md:text-xl mb-8">
              StaffSpace is revolutionizing how restaurants find staff and how hospitality professionals discover their next career opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/jobs">
                  <Briefcase className="mr-2 h-4 w-4" /> Browse Jobs
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/restaurant/create-listing">
                  <ChefHat className="mr-2 h-4 w-4" /> Post a Job
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                At StaffSpace, we're on a mission to transform the restaurant and hospitality hiring process. We believe that finding the right talent or the perfect job shouldn't be complicated or time-consuming.
              </p>
              <p className="text-muted-foreground mb-6">
                We've built a platform that makes it easy for restaurants to connect with qualified staff who match their specific needs, and for hospitality professionals to discover opportunities that align with their skills, experience, and availability.
              </p>
              <p className="text-muted-foreground">
                By focusing exclusively on the restaurant and hospitality industry, we're able to provide specialized tools and features that address the unique challenges of staffing in this dynamic sector.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Connect</h3>
                    <p className="text-muted-foreground">
                      Bringing together restaurants and talented staff through a specialized platform designed for the hospitality industry.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Simplify</h3>
                    <p className="text-muted-foreground">
                      Streamlining the hiring process to save time and reduce the stress of finding the right match.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Elevate</h3>
                    <p className="text-muted-foreground">
                      Raising the standard of hospitality staffing through better matches and more efficient processes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Story</h2>
            <p className="text-muted-foreground md:text-lg">
              StaffSpace was born from firsthand experience with the challenges of restaurant staffing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-medium mb-3">The Challenge</h3>
              <p className="text-muted-foreground mb-4">
                Our founders, having worked in the restaurant industry for years, experienced the frustration of traditional hiring methods. High turnover rates, no-shows for interviews, and mismatched skills were common problems.
              </p>
              <p className="text-muted-foreground">
                For job seekers, finding positions that matched their availability and skills was equally challenging, often relying on word of mouth or generic job boards.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-medium mb-3">The Solution</h3>
              <p className="text-muted-foreground mb-4">
                In 2023, we launched StaffSpace with a simple idea: create a platform specifically designed for restaurant and hospitality hiring that addresses the unique needs of both employers and job seekers.
              </p>
              <p className="text-muted-foreground">
                By focusing on availability matching, skill verification, and streamlined communication, we created a more efficient way to connect restaurants with the right staff.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-medium mb-3">The Impact</h3>
              <p className="text-muted-foreground mb-4">
                Today, StaffSpace has helped thousands of restaurants find reliable staff and enabled countless hospitality professionals to advance their careers with positions that match their skills and schedules.
              </p>
              <p className="text-muted-foreground">
                We continue to innovate and improve our platform based on feedback from our growing community of users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Team</h2>
            <p className="text-muted-foreground md:text-lg">
              Meet the passionate people behind StaffSpace who are dedicated to transforming hospitality hiring.
            </p>
          </div>
          <div className="flex justify-center">
            {/* Founder & CEO */}
            <div className="text-center max-w-md">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                <Image
                  src="/img-1128-m9kbhsk9.jpeg"
                  alt="Gabriel Jones"
                  width={192}
                  height={192}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-medium">Gabriel Jones</h3>
              <p className="text-sm text-muted-foreground">Founder & CEO</p>
              <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                Hospitality consultant with +10 years of experience in various roles from bartending to servering. 
                I used my vast understanding of the industry and combined with what I knew about innovation to create 
                a solution to meet the needs of the industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container px-4 md:px-6">
          <div className="rounded-lg bg-card p-8 shadow-lg border">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mb-4">
                  Join the StaffSpace Community
                </h2>
                <p className="text-muted-foreground md:text-lg mb-6">
                  Whether you're looking for staff or your next job opportunity, StaffSpace is here to help you succeed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/register?type=applicant" passHref>
                    <Button size="lg" className="w-full sm:w-auto">
                      Job Seeker Sign Up
                    </Button>
                  </Link>
                  <Link href="/auth/register?type=restaurant" passHref>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Restaurant Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:pl-10">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                    <span className="text-lg font-medium">Global Reach</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Connecting restaurants and staff across major cities worldwide.
                  </p>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                    <span className="text-lg font-medium">Growing Community</span>
                  </div>
                  <p className="text-muted-foreground">
                    Join thousands of restaurants and hospitality professionals already on the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
