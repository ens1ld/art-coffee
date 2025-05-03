'use client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container-custom py-12">
        <h1 className="heading-2 mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="lead mb-8">
            At Art Coffee, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
          </p>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, place an order, contact us, or participate in any interactive features of our services. This may include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact information (name, email address, phone number, shipping and billing address)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (credit card details, billing information)</li>
              <li>Order history and preferences</li>
              <li>Communications you send to us</li>
              <li>Survey responses and feedback</li>
            </ul>
            <p>
              We also automatically collect certain information when you visit our website, including:
            </p>
            <ul className="list-disc pl-6">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent on the site, clicks)</li>
              <li>Location information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect for various purposes, including to:
            </p>
            <ul className="list-disc pl-6">
              <li>Process and fulfill your orders</li>
              <li>Create and manage your account</li>
              <li>Communicate with you about your orders, account, or inquiries</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Administer our loyalty program</li>
              <li>Detect and prevent fraudulent activities</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">3. Information Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc pl-6">
              <li>Service providers who perform services on our behalf</li>
              <li>Payment processors to process your payments</li>
              <li>Delivery services to fulfill your orders</li>
              <li>Marketing partners (with your consent)</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and to hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to delete your personal information</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">7. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo; date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="heading-3 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@artcoffee.com" className="text-primary">privacy@artcoffee.com</a>
              <br />
              123 Coffee Street, New York, NY 10001
              <br />
              (212) 555-1234
            </p>
          </section>
          
          <p className="text-sm text-text-secondary">
            Last updated: May 1, 2024
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 