import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Share2, 
  UserCheck,
  Globe,
  Clock
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | StaffSpace</title>
        <meta name="description" content="StaffSpace privacy policy - Learn how we collect, use, and protect your personal information." />
      </Head>

      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground md:text-lg">
              Last updated: March 29, 2025
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Our Commitment to Privacy</h2>
                <p className="text-muted-foreground">
                  At StaffSpace, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Information We Collect</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <h3 className="text-xl font-medium">Personal Information</h3>
                <p className="text-muted-foreground">
                  We may collect personal information that you voluntarily provide to us when registering for our platform, expressing interest in obtaining information about us or our products and services, or otherwise contacting us. The personal information we collect may include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Job title and employer information</li>
                  <li>Resume and professional experience details</li>
                  <li>Profile pictures and other images you choose to upload</li>
                  <li>Preferences and settings</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 className="text-xl font-medium mt-6">Automatically Collected Information</h3>
                <p className="text-muted-foreground">
                  We automatically collect certain information when you visit, use, or navigate our platform. This information does not reveal your specific identity but may include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Device and usage information</li>
                  <li>IP address</li>
                  <li>Browser and device characteristics</li>
                  <li>Operating system</li>
                  <li>Language preferences</li>
                  <li>Referring URLs</li>
                  <li>Information about how and when you use our platform</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">How We Use Your Information</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We use the information we collect for various purposes, including to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Facilitate account creation and the login process</li>
                  <li>Provide, operate, and maintain our platform</li>
                  <li>Match job seekers with appropriate job listings</li>
                  <li>Help restaurants find suitable candidates</li>
                  <li>Improve, personalize, and expand our platform</li>
                  <li>Understand and analyze how you use our platform</li>
                  <li>Develop new products, services, features, and functionality</li>
                  <li>Communicate with you about updates, security alerts, and support</li>
                  <li>Send you marketing and promotional communications (with your consent)</li>
                  <li>Find and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Information Sharing and Disclosure</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We may share information in the following situations:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>With Job Seekers and Restaurants:</strong> We share profile information between job seekers and restaurants to facilitate the hiring process.</li>
                  <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us.</li>
                  <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition.</li>
                  <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Data Security</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Data Retention</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Your Privacy Rights</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>The right to access the personal information we have about you</li>
                  <li>The right to request that we correct any personal information we have about you</li>
                  <li>The right to request that we delete any personal information we have about you</li>
                  <li>The right to opt-out of marketing communications</li>
                  <li>The right to withdraw consent where we rely on consent to process your personal information</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, please contact us at privacy@staffspace.com.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">International Data Transfers</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  Our platform is operated in the United States. If you are located in other regions with laws governing data collection and use that may differ from U.S. law, please note that we may transfer information, including personal information, to a country and jurisdiction that does not have the same data protection laws as your jurisdiction.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Changes to This Privacy Policy</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions or comments about this policy, you may contact us at:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:privacy@staffspace.com" className="text-primary hover:underline">privacy@staffspace.com</a></p>
              <p><strong>Address:</strong> 123 Restaurant Row, San Francisco, CA 94103</p>
              <p><strong>Phone:</strong> +1 (800) 123-4567</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/contact">
                Contact Us With Questions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}