
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  Trash2,
  MessageSquare,
  Scale,
  Globe
} from "lucide-react";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service | StaffSpace</title>
        <meta name="description" content="StaffSpace terms of service - Please read these terms carefully before using our platform." />
      </Head>

      <div className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Terms of Service</h1>
            <p className="text-muted-foreground md:text-lg">
              Last updated: March 29, 2025
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border mb-8">
            <div className="flex items-start gap-4 mb-6">
              <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Agreement to Terms</h2>
                <p className="text-muted-foreground">
                  These Terms of Service constitute a legally binding agreement made between you and StaffSpace concerning your access to and use of our website and platform. By accessing or using StaffSpace, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">User Accounts</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <h3 className="text-xl font-medium">Account Creation</h3>
                <p className="text-muted-foreground">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>

                <h3 className="text-xl font-medium mt-6">Account Types</h3>
                <p className="text-muted-foreground">
                  StaffSpace offers two types of accounts:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Job Seeker Accounts:</strong> For individuals looking for employment in the restaurant and hospitality industry.</li>
                  <li><strong>Restaurant Accounts:</strong> For restaurants, bars, cafes, and other hospitality businesses looking to hire staff.</li>
                </ul>

                <h3 className="text-xl font-medium mt-6">Account Security</h3>
                <p className="text-muted-foreground">
                  You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Prohibited Activities</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Using the service for any illegal purpose or in violation of any local, state, national, or international law</li>
                  <li>Posting false or misleading information about yourself, your business, or job opportunities</li>
                  <li>Harassing, abusing, or threatening other users</li>
                  <li>Attempting to impersonate another user or person</li>
                  <li>Using the service in a manner inconsistent with any applicable laws or regulations</li>
                  <li>Engaging in unauthorized framing of or linking to the website</li>
                  <li>Uploading or transmitting viruses or any other type of malicious code</li>
                  <li>Interfering with, disrupting, or creating an undue burden on the service</li>
                  <li>Attempting to bypass any measures designed to prevent or restrict access to the service</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Fees and Payment</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <h3 className="text-xl font-medium">Free Services</h3>
                <p className="text-muted-foreground">
                  Basic accounts for both job seekers and restaurants are free of charge. These accounts provide limited access to our platform's features.
                </p>

                <h3 className="text-xl font-medium mt-6">Premium Services</h3>
                <p className="text-muted-foreground">
                  We offer premium features and services for both job seekers and restaurants for a fee. By selecting a premium service, you agree to pay the applicable fees as they become due. Detailed pricing information is available on our Pricing page.
                </p>

                <h3 className="text-xl font-medium mt-6">Billing</h3>
                <p className="text-muted-foreground">
                  We use a third-party payment processor to bill you through a payment account linked to your account. The processing of payments will be subject to the terms, conditions, and privacy policies of the payment processor in addition to these Terms.
                </p>

                <h3 className="text-xl font-medium mt-6">Cancellation and Refunds</h3>
                <p className="text-muted-foreground">
                  You may cancel your premium subscription at any time through your account settings. Refunds are provided in accordance with our Refund Policy, which is available on our website.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">User Content</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  Our service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the service, including its legality, reliability, and appropriateness.
                </p>
                
                <p className="text-muted-foreground">
                  By posting Content on or through the service, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>The Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms.</li>
                  <li>The posting of your Content on or through the service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.</li>
                </ul>
                
                <p className="text-muted-foreground mt-4">
                  We reserve the right to remove any Content from the service at our discretion, without prior notice, for any reason, including if we believe that such Content violates these Terms.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Termination</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                
                <p className="text-muted-foreground">
                  Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service or delete your account through the account settings.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  In no event shall StaffSpace, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Your access to or use of or inability to access or use the service;</li>
                  <li>Any conduct or content of any third party on the service;</li>
                  <li>Any content obtained from the service; and</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Governing Law</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
                </p>
                
                <p className="text-muted-foreground">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Changes to Terms</h2>
              </div>
              
              <div className="space-y-4 pl-9">
                <p className="text-muted-foreground">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
                
                <p className="text-muted-foreground">
                  By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the service.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:legal@staffspace.com" className="text-primary hover:underline">legal@staffspace.com</a></p>
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
