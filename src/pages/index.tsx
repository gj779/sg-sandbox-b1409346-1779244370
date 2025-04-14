
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Clock, MapPin, ChefHat, Star } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>StaffSpace - Connect with Restaurant Jobs</title>
        <meta name="description" content="Find restaurant jobs or hire talented staff with StaffSpace - the premier platform for hospitality recruitment." />
        <link rel="icon" href="/images/logo.svg" />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Find Your Perfect <span className="text-primary">Restaurant Job</span> or <span className="text-primary">Staff</span>
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                StaffSpace connects talented hospitality professionals with the best restaurants and venues. Whether you're looking for work or hiring staff, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/jobs" passHref>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Briefcase className="mr-2 h-4 w-4" /> Find Jobs
                  </Button>
                </Link>
                <Link href="/auth/register?type=restaurant" passHref>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <ChefHat className="mr-2 h-4 w-4" /> Hire Staff
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:pl-10 animate-slide-up">
              <div className="rounded-lg bg-card p-6 shadow-lg border">
                <h3 className="text-lg font-medium mb-4">Quick Job Search</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Job title or keyword"
                      className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Location"
                      className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <Link href="/jobs" passHref>
                    <Button className="w-full">Search Jobs</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Why Choose StaffSpace?</h2>
            <p className="text-muted-foreground md:text-lg max-w-[800px] mx-auto">
              Our platform offers specialized features for both job seekers and restaurants in the hospitality industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Specialized Job Listings</h3>
              <p className="text-muted-foreground">
                Find jobs specifically tailored to the restaurant and hospitality industry, from chefs to servers to managers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Availability Matching</h3>
              <p className="text-muted-foreground">
                Set your availability and find jobs that match your schedule, or filter candidates by when they can work.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Premium Profiles</h3>
              <p className="text-muted-foreground">
                Stand out with premium profiles and job listings that get more visibility and attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-primary/5 py-16'>
        <div className='container px-4 md:px-6'>
          <div className='rounded-lg bg-card p-8 shadow-lg border'>
            <div className='grid gap-6 lg:grid-cols-2 items-center'>
              <div>
                <h2 className='text-2xl md:text-3xl font-bold tracking-tighter mb-4'>
                  Ready to Get Started?
                </h2>
                <p className='text-muted-foreground md:text-lg mb-6'>
                  Create your account today and start connecting with restaurants or talented staff members.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link href='/auth/register?type=applicant' passHref>
                    <Button size='lg' className='w-full sm:w-auto'>
                      Job Seeker Sign Up
                    </Button>
                  </Link>
                  <Link href='/auth/register?type=restaurant' passHref>
                    <Button size='lg' variant='outline' className='w-full sm:w-auto'>
                      Restaurant Sign Up
                    </Button>
                  </Link>
                </div>
                <div className='mt-4'>
                  <Link href='/pricing' className='text-primary hover:underline'>
                    View our pricing plans →
                  </Link>
                </div>
              </div>
              <div className='lg:pl-10'>
                <div className='text-center lg:text-left'>
                  <div className='text-4xl font-bold text-primary mb-2'>10,000+</div>
                  <p className='text-muted-foreground'>Restaurant professionals already on the platform</p>
                  
                  <div className='text-4xl font-bold text-primary mt-6 mb-2'>5,000+</div>
                  <p className='text-muted-foreground'>Restaurant partners finding staff</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground md:text-lg max-w-[800px] mx-auto">
              Hear from restaurants and staff who have found success with StaffSpace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-medium">John Doe</h4>
                  <p className="text-sm text-muted-foreground">Head Chef, Found job at La Bistro</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "StaffSpace made it incredibly easy to find a new position that matched my experience and availability. Within a week of creating my profile, I had multiple interviews lined up."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">SR</span>
                </div>
                <div>
                  <h4 className="font-medium">Sarah Rodriguez</h4>
                  <p className="text-sm text-muted-foreground">Manager, Coastal Kitchen</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As a restaurant manager, finding qualified staff has always been a challenge. StaffSpace has streamlined our hiring process and helped us find reliable team members quickly."
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
