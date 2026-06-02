import Link from "next/link";
import Logo from '@/components/common/Logo';
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className='space-y-4'>
            <Logo showText={true} />
            <p className='text-sm text-muted-foreground'>
              Connecting talented staff with the best restaurants and hospitality venues.
            </p>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/applicant/create-resume" className="text-muted-foreground hover:text-foreground transition-colors">
                  Create Resume
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Premium Plans
                </Link>
              </li>
              <li>
                <Link href="/applicant/applications" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Applications
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-4">For Restaurants</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/restaurant/create-listing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Applicants
                </Link>
              </li>
              <li>
                <Link href="/restaurant/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Premium Plans
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2026 StaffSpace. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
