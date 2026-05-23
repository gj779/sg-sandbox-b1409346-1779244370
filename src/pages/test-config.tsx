import { GetServerSideProps } from "next";
import Layout from "@/components/layout/Layout";

interface ConfigPageProps {
  smtpConfig: {
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    configured: boolean;
  };
}

export default function TestConfigPage({ smtpConfig }: ConfigPageProps) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">SMTP Configuration Status</h1>
        
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Overall Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              smtpConfig.configured 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {smtpConfig.configured ? "✅ Configured" : "❌ Not Configured"}
            </span>
          </div>

          <hr className="border-border" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SMTP_HOST:</span>
              <span className={`font-mono text-sm ${
                smtpConfig.SMTP_HOST !== "NOT SET" ? "text-green-600" : "text-red-600"
              }`}>
                {smtpConfig.SMTP_HOST}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SMTP_PORT:</span>
              <span className={`font-mono text-sm ${
                smtpConfig.SMTP_PORT !== "NOT SET" ? "text-green-600" : "text-red-600"
              }`}>
                {smtpConfig.SMTP_PORT}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SMTP_USER:</span>
              <span className={`font-mono text-sm ${
                smtpConfig.SMTP_USER !== "NOT SET" ? "text-green-600" : "text-red-600"
              }`}>
                {smtpConfig.SMTP_USER}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SMTP_PASSWORD:</span>
              <span className={`font-mono text-sm ${
                smtpConfig.SMTP_PASSWORD !== "NOT SET" ? "text-green-600" : "text-red-600"
              }`}>
                {smtpConfig.SMTP_PASSWORD}
              </span>
            </div>
          </div>

          <hr className="border-border" />

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What This Means:</h3>
            {smtpConfig.configured ? (
              <p className="text-sm text-muted-foreground">
                ✅ All SMTP credentials are configured. Email notifications should be sent when users submit the contact form.
              </p>
            ) : (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>❌ Email notifications are disabled because SMTP credentials are missing.</p>
                <p className="font-semibold">Missing variables:</p>
                <ul className="list-disc list-inside pl-2">
                  {smtpConfig.SMTP_USER === "NOT SET" && <li>SMTP_USER</li>}
                  {smtpConfig.SMTP_PASSWORD === "NOT SET" && <li>SMTP_PASSWORD</li>}
                  {smtpConfig.SMTP_HOST === "NOT SET" && <li>SMTP_HOST</li>}
                  {smtpConfig.SMTP_PORT === "NOT SET" && <li>SMTP_PORT</li>}
                </ul>
                <p className="mt-3">
                  To enable email notifications, add these environment variables in Vercel:
                  <br />
                  <a 
                    href="https://vercel.com/gj779/softgen-staffspace/settings/environment-variables" 
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Configure in Vercel →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <p>💡 Contact form submissions will always be saved to Firestore, regardless of email configuration.</p>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const smtpConfig = {
    SMTP_HOST: process.env.SMTP_HOST || "NOT SET",
    SMTP_PORT: process.env.SMTP_PORT || "NOT SET",
    SMTP_USER: process.env.SMTP_USER || "NOT SET",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? "SET (hidden)" : "NOT SET",
    configured: !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD),
  };

  return {
    props: {
      smtpConfig,
    },
  };
};